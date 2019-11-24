import traceback
import uuid
from os.path import join

import ffmpeg
from spleeter import *
from spleeter.separator import Separator
from spleeter.utils import *
from spleeter.audio.adapter import get_default_audio_adapter
from spleeterweb import app

class SpleeterSeparator:
    upload_folder = app.config['UPLOAD_FOLDER']
    output_folder = app.config['OUTPUT_FOLDER']

    audio_bitrate = app.config['AUDIO_BITRATE']
    audio_format = app.config['AUDIO_FORMAT']
    track_name = app.config['TRACK_NAME']

    spleeter_stem = app.config['SPLEETER_STEM']
    sample_rate = 44100

    def __init__(self):
        # Using embedded configuration.
        self.separator = Separator(self.spleeter_stem)
        self.audio_adapter = get_default_audio_adapter()

    def predict(self, filename):
        try:
            waveform, _ = self.audio_adapter.load(join(self.upload_folder, filename), sample_rate = self.sample_rate)
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            raise e
        except Exception as e:
            print(traceback.format_exc())

        prediction = self.separator.separate(waveform)
        out = prediction['vocals']
        for key in ['bass', 'other']:
            out += prediction[key]
        out /= 3

        filepath = join(self.output_folder, str(uuid.uuid4()), self.track_name + '.' + self.audio_format)
        self.audio_adapter.save(filepath, out, self.separator._sample_rate, self.audio_format, self.audio_bitrate)
        return filepath
