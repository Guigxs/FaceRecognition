console.log("in")

import * as tf from '@tensorflow/tfjs';
import cv from "./opencv"
import * as faceapi from 'face-api.js';

const model = tf.loadLayersModel("/facial_3_js/model.json").then(console.log("loaded"));

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(() => {console.log("models loaded")})

console.log("All imports loaded")

document.querySelector('#start').addEventListener('click', start)
document.querySelector('#test').addEventListener('click', test)
let video = document.getElementById("videoInput");

function test() {
    console.log("in test")
    video.width = 640;
    video.height = 480;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(async function (stream) {
        video.srcObject = stream;
        video.play();
    })
}

video.addEventListener("play", () => {
    setInterval(async () => {
        //source https://www.youtube.com/watch?v=CVClHLwv-4I
        const detections = await faceapi.detectAllFaces(video).withFaceLandmarks()
        console.log(detections)
    }, 100)
})


function start() {
    // let video = document.getElementById("videoInput");
    video.width = 640;
    video.height = 480;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {
        video.srcObject = stream;
        video.play();

        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);

        let cap = new cv.VideoCapture(video);
        const FPS = 30;
        function processVideo() {
            try {
                // if (!streaming) {
                //   // clean and stop.
                //   src.delete();
                //   dst.delete();
                //   return;
                // }
                let begin = Date.now();
                // start processing.
                cap.read(src);
                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                
                
                cv.imshow("canvasOutput", dst);
                // schedule the next one.
                let delay = 1000 / FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            } catch (err) {
                console.error(err);
            }
        }

        // schedule the first one.
        setTimeout(processVideo, 0);
    }).catch(function (err) {
        console.log("An error occurred! " + err);
    });
}