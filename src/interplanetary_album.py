#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

import ipfsapi
from flask import Flask
from flask_jsglue import JSGlue

static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
template_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'html')
app = Flask('DXToken', static_folder=static_folder, template_folder=template_folder)
jsglue = JSGlue()
jsglue.init_app(app)

daemon_result = os.popen('ipfs daemon')
api = ipfsapi.connect('127.0.0.1', 5001)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
