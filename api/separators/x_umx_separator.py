import os
import warnings
from pathlib import Path

import nnabla as nn
import numpy as np
from api.separators.util import download_and_verify
from billiard.pool import Pool
from nnabla.ext_utils import get_extension_context
from spleeter.audio.adapter import AudioAdapter
from tqdm import trange
from xumx.test import separate

MODEL_URL = 'https://nnabla.org/pretrained-models/ai-research-code/x-umx/x-umx.h5'

class XUMXSeparator:
    """Performs source separation using X-UMX API."""
    def __init__(
        self,
        cpu_separation: bool,
        bitrate=256,
        softmask=False,
        alpha=1.0,
        iterations=1
    ):
        """Default constructor.
        :param config: Separator config, defaults to None
        """
        self.model_file = 'x-umx.h5'
        self.model_dir = Path('pretrained_models')
        self.model_file_path = self.model_dir / self.model_file
        self.context = 'cpu' if cpu_separation else 'cudnn'
        self.softmask = softmask
        self.alpha = alpha
        self.iterations = iterations
        self.bitrate = f'{bitrate}k'
        self.sample_rate = 44100
        self.residual_model = False
        self.audio_adapter = AudioAdapter.default()
        self.chunk_duration = 30

    def get_estimates(self, input_path: str):
        ctx = get_extension_context(self.context)
        nn.set_default_context(ctx)
        nn.set_auto_forward(True)

        audio, _ = self.audio_adapter.load(input_path,
                                           sample_rate=self.sample_rate)

        if audio.shape[1] > 2:
            warnings.warn('Channel count > 2! '
                          'Only the first two channels will be processed!')
            audio = audio[:, :2]

        if audio.shape[1] == 1:
            print('received mono file, so duplicate channels')
            audio = np.repeat(audio, 2, axis=1)

        # Split and separate sources using moving window protocol for each chunk of audio
        # chunk duration must be lower for machines with low memory
        chunk_size = self.sample_rate * self.chunk_duration
        if (audio.shape[0] % chunk_size) == 0:
            nchunks = (audio.shape[0] // chunk_size)
        else:
            nchunks = (audio.shape[0] // chunk_size) + 1

        print('Separating...')
        estimates = {}
        for chunk_idx in trange(nchunks):
            cur_chunk = audio[chunk_idx *
                              chunk_size:min((chunk_idx + 1) *
                                             chunk_size, audio.shape[0]), :]
            cur_estimates = separate(cur_chunk,
                                     model_path=str(self.model_file_path),
                                     niter=self.iterations,
                                     alpha=self.alpha,
                                     softmask=self.softmask,
                                     residual_model=self.residual_model)
            if any(estimates) is False:
                estimates = cur_estimates
            else:
                for key in cur_estimates:
                    estimates[key] = np.concatenate(
                        (estimates[key], cur_estimates[key]), axis=0)
        return estimates

    def create_static_mix(self, parts, input_path: str, output_path: Path):
        download_and_verify(MODEL_URL, self.model_dir, self.model_file_path)
        estimates = self.get_estimates(input_path)

        final_source = None

        for name, source in estimates.items():
            if not parts[name]:
                continue
            final_source = source if final_source is None else final_source + source

        print('Writing to MP3...')
        self.audio_adapter.save(output_path, final_source, self.sample_rate, 'mp3', self.bitrate)

    def separate_into_parts(self, input_path: str, output_path: Path):
        download_and_verify(MODEL_URL, self.model_dir, self.model_file_path)
        estimates = self.get_estimates(input_path)

        # Export all source MP3s in parallel
        pool = Pool()
        tasks = []
        output_path = Path(output_path)

        for name, estimate in estimates.items():
            filename = f'{name}.mp3'
            print(f'Exporting {name} MP3...')
            task = pool.apply_async(self.audio_adapter.save, (output_path / filename, estimate, self.sample_rate, 'mp3', self.bitrate))
            tasks.append(task)

        pool.close()
        pool.join()
