#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

import ipfsapi
from PIL import Image, ImageFile
import cv2 as cv
from flask_jsglue import JSGlue
from werkzeug.utils import secure_filename
from flask import Flask, flash, request, json, send_from_directory, render_template, redirect, url_for

from src.handle_file import ensure_file_exists

static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
template_folder = os.path.join(static_folder, 'html')
app = Flask('IPAblum', static_folder=static_folder, template_folder=template_folder)
app.config.from_object('default_settings')
ImageFile.LOAD_TRUNCATED_IMAGES = True
jsglue = JSGlue()
jsglue.init_app(app)
try:
    ipfs = ipfsapi.connect('127.0.0.1', 5001)
except ipfsapi.exceptions.ConnectionError:
    print('Failed to establish a new connection to IPFS node...')
    exit(1)
album = list()


def ensure_path_exists(dir_path):
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        return True
    return False


def ensure_file_exists(file_path):
    if not os.path.exists(file_path):
        return False
    base_dir = os.path.dirname(file_path)
    ensure_path_exists(base_dir)
    with open(file_path, 'w'):
        pass
    return True


def ensure_file_not_empty(file_path):
    a = os.path.getsize(file_path)
    b = ensure_file_exists(file_path)
    if ensure_file_exists(file_path) and os.path.getsize(file_path) != 0:
        return True
    else:
        return False


def add_assets_to_ipfs():
    files = os.listdir(app.config['ASSETS_FOLDER'])
    for file in files:
        if '.jpg' in file or '.bmp' in file or '.jpeg' in file or '.png' in file:
            result = ipfs.add(os.path.join(app.config['ASSETS_FOLDER'], file))
            global album
            album.append(result)


def create_thumbnail(img_path):
    img_folder, img_file = os.path.split(img_path)
    filename, ext = os.path.splitext(img_file)
    if ext == '':
        ext = '.jpg'
    base_width = 2000
    try:
        img = Image.open(img_path)
    except OSError:
        return
    if img.size[0] <= base_width:
        img.save(os.path.join(app.config['ALBUM_FOLDER'], filename + '_thumb' + ext))
    width_percent = (base_width / float(img.size[0]))
    re_height = int((float(img.size[1]) * float(width_percent)))
    thumbnail = img.resize((base_width, re_height), Image.ANTIALIAS)
    thumbnail.save(os.path.join(app.config['ALBUM_FOLDER'], filename + '_thumb' + ext))


def convert_to_jpg(img_path):
    img_folder, img_filename = os.path.split(img_path)
    try:
        img = Image.open(img_path)
    except OSError:
        return
    img.save(''.join([img_folder, img_filename + '.jpg']))


def get_album_from_ipfs():
    global album
    for img in album:
        ipfs.get(img['Hash'], filepath=app.config['ALBUM_FOLDER'])
        img_path = os.path.join(app.config['ALBUM_FOLDER'], img['Hash'])
        if ensure_file_not_empty(img_path):
            create_thumbnail(img_path)
            convert_to_jpg(img_path)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/', methods=["GET"])
def index():
    add_assets_to_ipfs()
    return render_template('index.html')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/get_album_array')
def get_album_array():
    album_img = os.listdir(app.config['ALBUM_FOLDER'])
    get_album_from_ipfs()
    for index in range(len(album_img)):
        album_img[index] = ''.join(['/static/album/', album_img[index]])
    return json.jsonify({'result': album_img})


@app.route('/upload_file', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        add_assets_to_ipfs()
        return json.jsonify({'result': filename}), 200
    else:
        return json.jsonify({'result': 'file is not allowed'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
