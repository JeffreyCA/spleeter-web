import numpy as np
from spleeter import *
from spleeter.audio.adapter import AudioAdapter
from spleeter.separator import Separator
from spleeter.utils import *
from spleeter.audio import STFTBackend
from api.models import OutputFormat

from api.util import output_format_to_ext, is_output_format_lossy

"""
This module defines a wrapper interface over the Spleeter API.
"""

class SpleeterSeparator:
    """Performs source separation using Spleeter API."""
    def __init__(self, cpu_separation: bool, output_format=OutputFormat.MP3_256.value, with_piano: bool = False):
        """Default constructor.
        :param config: Separator config, defaults to None
        """
        self.audio_bitrate = f'{output_format}k' if is_output_format_lossy(
            output_format) else None
        self.audio_format = output_format_to_ext(output_format)
        self.sample_rate = 44100
        self.spleeter_stem = 'config/5stems-16kHz.json' if with_piano else 'config/4stems-16kHz.json'
        self.separator = Separator(self.spleeter_stem,
                                   stft_backend=STFTBackend.LIBROSA if cpu_separation else STFTBackend.TENSORFLOW,
                                   multiprocess=False)
        self.audio_adapter = AudioAdapter.default()

    def create_static_mix(self, parts, input_path, output_path):
        """Creates a static mix by performing source separation and adding the
           parts to be kept into a single track.

        :param parts: List of parts to keep
        :param input_path: Path to source file
        :param output_path: Path to output file
        :raises e: FFMPEG error
        """
        waveform, _ = self.audio_adapter.load(input_path,
                                              sample_rate=self.sample_rate)
        prediction = self.separator.separate(waveform, '')
        out = np.zeros_like(prediction['vocals'])

        # Add up parts that were requested
        for key in prediction:
            if parts[key]:
                out += prediction[key]

        self.audio_adapter.save(output_path, out, self.sample_rate,
                                self.audio_format, self.audio_bitrate)

    def separate_into_parts(self, input_path, output_path):
        """Creates a dynamic mix

        :param input_path: Input path
        :param output_path: Output path
        """
        self.separator.separate_to_file(input_path,
                                        output_path,
                                        self.audio_adapter,
                                        codec=self.audio_format,
                                        duration=None,
                                        bitrate=self.audio_bitrate,
                                        filename_format='{instrument}.{codec}',
                                        synchronous=False)
        self.separator.join(600)
