from spleeterweb import app

import sys
import os
from flask import flash, jsonify, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename

from spleeter import *
from spleeter.utils import *
from spleeter.utils.audio.adapter import get_default_audio_adapter
from spleeter.separator import Separator
from os.path import join
import traceback
import ffmpeg
import uuid

ALLOWED_EXTENSIONS = {'mp3', 'wav'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('uploaded_file',
                                    filename=filename))
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

@app.route('/predict', methods=['GET'])
def get_prediction():
    filename = request.args.get('filename')

    try:
        separator = SpleeterSeparator(filename)
        outfile = separator.predict()
        return jsonify({'output': outfile})
    except Exception as e:
        raise e

class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

class SpleeterSeparator:
    def __init__(self, filename):
        self.filename = filename
        # Using embedded configuration.
        self.separator = Separator('spleeter:4stems')
        self.audio_adapter = get_default_audio_adapter()
        self.sample_rate = 44100

        try:
            self.waveform, _ = self.audio_adapter.load(join('uploads', filename), sample_rate=self.sample_rate)
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            raise e
        except Exception as e:
            print(traceback.format_exc())

    def predict(self):
        prediction = self.separator.separate(self.waveform)
        out = prediction["vocals"]
        for key in ["bass", "other"]:
            out += prediction[key]
        out /= 3

        filepath = join('output', str(uuid.uuid4()), 'track.mp3')
        self.audio_adapter.save(filepath, out, self.separator._sample_rate, "mp3", "128k")
        return filepath
