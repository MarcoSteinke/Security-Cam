/* * * * * * * * * * * * * * * * * **/
/* required variables DO NOT CHANGE */
let video;
let detector;
let objects = [];
let latestDetections = [];

/* * * * * * * * * * * * * * * * * **/

/* user oriented variables CHANGE   */
// fill targets with labels to detect and store them
// or leave it empty to detect and store everything.
let targets = [];
DATABASE.intervalDuration = 3;
const LATEST_DETECTION_DISPLAY_COUNT = 10;

/* * * * * * * * * * * * * * * * * **/

// prepare the setup of camera and ml5 Object Detection
function preload() {
    video = createCapture(VIDEO);
    video.hide();
    detector = ml5.objectDetector('cocossd', modelLoaded);
}

// a simple method to calculate the time between two timestamps
function timeBetweenInSeconds(date, anotherDate) {
    return Math.abs(date / 1000 - anotherDate / 1000);
}

// update the header if the model is loaded
function modelLoaded() {
    //document.querySelector("#state").className = "loaded";
    //document.querySelector("#state").innerHTML = "Model loaded.";
    console.log("model loaded");
}

// setup the canvas and display the video
function setup() {
    createCanvas(800, 800);
    image(video, 0, 0);
    let defaultCam = document.querySelector("canvas");
    defaultCam.remove();
    document.querySelector("#state").appendChild(defaultCam);
    defaultCam = document.querySelector("canvas");
    defaultCam.style.margin = "auto";

}

function collectObjectsByTargets(objectCollection) {

    return objects.filter(object => targets.includes(object.label))
                  .map(targetedObject => result.push(targetedObject));
}

// try to detect any objects in the canvas
function detect() {

    // ml5 detect method returns error and result object
    detector.detect(video, (error, result) => {
        objects = result;
    });

    // if the predefined interval of seconds has passed and there are any objects, store them.
    if(timeBetweenInSeconds(Date.now(), DATABASE.lastDetection) > DATABASE.intervalDuration) {

        // If there are certain targets defined, only detect them
        if(targets.length > 0) {

            DATABASE.saveDetection(new Detection(
                DATABASE.db.length + 1, 
                collectObjectsByTargets(objects)
            ));
            
        } else {

            DATABASE.saveDetection(new Detection(
                DATABASE.db.length + 1,
                objects
            ));
        }

        // Only display a predefined amount of detections.
        if(latestDetections.length > LatestDetectionRenderer.DISPLAY_COUNT) {

            // remove the first entry
            latestDetections.shift();

        }


        latestDetections.push(

            new Detection(
                DATABASE.db.length, 
                collectObjectsByTargets(objects)
            )
        );

        LatestDetectionRenderer.showLatestDetections(latestDetections);
        
    }
}

// Simply check if the current label is defined as a target.
function isTarget(label) {

    return targets.filter(target => target == label).length > 0;
}

// method to label and mark all detections
function label() {
    if(objects && objects.length > 0) {
        objects.forEach( object => {

            // if the object is from type "TARGET" mark and label it
            if(isTarget(object.label) && targets.length > 0) {
                text(object.label, object.x, object.y - 10);
    
                stroke(0, 255, 0);
                noFill();
                rect(object.x, object.y, object.width, object.height);
                stroke(0,0,0);

            } else if(targets.length == 0) {
                text(object.label, object.x, object.y - 10);
    
                stroke(0, 255, 0);
                noFill();
                rect(object.x, object.y, object.width, object.height);
                stroke(0,0,0);
            }

        });
    }
}


// draw function will execute each tick
function draw() {

    clear();

    image(video, 0, 0);

    detect();
    label();
    
}
