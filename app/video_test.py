from imutils import face_utils
from imutils.video import VideoStream
import argparse
import imutils
import dlib
import cv2
import time
import numpy as np
from PIL import Image as im
from matplotlib import pyplot as plt
from tensorflow.keras.models import load_model

print(cv2.__version__)
emo = ['Angry', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
trainedPath = "../../shape_predictor_68_face_landmarks.dat"
model = load_model("../training/facial_1/", compile = True)

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(trainedPath)

vc = cv2.VideoCapture(0)

if vc.isOpened(): # try to get the first frame
    rval, frame = vc.read()
else:
    rval = False


j = 0
index = -1
while rval:
    j+=1
    rval, frame = vc.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)


    rects = detector(gray, 1)

    for (i, rect) in enumerate(rects):
        # determine the facial landmarks for the face region, then
        # convert the facial landmark (x, y)-coordinates to a NumPy
        # array
        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)

        # convert dlib's rectangle to a OpenCV-style bounding box
        # [i.e., (x, y, w, h)], then draw the face bounding box
        (x, y, w, h) = face_utils.rect_to_bb(rect)
        if j == 5:
            j = 0

            tl = int(y)
            bl = int(y+w)
            tr = int(x)
            br = int(x+h)

            if (tl < 0):
                tl = 0
            if (bl > gray.shape[0]):
                bl = gray.shape[0]
            if (tr < 0):
                tr = 0
            if (br > gray.shape[1]):
                br = gray.shape[1]

            face = gray[tl:bl, tr:br]
            
            face = cv2.resize(face, dsize=(48, 48), interpolation=cv2.INTER_CUBIC)
            face = face.reshape(1, 48, 48, 1)
            
            y_prob = model.predict(face, batch_size=32, verbose=0)
            index = np.argmax(y_prob)
            print(index)
            # print("Detect :", emo[index])

        cv2.rectangle(gray, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # show the face number
        cv2.putText(gray, f"Face #{i + 1}, {emo[index]}", (x - 10, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # loop over the (x, y)-coordinates for the facial landmarks
        # and draw them on the image
        # for (x, y) in shape:
        #     cv2.circle(gray, (x, y), 1, (0, 0, 255), -1)

    cv2.imshow("preview", gray)

    key = cv2.waitKey(20)
    if key == 27: # exit on ESC
        break

vc.release()
cv2.destroyWindow("preview")