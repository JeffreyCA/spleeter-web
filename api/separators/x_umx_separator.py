import os
import warnings
from pathlib import Path

import nnabla as nn
import numpy as np
from billiard.exceptions import SoftTimeLimitExceeded
from billiard.pool import Pool
from demucs.separate import download_file
from nnabla.ext_utils import get_extension_context
from spleeter.audio.adapter import AudioAdapter
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
        if cpu_separation:
            raise ValueError('X-UMX only works with GPU. Task aborted.')

        self.model_file = 'x-umx.h5'
        self.model_dir = Path('pretrained_models')
        self.model_file_path = self.model_dir / self.model_file
        self.context = 'cudnn'
        self.softmask = softmask
        self.alpha = alpha
        self.iterations = iterations
        self.bitrate = bitrate
        self.sample_rate = 44100
        self.residual_model = False
        self.audio_adapter = AudioAdapter.default()

    def download_and_verify(self):
        if not self.model_file_path.is_file():
            self.model_dir.mkdir(exist_ok=True, parents=True)
            print(
                "Downloading pre-trained model, this could take a while..."
            )
            download_file(MODEL_URL, self.model_file_path)

    def create_static_mix(self, parts, input_path: str, output_path: Path):
        self.download_and_verify()
        ctx = get_extension_context(self.context)
        nn.set_default_context(ctx)
        nn.set_auto_forward(True)

        audio, _ = self.audio_adapter.load(input_path, sample_rate=self.sample_rate)

        if audio.shape[1] > 2:
            warnings.warn('Channel count > 2! '
                        'Only the first two channels will be processed!')
            audio = audio[:, :2]

        if audio.shape[1] == 1:
            # if we have mono, let's duplicate it
            # as the input of OpenUnmix is always stereo
            print('received mono file, so duplicate channels')
            audio = np.repeat(audio, 2, axis=1)

        print('Separating...')
        estimates = separate(audio,
                             model_path=str(self.model_file_path),
                             niter=self.iterations,
                             alpha=self.alpha,
                             softmask=self.softmask,
                             residual_model=self.residual_model)

        final_source = None

        for name, source in estimates.items():
            if not parts[name]:
                continue
            final_source = source if final_source is None else final_source + source

        print('Writing to MP3...')
        self.audio_adapter.save(output_path, final_source, self.sample_rate, 'mp3', self.bitrate)

    def separate_into_parts(self, input_path: str, output_path: Path):
        self.download_and_verify()

        ctx = get_extension_context(self.context)
        nn.set_default_context(ctx)
        nn.set_auto_forward(True)

        audio, _ = self.audio_adapter.load(input_path, sample_rate=self.sample_rate)

        if audio.shape[1] > 2:
            warnings.warn('Channel count > 2! '
                        'Only the first two channels will be processed!')
            audio = audio[:, :2]

        if audio.shape[1] == 1:
            print('received mono file, so duplicate channels')
            audio = np.repeat(audio, 2, axis=1)

        print('Separating...')
        estimates = separate(audio,
                             model_path=str(self.model_file_path),
                             niter=self.iterations,
                             alpha=self.alpha,
                             softmask=self.softmask,
                             residual_model=self.residual_model)

        output_path = Path(output_path)

        # Export all source MP3s in parallel
        pool = Pool()
        tasks = []

        for name, estimate in estimates.items():
            filename = f'{name}.mp3'
            print(f'Exporting {name} MP3...')
            task = pool.apply_async(self.audio_adapter.save, (os.path.join(
                output_path,
                filename), estimate, self.sample_rate, 'mp3', self.bitrate))
            tasks.append(task)

        pool.close()
        pool.join()
