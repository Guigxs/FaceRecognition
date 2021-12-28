# FaceRecognition

## Ressources

### Trained models

In order to detect the different faces on the image we used a trained model provided in a JavaScript API called [face-api.js](https://github.com/justadudewhohacks/face-api.js/).

For emotional detection we trained a model based on an existing classification [project](https://www.kaggle.com/ashishpatel26/tutorial-facial-expression-classification-keras/notebook). We train our model with the [FER2018](https://www.kaggle.com/ashishpatel26/fer2018) dataset and tensorflow.

### Detection

For the detection we used a node module called [Parcel](https://parceljs.org/docs/) for packaging the app and loading our different libraries: 
- [Tensorflow.js](https://www.tensorflow.org/js) for the prediction
- [face-api.js](https://github.com/justadudewhohacks/face-api.js/) for face detection


## Run

For running the project run the following command in the folder *app/web/* :

```
$ npm run start
```

## Build
For building the project run the following command in the folder *app/web/* :

```
$ npm run build
```
