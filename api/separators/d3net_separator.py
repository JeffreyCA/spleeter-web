import os
import shutil
import tempfile
from pathlib import Path

import nnabla as nn
import numpy as np
import requests
import yaml
from api.separators.util import download_and_verify
from billiard.pool import Pool
from d3net.filter import apply_mwf
from d3net.separate import get_extension_context
from d3net.util import generate_data, model_separate, stft2time_domain
from django.conf import settings
from nnabla.ext_utils import get_extension_context
from spleeter.audio.adapter import AudioAdapter

from .d3net_openvino import D3NetOpenVinoWrapper

MODEL = {
    'url': 'https://nnabla.org/pretrained-models/ai-research-code/d3net/mss/d3net-mss.zip',
    'file': 'd3net-mss.zip',
    'sha1': 'ada6858b467628f2f57489f0e862982aeb87942c',
    'path': Path('pretrained_models', 'd3net')
}

OPENVINO_MODEL = {
    'url': 'https://nnabla.org/pretrained-models/ai-research-code/d3net/mss/d3net-openvino.zip',
    'file': 'd3net-openvino.zip',
    'sha1': 'adc927046ce2ddaeb32d53b7adf2bc34cdc3376b',
    'path': Path('pretrained_models', 'd3net-openvino')
}

"""
This module reimplements part of d3net's source separation code from https://github.com/sony/ai-research-code/blob/master/d3net/music-source-separation/separate.py which is under copyright by Sony Corporation under the terms of the Apache license.
"""

class D3NetSeparator:
    """Performs source separation using D3Net API."""
    def __init__(self, cpu_separation: bool, bitrate=256):
        """Default constructor.
        :param config: Separator config, defaults to None
        """
        if cpu_separation and settings.D3NET_OPENVINO:
            self.model_url = OPENVINO_MODEL['url']
            self.model_dir = OPENVINO_MODEL['path']
            self.model_sha1 = OPENVINO_MODEL['sha1']
            self.model_file = OPENVINO_MODEL['file']
        else:
            self.model_url = MODEL['url']
            self.model_dir = MODEL['path']
            self.model_sha1 = MODEL['sha1']
            self.model_file = MODEL['file']

        self.model_file_path = self.model_dir / self.model_file
        self.context = 'cpu' if cpu_separation else 'cudnn'
        self.bitrate = f'{bitrate}k'
        self.sample_rate = 44100
        self.audio_adapter = AudioAdapter.default()

    def get_estimates(self,
                      input_path: str,
                      parts,
                      fft_size=4096,
                      hop_size=1024,
                      n_channels=2,
                      apply_mwf_flag=True,
                      ch_flip_average=False):
        # Set NNabla extention
        ctx = get_extension_context(self.context)
        nn.set_default_context(ctx)

        # Load the model weights
        nn.load_parameters(str(self.model_file_path))

        # Read file locally
        if settings.DEFAULT_FILE_STORAGE == 'api.storage.FileSystemStorage':
            _, inp_stft = generate_data(input_path, fft_size, hop_size,
                                        n_channels, self.sample_rate)
        else:
            # If remote, download to temp file and load audio
            fd, tmp_path = tempfile.mkstemp()
            try:
                r_get = requests.get(input_path)
                with os.fdopen(fd, 'wb') as tmp:
                    tmp.write(r_get.content)

                _, inp_stft = generate_data(tmp_path, fft_size, hop_size,
                                            n_channels, self.sample_rate)
            finally:
                # Remove temp file
                os.remove(tmp_path)

        out_stfts = {}
        estimates = {}
        inp_stft_contiguous = np.abs(np.ascontiguousarray(inp_stft))

        if settings.D3NET_OPENVINO:
            print(
                f'Using OpenVINO with {settings.D3NET_OPENVINO_THREADS} threads'
            )

        # Need to compute all parts even for static mix, for mwf?
        for part in parts:
            print(f'Processing {part}...')

            with open('./config/d3net/{}.yaml'.format(part)) as file:
                # Load part specific Hyper parameters
                hparams = yaml.load(file, Loader=yaml.FullLoader)

            if settings.D3NET_OPENVINO:
                d3netwrapper = D3NetOpenVinoWrapper(self.model_dir, part, settings.D3NET_OPENVINO_THREADS)
                out_sep = model_separate(inp_stft_contiguous,
                                         hparams,
                                         ch_flip_average=ch_flip_average,
                                         openvino_wrapper=d3netwrapper)
            else:
                nn.load_parameters(f"{(self.model_dir / part)}.h5")
                with nn.parameter_scope(part):
                    out_sep = model_separate(inp_stft_contiguous,
                                             hparams,
                                             ch_flip_average=ch_flip_average)

            out_stfts[part] = out_sep * np.exp(1j * np.angle(inp_stft))

        if apply_mwf_flag:
            out_stfts = apply_mwf(out_stfts, inp_stft)

        for part, output in out_stfts.items():
            if not parts[part]:
                continue
            estimates[part] = stft2time_domain(output, hop_size, True)

        return estimates

    def create_static_mix(self, parts, input_path: str, output_path: Path):
        download_and_verify(self.model_url, self.model_sha1, self.model_dir,
                            self.model_file_path)
        shutil.unpack_archive(self.model_file_path, self.model_dir)

        estimates = self.get_estimates(input_path, parts)

        final_source = None

        for name, source in estimates.items():
            if not parts[name]:
                continue
            final_source = source if final_source is None else final_source + source

        print('Writing to MP3...')
        self.audio_adapter.save(output_path, final_source, self.sample_rate,
                                'mp3', self.bitrate)

    def separate_into_parts(self, input_path: str, output_path: Path):
        download_and_verify(self.model_url, self.model_sha1, self.model_dir,
                            self.model_file_path)
        shutil.unpack_archive(self.model_file_path, self.model_dir)

        parts = {'vocals': True, 'drums': True, 'bass': True, 'other': True}

        estimates = self.get_estimates(input_path, parts)

        # Export all source MP3s in parallel
        pool = Pool()
        tasks = []
        output_path = Path(output_path)

        for name, estimate in estimates.items():
            filename = f'{name}.mp3'
            print(f'Exporting {name} MP3...')
            task = pool.apply_async(self.audio_adapter.save,
                                    (output_path / filename, estimate,
                                     self.sample_rate, 'mp3', self.bitrate))
            tasks.append(task)

        pool.close()
        pool.join()
