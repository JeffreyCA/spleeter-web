import gc
from pathlib import Path

import torch

from billiard.exceptions import SoftTimeLimitExceeded
from billiard.pool import Pool
from demucs.pretrained import get_model, ModelLoadingError
from demucs.separate import *
from django.conf import settings
from spleeter.audio.adapter import AudioAdapter

"""
This module defines a wrapper interface over the Demucs API.
"""

class DemucsSeparator:
    """Performs source separation using Demucs API."""
    def __init__(self,
                 model_name='mdx_extra_q',
                 cpu_separation=True,
                 bitrate=256,
                 shifts=5):
        self.device = 'cpu' if cpu_separation else 'cuda'
        self.sample_rate = 44100
        self.model_name = model_name
        self.repo = None
        self.model_dir = Path('pretrained_models')
        self.shifts = shifts
        self.split = True
        self.overlap = 0.25
        self.verbose = True
        self.bitrate = f'{bitrate}k'
        self.audio_adapter = AudioAdapter.default()

    def get_model(self):
        torch.hub.set_dir(str(self.model_dir))
        try:
            model = get_model(self.model_name, self.repo)
        except ModelLoadingError as error:
            fatal(error.args[0])

        if isinstance(model, BagOfModels):
            print(f"Selected model is a bag of {len(model.models)} models. "
                "You will see that many progress bars per track.")

        model.cpu()
        model.eval()
        return model

    def apply_model(self, model, input_path: Path):
        """Applies model to waveform file"""
        print(f"Separating track {input_path}")
        wav = load_track(input_path, self.device, model.audio_channels,
                         model.samplerate)
        wav = wav.cpu()

        ref = wav.mean(0)
        wav = (wav - ref.mean()) / ref.std()
        raw_sources = apply_model(model,
                              wav[None],
                              # device=self.device,
                              shifts=self.shifts,
                              split=self.split,
                              overlap=self.overlap,
                              progress=True)[0]
        raw_sources = raw_sources * ref.std() + ref.mean()

        if not settings.CPU_SEPARATION:
            del model
            torch.cuda.empty_cache()
            gc.collect()
        return raw_sources

    def create_static_mix(self, parts, input_path: str, output_path: Path):
        """Creates a static mix by performing source separation and adding the
           parts to be kept into a single track.

        :param parts: List of parts to keep ('vocals', 'drums', 'bass', 'other')
        :param input_path: Path to source file
        :param output_path: Path to output file
        """
        input_path = Path(input_path)
        model = self.get_model()

        raw_sources = self.apply_model(model, input_path)

        final_source = None

        for source, name in zip(raw_sources,
                                ['drums', 'bass', 'other', 'vocals']):
            if not parts[name]:
                continue

            final_source = source if final_source is None else final_source + source

        final_source = final_source.cpu().transpose(0, 1).numpy()

        print('Exporting MP3...')
        self.audio_adapter.save(output_path, final_source, self.sample_rate,
                                'mp3', self.bitrate)


    def separate_into_parts(self, input_path: str, output_path: str):
        """Creates a dynamic mix

        :param input_path: Input path
        :param output_path: Output path
        """
        input_path = Path(input_path)
        output_path = Path(output_path)

        model = self.get_model()
        raw_sources = self.apply_model(model, input_path)

        # Export all source MP3s in parallel
        pool = Pool()
        tasks = []

        for source, name in zip(raw_sources,
                                ['drums', 'bass', 'other', 'vocals']):

            source = source.cpu().transpose(0, 1).numpy()
            filename = f'{name}.mp3'

            print(f'Exporting {name} MP3...')
            task = pool.apply_async(self.audio_adapter.save,
                                    (output_path / filename, source,
                                     self.sample_rate, 'mp3', self.bitrate))
            tasks.append(task)

        try:
            pool.close()
            pool.join()
        except SoftTimeLimitExceeded as e:
            pool.terminate()
            raise e
