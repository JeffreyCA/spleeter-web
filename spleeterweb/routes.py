import os
import sys
import traceback
import uuid
from os.path import join

import ffmpeg
from flask import (flash, json, jsonify, redirect, request,
                   send_from_directory, url_for)
from pathvalidate import is_valid_filename
from spleeter.separator import Separator
from spleeter.utils import *
from spleeter.audio.adapter import get_default_audio_adapter
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename

from spleeterweb import app, celery

from .spleeterseparator import *
from celery import Celery, Task

ALLOWED_EXTENSIONS = {'mp3', 'wav'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class PredictTask(Task):
    def __init__(self):
        self.separator = SpleeterSeparator()

@celery.task(base=PredictTask)
def make_prediction(filename):
    sep = make_prediction.separator
    outfile = sep.predict(filename)
    return outfile

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
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/predict', methods=['GET'])
def get_prediction():
    filename = request.args.get('filename')

    if (not is_valid_filename(filename)):
        raise InvalidArgument(f'Invalid filename: {filename}')
    try:
        result = make_prediction.delay(filename)
        outfile = result.get()
        return jsonify({ 'outfile': outfile })
    except Exception as e:
        raise e

class InvalidArgument(Exception):
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

    def __str__(self):
        return self.message

@app.errorhandler(HTTPException)
def handle_httpexception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return e

    if isinstance(e, ffmpeg._run.Error):
        stderr_log = e.stderr.decode('utf8')
        last_line = stderr_log.splitlines()[-1]
        return jsonify({'message': last_line})

    return jsonify({'message': str(e)})
