from pathlib import Path

from demucs.separate import *

"""
This module defines a wrapper interface over the Demucs API.
"""

VALID_MODELS = ['demucs', 'demucs_extra', 'light', 'light_extra', 'tasnet', 'tasnet_extra']

class DemucsSeparator:
    """Performs source separation using Demucs API."""
    def __init__(self, model_name='light_extra', shifts=5):
        assert(model_name in VALID_MODELS)
        self.device = 'cpu'
        self.model_name = model_name
        self.model_file = f'{model_name}.th'
        self.model_dir = Path('pretrained_models')
        self.model_file_path = self.model_dir / self.model_file
        self.shifts = shifts
        self.split = True
        self.verbose = True

    def download_and_verify(self):
        sha256 = PRETRAINED_MODELS.get(self.model_file)

        if not self.model_file_path.is_file():
            if sha256 is None:
                raise Exception(f"No pretrained model {self.model_file}")

            self.model_dir.mkdir(exist_ok=True, parents=True)
            url = BASE_URL + self.model_file
            print(
                "Downloading pre-trained model weights, this could take a while..."
            )
            print('URL:', url)
            print('Model file path:', self.model_file_path)
            download_file(url, self.model_file_path)

        if sha256 is not None:
            verify_file(self.model_file_path, sha256)

    def apply_model(self, input_path: Path):
        """Applies model to waveform file"""
        model = load_model(self.model_file_path).to(self.device)
        print(f"Separating track {input_path}")
        wav = AudioFile(input_path).read(streams=0,
                                         samplerate=44100,
                                         channels=2).to(self.device)
        # Round to nearest short integer for compatibility with how MusDB load audio with stempeg.
        wav = (wav * 2**15).round() / 2**15
        ref = wav.mean(0)
        wav = (wav - ref.mean()) / ref.std()
        raw_sources = apply_model(model,
                                  wav,
                                  shifts=self.shifts,
                                  split=self.split,
                                  progress=True)
        raw_sources = raw_sources * ref.std() + ref.mean()
        return raw_sources

    def create_static_mix(self, parts, input_path: str, output_path: Path):
        """Creates a static mix by performing source separation and adding the
           parts to be kept into a single track.

        :param parts: List of parts to keep ('vocals', 'drums', 'bass', 'other')
        :param input_path: Path to source file
        :param output_path: Path to output file
        """
        input_path = Path(input_path)
        self.download_and_verify()
        raw_sources = self.apply_model(input_path)

        final_source = None

        for source, name in zip(raw_sources,
                                ['drums', 'bass', 'other', 'vocals']):
            if not parts[name]:
                continue

            final_source = source if final_source is None else final_source + source

        final_source = (final_source * 2**15).clamp_(-2**15, 2**15 - 1).short()
        final_source = final_source.cpu().transpose(0, 1).numpy()

        encode_mp3(final_source, str(output_path), verbose=self.verbose)

    def separate_into_parts(self, input_path: str, output_path: str):
        """Creates a dynamic mix

        :param input_path: Input path
        :param output_path: Output path
        """
        input_path = Path(input_path)
        output_path = Path(output_path)
        self.download_and_verify()
        raw_sources = self.apply_model(input_path)

        for source, name in zip(raw_sources,
                                ['drums', 'bass', 'other', 'vocals']):
            source = (source * 2**15).clamp_(-2**15, 2**15 - 1).short()
            source = source.cpu().transpose(0, 1).numpy()
            filename = f'{name}.mp3'

            encode_mp3(source,
                       str(output_path / filename),
                       verbose=self.verbose)
            print(f'Finished {name}')
