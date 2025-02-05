#!/bin/bash
apt-get update && apt-get install -y libgl1-mesa-glx
gunicorn -w 4 -b 0.0.0.0:5000 app:app
