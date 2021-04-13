"""Server side API"""

import json
import os
import fnmatch
#from osgeo import gdal, osr
#from PIL import Image
#from flask import Flask, request, send_file, make_response, render_template
import time
from flask import Flask, request
from flask_cors import CORS, cross_origin
#from werkzeug.utils import secure_filename

app = Flask(__name__)
cors = CORS(app, resources={r"/files": {"origins": "http://127.0.0.1:3000"}})

FILE_START_PATH = os.path.abspath(os.path.dirname(__file__))

def normalizePath(path: str) -> str:
    """Normalizes the path to the current OS separator character
    Arguments:
        path: the path to localize
    Return:
        Returns the localized path, which may be unchanged
    """
    if os.path.sep == '/':
        to_replace = '\\'
    else:
        to_replace = '/'

    parts = path.split(to_replace)
    if len(parts) <= 1:
        return os.path.sep.join(parts)

    # Strip out doubled up separators
    new_parts = [one_part for one_part in parts if len(parts) > 0]
    return os.path.sep.join(parts)


@app.route('/server/files', methods=['GET'])
#@cross_origin()
@cross_origin(origin='127.0.0.1:3000', headers=['Content-Type','Authorization'])
def files() -> tuple:
    """Handles listing folder contents
    Arguments:
        path: the relative path to list
        file_filter: the filter to apply to the returned names
    """
    return_names = []
    have_error = False

    path = request.args['path']
    file_filter = request.args['filter']

    if len(path) <= 0:
        print('Zero length path requested' % path, flush=True)
        return 'Resource not found', 400

    try:
        working_path = normalizePath(path);
        if working_path[0] == '/':
            working_path = '.'  + working_path;
        cur_path = os.path.abspath(os.path.join(FILE_START_PATH, working_path))
        if not cur_path.startswith(FILE_START_PATH):
            print('Invalid path requested: "%s"' % path, flush=True)
            return 'Resource not found', 400
    except FileNotFoundError as ex:
        print("A file not found exception was caught:",  ex)
        have_error = true;

    if have_error:
        return 'Resource not found', 400

    for one_file in os.listdir(cur_path):
        file_path = os.path.join(cur_path, one_file)
        if not one_file[0] == '.' and (not file_filter or (file_filter and fnmatch.fnmatch(one_file, file_filter))):
            return_names.append({'name': one_file,
                                 'path': os.path.join(path, one_file),
                                 'size': os.path.getsize(file_path),
                                 'date': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(os.path.getmtime(file_path))),
                                 'type': 'folder' if os.path.isdir(file_path) else 'file'
                                 })

    return json.dumps(return_names)


if __name__ == '__main__':
    app.run(debug=False)
