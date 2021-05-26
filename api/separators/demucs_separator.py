import gc
from pathlib import Path

import torch
from billiard.exceptions import SoftTimeLimitExceeded
from billiard.pool import Pool
from demucs.pretrained import load_pretrained
from demucs.separate import *
from django.conf import settings
from spleeter.audio.adapter import AudioAdapter

"""
This module defines a wrapper interface over the Demucs API.
"""

VALID_MODELS = [
    'demucs', 'demucs_extra', 'light', 'light_extra', 'tasnet', 'tasnet_extra'
]

class DemucsSeparator:
    """Performs source separation using Demucs API."""
    def __init__(
        self,
        model_name='light_extra',
        cpu_separation=True,
        bitrate=256,
        shifts=5
    ):
        assert (model_name in VALID_MODELS)
        model_name = 'demucs48_hq'
        self.device = 'cpu' if cpu_separation else 'cuda'
        self.sample_rate = 44100
        self.model_name = model_name
        self.model_file = f'{model_name}.th'
        self.model_dir = Path('pretrained_models')
        self.model_file_path = self.model_dir / self.model_file
        self.shifts = shifts
        self.split = True
        self.overlap = 0.25
        self.verbose = True
        self.bitrate = bitrate
        self.audio_adapter = AudioAdapter.default()

    def get_model(self):
        torch.hub.set_dir(str(self.model_dir))
        if self.model_file_path.is_file():
            model = load_model(self.model_file_path)
        else:
            model = load_pretrained(self.model_name)
        model.to(self.device)

        return model

    def apply_model(self, model, input_path: Path):
        """Applies model to waveform file"""
        print(f"Separating track {input_path}")
        wav = AudioFile(input_path).read(streams=0,
                                         samplerate=self.sample_rate,
                                         channels=2).to(self.device)
        # Round to nearest short integer for compatibility with how MusDB load audio with stempeg.
        wav = (wav * 2**15).round() / 2**15
        ref = wav.mean(0)
        wav = (wav - ref.mean()) / ref.std()
        raw_sources = apply_model(model,
                                  wav,
                                  shifts=self.shifts,
                                  split=self.split,
                                  overlap=self.overlap,
                                  progress=True)
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
