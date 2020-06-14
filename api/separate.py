import ffmpeg
import numpy as np
from spleeter import *
from spleeter.audio.adapter import get_default_audio_adapter
from spleeter.separator import Separator
from spleeter.utils import *

class SpleeterSeparator:
    """Performs source separation using Spleeter API."""
    def __init__(self, config=None):
        """Default constructor.

        :param config: Separator config, defaults to None
        """
        if config is None:
            self.audio_bitrate = '256k'
            self.audio_format = 'mp3'
            self.sample_rate = 44100
            self.spleeter_stem = 'config/4stems-16kHz.json'
        else:
            self.audio_bitrate = config['audio_bitrate']
            self.audio_format = config['audio_format']
            self.sample_rate = config['sample_rate']
            self.spleeter_stem = config['spleeter_stem']
        # Use librosa backend as it is less memory intensive
        self.separator = Separator(self.spleeter_stem, stft_backend='librosa', multiprocess=False)
        self.audio_adapter = get_default_audio_adapter()

    def separate(self, parts, input_path, output_path):
        """Performs source separation by adding together the parts to be kept.

        :param parts: List of parts to keep ('vocals', 'drums', 'bass', 'other')
        :param input_path: Path to source file
        :param output_path: Path to output file
        :raises e: FFMPEG error
        """
        waveform, _ = self.audio_adapter.load(input_path, sample_rate=self.sample_rate)
        prediction = self.separator.separate(waveform)
        out = np.zeros_like(prediction['vocals'])
        part_count = 0

        # Add up parts that were requested
        for key in prediction:
            if parts[key]:
                out += prediction[key]
                part_count += 1
        out /= part_count
        self.audio_adapter.save(output_path, out, self.separator._sample_rate, self.audio_format, self.audio_bitrate)
