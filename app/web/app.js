import * as tf3 from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';

const emo = ['Angry', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
const emoji = ["😡", "😨", "😀", "🙁", "😲", "😐"]

let model;
tf3.loadLayersModel("./facial_3_js/model.json").then(val => model = val).catch((err)=>console.log(err));

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
  ]).then(() => {console.log("models loaded")}).catch((err)=>console.log(err))

console.log("All imports loaded")

document.querySelector('#start').addEventListener('click', start)
document.querySelector('#stop').addEventListener('click', stop)
let video = document.getElementById("videoInput");
const canvas = document.getElementById("canvasOutput");
let detectionInterval;

function stop() {
    console.log("Stopping video")
    video.pause()
    clearInterval(detectionInterval)
}

video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    detectionInterval = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      let faces = await extractAllFaces(video, resizedDetections)
      
      faces.forEach(({zone, position, landmarks}) => {
        let resizedImg = tf3.browser.fromPixels(zone).resizeBilinear([48,48]).mean(2).toFloat().expandDims(0).expandDims(-1)
        let prediction = model.predict(resizedImg, {batch_size:32})
        let arrayPrediction = prediction.arraySync()[0]
        let ctx = canvas.getContext('2d');

        drawEmoji(ctx, arrayPrediction, position, landmarks)
      })

    }, 1000)
  })

function start() {
    video.width = 640;
    video.height = 480;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {
        video.srcObject = stream;
        video.play();

    }).catch(function (err) {
        console.log("An error occurred! " + err);
    });
}

async function extractAllFaces(inputImage, detections){
  const regionsToExtract = [];
  
  detections.forEach(value => {
    regionsToExtract.push(new faceapi.Rect(value.detection.box.x, value.detection.box.y, value.detection.box.width, value.detection.box.height));
  })

  let faceImages = await faceapi.extractFaces(inputImage, regionsToExtract)
  faceImages = faceImages.map(x => {
    let i = faceImages.indexOf(x);
    return({zone: x, position:detections[i].detection.box, landmarks:detections[i].landmarks.positions});
  });

  if (faceImages.length == 0){
    console.log("no faces");
    return null;
  }
  else {
    return faceImages;
  }
}

function drawEmoji(ctx, arrayPrediction, position, landmarks){
  // Get 2 noze points
  let top_noze = landmarks[27]
  let bottom_noze = landmarks[30]
  // TOA from the top angle 
  let a = bottom_noze.y - top_noze.y
  let o = top_noze.x - bottom_noze.x
  let rot = Math.atan(o/a) 

  // x, y = face detection position 
  let x = (position.x + position.width/2)
  let y = (position.y + position.height/2)
  // Drawing the emoji
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.translate(-x, -y);
  ctx.font =`${position.width}px Arial`;
  ctx.fillText(emoji[arrayPrediction.indexOf(Math.max(...arrayPrediction))], x-position.width/2, y+position.height/4);
  ctx.translate(x, y);
  ctx.rotate(-rot);
  ctx.translate(-x, -y);
}