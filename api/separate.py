import traceback
import uuid
from os.path import join

import ffmpeg
import numpy as np
from spleeter import *
from spleeter.utils import *
from spleeter.audio.adapter import get_default_audio_adapter

from .separator import Separator

class SpleeterSeparator:
    def __init__(self, config=None):
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
        self.separator = Separator(self.spleeter_stem, stft_backend='librosa', multiprocess=False)
        self.audio_adapter = get_default_audio_adapter()

    def predict(self, parts, input_path, output_path):
        try:
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
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            raise e
