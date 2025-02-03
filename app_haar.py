import os
import cv2
import numpy as np
from flask import Flask, request, Response, render_template
from flask_cors import CORS

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Load Haar cascade models for face and eye detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

@app.route('/')
def index():
    """Render the frontend page"""
    return render_template("index.html")

@app.route('/upload', methods=['POST'])
def upload():
    """Receive image, process it to grayscale, detect eyes, and return the modified image"""
    file = request.files['file'].read()
    nparr = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_img = cv2.cvtColor(gray_img, cv2.COLOR_GRAY2BGR)  # Convert back to 3-channel grayscale

    # Detect faces in grayscale image
    faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        roi_gray = gray_img[y:y+h, x:x+w]

        # Detect eyes within the detected face
        eyes = eye_cascade.detectMultiScale(roi_gray)
        for (ex, ey, ew, eh) in eyes:
            center = (x + ex + ew // 2, y + ey + eh // 2)
            radius = max(ew, eh) // 2
            cv2.circle(gray_img, center, radius, (0, 0, 0), -1)  # Draw black circles over eyes

    # Encode and return the grayscale processed image
    _, img_encoded = cv2.imencode('.jpg', gray_img)
    return Response(img_encoded.tobytes(), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
