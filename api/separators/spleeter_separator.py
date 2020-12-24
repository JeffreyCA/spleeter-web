import ffmpeg
import numpy as np
from spleeter import *
from spleeter.audio.adapter import get_default_audio_adapter
from spleeter.separator import Separator
from spleeter.utils import *

"""
This module defines a wrapper interface over the Spleeter API.
"""

class SpleeterSeparator:
    """Performs source separation using Spleeter API."""
    def __init__(self, config=None):
        """Default constructor.
        :param config: Separator config, defaults to None
        """
        if config is None:
            self.audio_bitrate = '320k'
            self.audio_format = 'mp3'
            self.sample_rate = 44100
            self.spleeter_stem = 'config/4stems-16kHz.json'
        else:
            self.audio_bitrate = config['audio_bitrate']
            self.audio_format = config['audio_format']
            self.sample_rate = config['sample_rate']
            self.spleeter_stem = config['spleeter_stem']
        # Use librosa backend as it is less memory intensive
        self.separator = Separator(self.spleeter_stem,
                                   stft_backend='librosa',
                                   multiprocess=False)
        self.audio_adapter = get_default_audio_adapter()

    def create_static_mix(self, parts, input_path, output_path):
        """Creates a static mix by performing source separation and adding the
           parts to be kept into a single track.

        :param parts: List of parts to keep ('vocals', 'drums', 'bass', 'other')
        :param input_path: Path to source file
        :param output_path: Path to output file
        :raises e: FFMPEG error
        """
        waveform, _ = self.audio_adapter.load(input_path,
                                              sample_rate=self.sample_rate)
        prediction = self.separator.separate(waveform)
        out = np.zeros_like(prediction['vocals'])
        part_count = 0

        # Add up parts that were requested
        for key in prediction:
            if parts[key]:
                out += prediction[key]
                part_count += 1

        self.audio_adapter.save(output_path, out, self.separator._sample_rate,
                                self.audio_format, self.audio_bitrate)

    def separate_into_parts(self, input_path, output_path):
        """Creates a dynamic mix

        :param input_path: Input path
        :param output_path: Output path
        """
        self.separator.separate_to_file(input_path,
                                        output_path,
                                        self.audio_adapter,
                                        codec='mp3',
                                        bitrate=self.audio_bitrate,
                                        filename_format='{instrument}.{codec}',
                                        synchronous=False)
        self.separator.join(600)
