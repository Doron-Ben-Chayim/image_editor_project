// Set Variables
let selectedArea = false;
let placeImageCanvas = false;
let imageData;
let imageDataHeight;
let imageDataWidth;
let secondDropDownChoice = "";
let savedInitialImage = false;
let initialImage = document.getElementById("mainImage").src;
let usedAspectRatio = false;
let aspectRatio;
let selectedImageWidth; 
let selectedImageHeight;
let selectedRotateAngle = 45;
let currentColourScheme = 'rgbColour';
let desiredColorScheme = 'rgbColour';
let tempCurrentColourScheme;
let selectedSimpleThresholdMethod;
let thresholdValue = 127;
let thresholdMax = 255;
let translateDistances = [50,30];
let affineTransformChoices = [45,1.5];
let adaptiveParamaters = []
let selectedKernel;
let morphSelection;
let contourFeatureSelection;
let contourBoundingBoxSelection;
let fftFilterSelection;
let selectedEdgeDetection;
let clusterSeg;
let binClassModel;
let entireImageData;
let objDetModel;
let clickedimageProcess;
let clickedBinModel;
let mainImageElement;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Updates the Main Image to return to when Reset Chosen
function setNewInitialImage() {
  // Save the initial image to be used when user clicks Reset Image
  mainImageElement = document.getElementById("mainImage");  
  initialImage = mainImageElement.src;
  savedInitialImage = true
  currentColourScheme = 'rgbColour'
  }

  function getUploadFile(event, callback) {
  // Get the uploaded file
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
          // Set the maximum width and height for the resized image
          var maxWidth = 800;
          var maxHeight = 600;

          // Calculate the aspect ratio of the image
          aspectRatio = img.width / img.height;
          usedAspectRatio = true;
          // Calculate new dimensions while maintaining aspect ratio
          var newWidth = Math.min(img.width, maxWidth);
          var newHeight = newWidth / aspectRatio;

          // Check if the new height exceeds the maxHeight
          if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = newHeight * aspectRatio;
          }

          // Create a canvas element
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          // Set the canvas dimensions to the new dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw the image onto the canvas with the new dimensions
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Get the data URL of the resized image
          var resizedImageDataUrl = canvas.toDataURL('image/jpeg');
          console.log("resizedImageDataUrl",resizedImageDataUrl);

          // Update the source (src) of the image element with the resized image
          console.log('SET NEW MAIN IMAGE')
          document.getElementById('mainImage').src = resizedImageDataUrl;
          // Call the callback function, if provided, indicating image processing is complete
          if (callback && typeof callback === 'function') {
            callback();
          }
          // Additional actions after setting the resized image
          setNewInitialImage();
      };

      // Set the source of the image to the data URL
      img.src = e.target.result;
  };

// Read the selected file as a data URL
reader.readAsDataURL(selectedFile);
}
  
// Functions to upload a new file
document.getElementById('imageUpload').addEventListener('change', function (event) {
  // Remove & Reset all previous Activity
  uploadRemoves(); 
  getUploadFile(event);
});

// Functions to upload a new file
document.getElementById('predImageUploadForm').addEventListener('change', function (event) {
  console.log('UPLOADED NEW IMAGE');

  // Call getUploadFile and provide a callback to sendPredImage
  getUploadFile(event, function() {
    sendPredImage(clickedimageProcess);
  });
});


function getImageParams() {
  // Get the image element by ID
  mainImageElement = document.getElementById('mainImage');

  // Create an offscreen canvas
  const offscreenCanvas = document.createElement("canvas");
  const offscreenContext = offscreenCanvas.getContext("2d");

  // Set the canvas size to match the image size
  offscreenCanvas.width = mainImageElement.naturalWidth;
  offscreenCanvas.height = mainImageElement.naturalHeight

  // Draw the image onto the offscreen canvas
  offscreenContext.drawImage(mainImageElement, 0, 0);

  // Get the image data from the offscreen canvas as an ImageData object
  let imageDataTemp = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);


  return imageDataTemp;
  };

  function getImageDataUrl() {
    const mainImageElement = document.getElementById("mainImage");
    const offscreenCanvas = document.createElement("canvas");
    const offscreenContext = offscreenCanvas.getContext("2d");
  
    offscreenCanvas.width = mainImageElement.naturalWidth;
    offscreenCanvas.height = mainImageElement.naturalHeight;
  
    offscreenContext.drawImage(mainImageElement, 0, 0);
  
    // Get the data URL of the image from the canvas
    const imageDataUrl = offscreenCanvas.toDataURL('image/jpeg');
    if (!savedInitialImage) {
      setNewInitialImage()
      }    
  
    return imageDataUrl;
  }
  


//#################################
// Resets the Main Drop Down Menu
function resetMainDrop () {
  // Reset the dropdowns to the initial default value
  const mainDropdownElement = document.getElementById("mainDropdown");
  mainDropdownElement.selectedIndex = 0;
}

// Resets the Secondary Drop Down Menu
function resetAllSecondDrops() {
  const secondDropdowns = document.querySelectorAll(".secondDropSelect");

  secondDropdowns.forEach(dropdown => {
    dropdown.selectedIndex = 0;
  });
}

// Hides the Divs created from the secondary dropdown choices
function removeSecondaryChoiceDivs() {
  const secondChoiceDivsElements = document.querySelectorAll(".subForm");

  secondChoiceDivsElements.forEach(element => {
    element.style.display = 'none';
  });
}

// Function to automatically check the appropriate radio button
function selectedAreaRadio() {
  // Access the radio buttons by their IDs
  var selectedAreaRadioButton = document.getElementById('selectedArea');
  var entireImageRadioButton = document.getElementById('entireImage');

  if (selectedArea) {
    // If isSelectedArea is true, select the 'Selected Area' radio button
    selectedAreaRadioButton.checked = true;
  } else {
    // If isSelectedArea is false, select the 'Entire Image' radio button
    entireImageRadioButton.checked = true;
  }
}

// Hides the Area Selected Div and resets the choices
function removeAreaChoice () {
    //Hide area Elements
    const selectedCategory = document.getElementById("areaSelection"); 
    selectedCategory.style.display = "none";
    
    
}

// Shows the Area Selected Div
function showAreaChoice () {
  //Hide area Elements
  const selectedAreaType = document.getElementById("areaSelection"); 
  selectedAreaType.style.display = "flex";
  selectedAreaType.style.flexDirection = "column";
  selectedAreaType.style.justifyContent = "centre";
  selectedAreaType.style.margin = "5px";
  selectedAreaRadio();
}

// Hides the Hover box size choice div
function showHoverSize () {
  // Hide size of Hover Square
  const hoverSizeSelector = document.querySelector("#hoverSizeSelector");
  hoverSizeSelector.style.display = 'flex';
}

// Hides the Hover box size choice div
function removeHoverSize () {
    // Hide size of Hover Square
    const hoverSizeSelector = document.querySelector("#hoverSizeSelector");
    hoverSizeSelector.style.display = 'none';
}

// Shows the Areas that display what is in the hover box and their resutls
function showCanvas () {
  const allCanvasArea = document.querySelector('.allCanvas');
  allCanvasArea.style.display = 'grid';
}

// Hides the Areas that display what is in the hover box and their resutls
function removeCanvas () {
  const allCanvasArea = document.querySelector('.allCanvas');
  allCanvasArea.style.display = 'none';
}

function showHoverSquare () {
  const allHoverSquare = document.querySelector('.hoverSquare');
  allHoverSquare.style.display = 'flex'; 
}

function removeHoverSquare () {
  const allHoverSquare = document.querySelector('.hoverSquare');
  allHoverSquare.style.display = 'none';
  // allHoverSquare.style.width = '100px';
  // allHoverSquare.style.height = '100px';

  // const boxWidthInput = document.getElementById('boxWidth');
  // boxWidthInput.value = '';
  // const boxHeightInput = document.getElementById('boxHeight');
  // boxHeightInput.value = '';
}

function removeImageResize() {
  const imageResizeSelector = document.querySelector("#imageResize");
  imageResizeSelector.style.display = 'none';
}

function showImageResize() {
  const imageResizeSelector = document.querySelector("#imageResize");
  imageResizeSelector.style.display = 'flex';
  imageResizeSelector.style.flexDirection = "column";
}

function removeSelectImagePrompt () {
  const selectedImagePrompt = document.querySelector("#clickImagePrompt");
  selectedImagePrompt.style.display = 'none';
}

function showSelectImagePrompt () {
  const selectedImagePrompt = document.querySelector("#clickImagePrompt");
  selectedImagePrompt.style.display = 'flex';
}

function showRotateAngle () {
  const selectedRotateElement = document.querySelector("#rotateAngle");
  selectedRotateElement.style.display = 'flex';
}

function removeRotateAngle () {
  const selectedRotateElement = document.querySelector("#rotateAngle");
  selectedRotateElement.style.display = 'none';
  rotateImageBool = false;
}

function showSwapColour () {
  const selectedRotateElement = document.querySelector("#colourSelection");
  selectedRotateElement.style.display = 'flex';
}

function removeSwapColour () {
  const selectedRotateElement = document.querySelector("#colourSelection");
  selectedRotateElement.style.display = 'none';
  rotateImageBool = true;
}

function colourChoice() {
  desiredColorScheme = document.querySelector('input[name="colourSelection"]:checked').value;
}


function removeSimpleThresh () {
  const selectedSimpleThreshElement = document.querySelector("#simpleThresh");
  selectedSimpleThreshElement.style.display = 'none';
}

function showSimpleThresh () {
  const selectedSimpleThreshElement = document.querySelector("#simpleThresh");
  selectedSimpleThreshElement.style.display = 'flex';
}

function removeThreshVals () {
  const selectedThreshElement = document.querySelector("#threshVals");
  selectedThreshElement.style.display = 'none';
}

function showTranslate () {
  const selectedTranslateElement = document.querySelector("#translateDistanceSelector");
  selectedTranslateElement.style.display = 'flex';
}

function removeTransalte () {
  const selectedTranslateElement = document.querySelector("#translateDistanceSelector");
  selectedTranslateElement.style.display = 'none';
}

function showAffineTransform () {
  const selectedAffineTranformElement = document.querySelector("#affineTransfromSelector");
  selectedAffineTranformElement.style.display = 'flex';
}

function removeAffineTransform () {
  const selectedAffineTranformElement = document.querySelector("#affineTransfromSelector");
  selectedAffineTranformElement.style.display = 'none';
}

function updateTranslateDist() {
  // Assuming you want to update the main element with the "hoverSquare" class
  const translateXDist = document.getElementById("translateX").value;
  const translateYDist = document.getElementById("translateY").value;

  translateDistances = [translateXDist,translateYDist]
}

function updateAffineTransform () {
  const affineAngle = document.getElementById("affineAngle").value;
  const affineScale = document.getElementById("affineScale").value;

  affineTransformChoices = [affineAngle,affineScale]
}

function showThreshVals () {
  const selectedThreshElement = document.querySelector("#threshVals");
  selectedThreshElement.style.display = 'flex';
}

function removeThreshVals () {
  const selectedThreshElement = document.querySelector("#threshVals");
  selectedThreshElement.style.display = 'none';
}

function showCanvasFollow () {
  const selectedCanvasElement = document.querySelector('#myCanvasFollow');
  selectedCanvasElement.style.display = 'block';
}

function removeCanvasFollow () {
  const selectedCanvasElement = document.querySelector('#myCanvasFollow');
  selectedCanvasElement.style.display = 'none';
}

function showMainCanvas1 () {
  const selectedCanvasElement = document.querySelector('#mainImageCanvas1');
  selectedCanvasElement.style.display = 'block';
}

function removeMainCanvas1 () {
  const selectedCanvasElement = document.querySelector('#mainImageCanvas1');
  selectedCanvasElement.style.display = 'none';
}

function showMainCanvas2 () {
  const selectedCanvasElement = document.querySelector('#mainImageCanvas2');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeMainCanvas2 () {
  const selectedCanvasElement = document.querySelector('#mainImageCanvas2');
  selectedCanvasElement.style.display = 'none';
}

function showMainCanvas3 () {
  const selectedCanvasElement = document.querySelector('#mainImageCanvas3');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeMainCanvas3 () {
  const selectedCanvasElement = document.querySelector('#mainImageCanvas3');
  selectedCanvasElement.style.display = 'none';
}


function showSubCanvas1 () {
  const selectedCanvasElement = document.querySelector('#subCanvas1');
  selectedCanvasElement.style.display = 'block';
}

function removeSubCanvas1 () {
  const selectedCanvasElement = document.querySelector('#subCanvas1');
  selectedCanvasElement.style.display = 'none';
}

function showSubCanvas2 () {
  const selectedCanvasElement = document.querySelector('#subCanvas2');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeSubCanvas2 () {
  const selectedCanvasElement = document.querySelector('#subCanvas2');
  selectedCanvasElement.style.display = 'none';
}

function showSubCanvas3 () {
  const selectedCanvasElement = document.querySelector('#subCanvas3');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeSubCanvas3 () {
  const selectedCanvasElement = document.querySelector('#subCanvas3');
  selectedCanvasElement.style.display = 'none';
}


function showCanvasDiv1 () {
  const selectedCanvasElement = document.querySelector('#myCanvasDiv1');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeCanvasDiv1 () {
  const selectedCanvasElement = document.querySelector('#myCanvasDiv1');
  selectedCanvasElement.style.display = 'none';
}

function showCanvasDiv2 () {
  const selectedCanvasElement = document.querySelector('#myCanvasDiv2');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeCanvasDiv2 () {
  const selectedCanvasElement = document.querySelector('#myCanvasDiv2');
  selectedCanvasElement.style.display = 'none';
}

function showCanvasDiv3 () {
  const selectedCanvasElement = document.querySelector('#myCanvasDiv3');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeCanvasDiv3 () {
  const selectedCanvasElement = document.querySelector('#myCanvasDiv3');
  selectedCanvasElement.style.display = 'none';
}

function showResetCanvasButton1 () {
  const selectedCanvasElement = document.querySelector('#resetCanvasButton1');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeResetCanvasButton1 () {
  const selectedCanvasElement = document.querySelector('#resetCanvasButton1');
  selectedCanvasElement.style.display = 'none';
}

function showResetCanvasButton2 () {
  const selectedCanvasElement = document.querySelector('#resetCanvasButton2');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeResetCanvasButton2 () {
  const selectedCanvasElement = document.querySelector('#resetCanvasButton2');
  selectedCanvasElement.style.display = 'none';
}

function showResetCanvasButton3 () {
  const selectedCanvasElement = document.querySelector('#resetCanvasButton3');
  selectedCanvasElement.style.display = 'block';
  updateCanvasGrid();
}

function removeResetCanvasButton3 () {
  const selectedCanvasElement = document.querySelector('#resetCanvasButton3');
  selectedCanvasElement.style.display = 'none';
}

function showAdaptThreshVals () {
  const selectedThreshElement = document.querySelector("#adaptiveThresh");
  selectedThreshElement.style.display = 'flex';
}

function removeAdaptThreshVals () {
  const selectedThreshElement = document.querySelector("#adaptiveThresh");
  selectedThreshElement.style.display = 'none';
}

function showNextFreeCanvas (nextFreeCanvasId) {
  if (nextFreeCanvasId == 'mainImageCanvas1') {
    showMainCanvas1()
    showResetCanvasButton1()
  } else if (nextFreeCanvasId == 'mainImageCanvas2') {
    showMainCanvas2()
    showResetCanvasButton2()
  } else if (nextFreeCanvasId == 'mainImageCanvas3') {
    showMainCanvas3()
    showResetCanvasButton3()
  } else if (nextFreeCanvasId == 'subCanvas1') {
    showSubCanvas1 ()
  } else if (nextFreeCanvasId == 'subCanvas2') {
    showSubCanvas2 ()
  } else if (nextFreeCanvasId == 'subCanvas3') {
    showSubCanvas3 ()
  } else if (nextFreeCanvasId == 'myCanvasDiv1') {
    showCanvasDiv1()
  } else if (nextFreeCanvasId == 'myCanvasDiv2') {
    showCanvasDiv2()
  } else if (nextFreeCanvasId == 'myCanvasDiv3') {
    showCanvasDiv3()
  }
} 

function resetIndCanvas (canvasId) {
  if (canvasId == 'mainImageCanvas1') {
    removeMainCanvas1()
    removeCanvasDiv1()
    removeSubCanvas1 ()
    removeResetCanvasButton1()
  } else if (canvasId == 'mainImageCanvas2') {
    removeMainCanvas2 ()
    removeCanvasDiv2()
    removeSubCanvas2 ()
    removeResetCanvasButton2()
  } else if (canvasId == 'mainImageCanvas3') {
    removeMainCanvas3 ()
    removeCanvasDiv3()
    removeSubCanvas3 ()
    removeResetCanvasButton3()
  } 
}

function removeAllCanvas () {
  removeCanvasFollow();
  removeMainCanvas1();
  removeMainCanvas2();
  removeMainCanvas3();
  removeCanvasDiv1();
  removeCanvasDiv2();
  removeCanvasDiv3();
  removeResetCanvasButton1();
  removeResetCanvasButton2();
  removeResetCanvasButton3();
}

function showSmoothingKernel () {
  const selectedThreshElement = document.querySelector("#smoothingKernel");
  selectedThreshElement.style.display = 'flex';
}

function removeSmoothingKernel () {
  const selectedThreshElement = document.querySelector("#smoothingKernel");
  selectedThreshElement.style.display = 'none';
}

function showEdgeKernel () {
  const selectedThreshElement = document.querySelector("#edgeKernel");
  selectedThreshElement.style.display = 'flex';
}

function removeEdgeKernel () {
  const selectedThreshElement = document.querySelector("#edgeKernel");
  selectedThreshElement.style.display = 'none';
}

function showCustomKernel () {
  const selectedThreshElement = document.querySelector("#customeKernelButton");
  selectedThreshElement.style.display = 'block';
}

function removeCustomKernel () {
  const selectedThreshElement = document.querySelector("#customeKernelButton");
  selectedThreshElement.style.display = 'none';
}

function showMorphologicalKernel () {
  const selectedThreshElement = document.querySelector("#morphologicalKernel");
  selectedThreshElement.style.display = 'flex';
}

function removeMorphologicalKernel () {
  const selectedThreshElement = document.querySelector("#morphologicalKernel");
  selectedThreshElement.style.display = 'none';
}

function showShapeChoice () {
  const selectedThreshElement = document.querySelector("#drawShapeSelection");
  selectedThreshElement.style.display = 'flex';
}

function removeShapeChoice () {
  const selectedThreshElement = document.querySelector("#drawShapeSelection");
  selectedThreshElement.style.display = 'none';
}

function showFftFilter () {
  const selectedFftFilterElement = document.querySelector("#FftFilter");
  selectedFftFilterElement.style.display = 'flex';
  
}

function removeFftFilter () {
  const selectedFftFilterElement = document.querySelector("#FftFilter");
  selectedFftFilterElement.style.display = 'none';
}


function morphChoice() {
  // Get the selected radio button value
  morphSelection = document.querySelector('input[name="morphSelection"]:checked').value;
}

function showcontourFeatureChoice () {
  const selectedFeaturehElement = document.querySelector("#contourFeatureSelection");
  selectedFeaturehElement.style.display = 'flex';
}

function removecontourFeatureChoice () {
  const selectedFeaturehElement = document.querySelector("#contourFeatureSelection");
  selectedFeaturehElement.style.display = 'none';
}

function contourFeatureChoice() {
  // Get the selected radio button value
  contourFeatureSelection = document.querySelector('input[name="contourFeatureSelectionInput"]:checked').value;
}

function showBoundingBoxChoice () {
  const selectedFeaturehElement = document.querySelector("#contourBoundingBox");
  selectedFeaturehElement.style.display = 'flex';
}

function removeBoundingBoxChoice () {
  const selectedFeaturehElement = document.querySelector("#contourBoundingBox");
  selectedFeaturehElement.style.display = 'none';
}

function showEdgeDetectionChoice () {
  const selectedFeaturehElement = document.querySelector("#edgeDetection");
  selectedFeaturehElement.style.display = 'flex';
}

function removeEdgeDetectionChoice () {
  const selectedFeaturehElement = document.querySelector("#edgeDetection");
  selectedFeaturehElement.style.display = 'none';
}

function edgeDetectionChoice() {
  // Get the selected radio button value
  selectedEdgeDetection = document.querySelector('input[name="edgeDetectionSelection"]:checked').value;
  secondDropDownChoice = 'edgeDetection'
  removeImageResize();
  showAreaChoice();
  showCanvas ();
  // Check if Selected Area Type is Ticked 
  if (selectedArea) {
    showCanvasFollow ();
    showHoverSquare();
    placeImageCanvas = true;
        } 
}

function contourBoundingBoxChoice() {
  // Get the selected radio button value
  contourBoundingBoxSelection = document.querySelector('input[name="contourBoundingBoxInput"]:checked').value;
}

function showStrideChoice () {
}

function showPaddingChoice () {
}

function showClusterSeg () {
  const selectedFeaturehElement = document.querySelector("#clusterSeg");
  selectedFeaturehElement.style.display = 'flex';
}

function removeClusterSeg () {
  const selectedFeaturehElement = document.querySelector("#clusterSeg");
  selectedFeaturehElement.style.display = 'none';
}

function showBinClass () {
  const selectedBinClassElement = document.querySelector("#binModelSelection");
  selectedBinClassElement.style.display = 'flex';
}

function removeBinClass () {
  const selectedBinClassElement = document.querySelector("#binModelSelection");
  selectedBinClassElement.style.display = 'none';
}

function showClassButton() {
  const classImageUploadElement = document.querySelector("#predImageUploadForm");
  classImageUploadElement.style.display = 'flex'; // Show the input
}

function removeClassButton() {
  const classImageUploadElement = document.querySelector("#predImageUploadForm");
  classImageUploadElement.style.display = 'none'; // Hide the input
}

function binClass() {
  clickedimageProcess = 'binaryClass'
  showClassButton();
  // Assuming you have input elements named "binaryClassSelection", this line is okay
  // Ensure the element exists and is correctly named
  clickedBinModel = document.querySelector('input[name="binaryClassSelection"]:checked').value;
  
}


function objectDetectionChoice() {
  clickedimageProcess = 'objectDetection'
  showClassButton();
  objDetModel = document.querySelector('input[name="objectDetectionModel"]:checked').value;
  
}

function clusterSegChoice() {
  clusterSeg = document.querySelector('input[name="clusterSegSelection"]:checked').value;
}

function fftFilterChoice() {
  fftFilterSelection = document.querySelector('input[name="selectedFftFilter"]:checked').value;
  showSelectImagePrompt();
}

function getNumDisplayedCanvas(className) {
  // Get the parent element
  var canvasElements = document.getElementsByClassName(className);
  let totalDisplayed = 0;
  
  // Iterate through all children elements
  for (var i = 0; i < canvasElements.length; i++) {
    var computedStyle = window.getComputedStyle(canvasElements[i]);
    if (computedStyle.display !== 'none') {
      totalDisplayed += 1;
    }  
  }  
  return totalDisplayed;
}

function getNextFreeCanvas(className) {
  // Get the parent element
  var canvasElements = document.getElementsByClassName(className);
  let nextFreeCanvasId;

  // Iterate through all children elements
  for (var i = 0; i < canvasElements.length; i++) {
      var computedStyle = window.getComputedStyle(canvasElements[i]);
      if (computedStyle.display === 'none') {
          nextFreeCanvasId = canvasElements[i].id;
          break;
      }
  }

  return nextFreeCanvasId;
}

function updateCanvasGrid() {
  let totalDisplayed = getNumDisplayedCanvas();
  let numRows = Math.ceil(totalDisplayed / 2);

  const allCanvas = document.querySelector('.allCanvas');
  
  allCanvas.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
}

function simpleThreshChoice() {
  // Get all radio buttons with the name "thresholdMethod"
  var radioButtons = document.getElementsByName("thresholdMethod");

  // Iterate through the radio buttons to find the selected one
  for (var i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
      // The value attribute contains the selected checkbox value
      selectedSimpleThresholdMethod = radioButtons[i].value;
    }
  }
}

function updateThresholdVals() {
  // Get the values from the input fields
  var newThresholdValue = document.getElementById("thresholdValue").value;
  var newThresholdMax = document.getElementById("thresholdMax").value;

  // Check if a value was entered for thresholdValue and update if it exists
  if (newThresholdValue !== "") {
    thresholdValue = newThresholdValue;
  } else {
    thresholdValue = 127;
  }

  // Check if a value was entered for thresholdMax and update if it exists
  if (newThresholdMax !== "") {
    thresholdMax = newThresholdMax;
  } else {
    thresholdMax = 255;
  }
}

function adaptiveThreshChoice() {
  const adaptiveMaxValue = document.getElementById('maxValue').value;
  const adaptiveMethod = document.getElementById('adaptiveMethod').value;
  const adaptiveThresholdType = document.getElementById('thresholdType').value;
  const adaptiveBlockSize = document.getElementById('blockSize').value;
  const adaptiveConstant = document.getElementById('constantC').value;

  adaptiveParamaters = [adaptiveMaxValue, adaptiveMethod, adaptiveThresholdType, adaptiveBlockSize , adaptiveConstant]
}

function createPlotlyHistogram (histdata) {
  
  // Break the data up into colours
  const histDataPlotly = [
    { y: histdata.histogramVals[0], type: 'lines', name: 'Red', line: { color: 'red' } },
    { y: histdata.histogramVals[1], type: 'lines', name: 'Green', line: { color: 'green' } },
    { y: histdata.histogramVals[2], type: 'lines', name: 'Blue', line: { color: 'blue' } }
  ];  

  // Create the layout
  const layout = {
    title: 'RGB Histogram',
    xaxis: { title: 'RGB Value' },
    yaxis: { title: 'Frequency' },
    width: 300,  // Set the width of the plot
    height: 200 
  };

  let nextFreeCanvasId = getNextFreeCanvas('divCanvas');
  showNextFreeCanvas(nextFreeCanvasId);
  Plotly.newPlot(nextFreeCanvasId, histDataPlotly, layout);
}

function createFftThresh (data) {
  
  let nextFreeCanvasId = getNextFreeCanvas('subCanvas');
  showNextFreeCanvas(nextFreeCanvasId);
  drawImageInCanvas(data.fftThresh, nextFreeCanvasId)
}

function updateImageSize () {
  selectedImageWidth = document.getElementById("imageSelectedBoxWidth").value;
  selectedImageHeight = document.getElementById("imageSelectedBoxHeight").value;

  showSelectImagePrompt();
}

function rotateAngle () {
  selectedRotateAngle = document.getElementById("rotateAngleSelection").value;
}

function smoothingKernelChoice() {
  // Get the selected radio button value
  selectedKernel = document.querySelector('input[name="smoothingKernelSelection"]:checked').value;
}

function edgeKernelChoice() {
  // Get the selected radio button value
  selectedKernel = document.querySelector('input[name="edgeKernelSelection"]:checked').value;
}

function drawImageInCanvas(dataImg, nextFreeCanvasId) {
  const canvas = document.getElementById(nextFreeCanvasId);
  const ctx = canvas.getContext('2d');
  // Create an Image object
  const img = new Image();
  // Set the image source to the base64-encoded image data from the JSON response
  img.src = 'data:image/jpeg;base64,' + dataImg;
  // After the image is loaded, draw it on the canvas
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;  
    ctx.drawImage(img, 0, 0);
  }
}

////////////// NEW WINDOW SCRIPT ////////////////////
function openCustomKernelWindow () {
  var newWindow = window.open("/kernel_popup", "NewWindow", "width=600, height=400, resizable=yes, scrollbars=yes");

  newWindow.receiveDataFromPopup = receiveDataFromPopup;
}

function receiveDataFromPopup(data) {
  // Handle the data received from the popup
  selectedKernel = data;
}

////////////// NEW WINDOW SCRIPT /////////////////////


function uploadRemoves () {
  resetMainDrop();
  resetAllSecondDrops();
  removeSecondaryChoiceDivs();
  removeAreaChoice();
  removeHoverSize();
  removeAllCanvas ()
  removeHoverSquare();
  removeImageResize();
  removeSelectImagePrompt();
  removeSwapColour();
  removeRotateAngle();
  removeSimpleThresh();
  removeTransalte();
  removeAffineTransform(); 
  removeThreshVals();
  removeAdaptThreshVals();
  removeSmoothingKernel();
  removeEdgeKernel();
  removeMorphologicalKernel();
  removeCustomKernel();
  removeShapeChoice();
  removecontourFeatureChoice();
  removeBoundingBoxChoice();
  removeFftFilter();
  removeEdgeDetectionChoice();
  removeClusterSeg ();
  removeBinClass ();
  removeClassButton ();
  selectedArea = false;
}

function mainDropDownRemoves () {
  resetAllSecondDrops();
  removeSecondaryChoiceDivs();
  removeAreaChoice();
  removeHoverSize();
  removeImageResize();
  removeSelectImagePrompt();
  removeSwapColour();
  removeRotateAngle();
  removeSimpleThresh();
  removeThreshVals();
  removeTransalte();
  removeAffineTransform();
  removeThreshVals();
  removeAdaptThreshVals();
  removeAllCanvas();
  removeSmoothingKernel();
  removeEdgeKernel();
  removeMorphologicalKernel();
  removeCustomKernel ();
  removeShapeChoice();
  removecontourFeatureChoice();
  removeBoundingBoxChoice ();
  removeFftFilter ();
  removeEdgeDetectionChoice();
  removeClusterSeg ();
  removeBinClass ();
  removeClassButton ();
  selectedArea = false;

}

function secondaryDropDownRemoves () {
  removeAreaChoice();
  removeImageResize();
  removeSelectImagePrompt();
  removeHoverSize();
  removeRotateAngle();
  removeSwapColour();
  removeSimpleThresh();
  removeThreshVals();
  removeTransalte();
  removeAffineTransform();
  removeThreshVals();
  removeAdaptThreshVals();
  removeSmoothingKernel();
  removeEdgeKernel();
  removeMorphologicalKernel();
  removeCustomKernel();
  removeShapeChoice();
  removecontourFeatureChoice();
  removeBoundingBoxChoice ();
  removeFftFilter ();
  removeEdgeDetectionChoice ();
  removeClusterSeg ();
  removeBinClass ();
  removeClassButton ();
  selectedArea = false;
}

// JavaScript: Updated showSecondDropdown function
function showSecondDropdown() {
  mainDropDownRemoves ();

  // Get the selected value from the main dropdown
  const selectedCategory = document.getElementById("mainDropdown").value;
  // Show the selected sub-dropdown
  if (selectedCategory !== "mainCategory") {
    const selectedSubForm = document.getElementById(selectedCategory);
    if (selectedSubForm) {
      selectedSubForm.style.display = "flex";
      selectedSubForm.style.flexDirection = "column";
      selectedSubForm.style.margin = "5px";
    }
  }
}

// show area options
function showSecondDropChoice(dropdownId) {
  secondaryDropDownRemoves();

  // Get the selected value from the main dropdown
  secondDropDownChoice = document.querySelector(`#${dropdownId}`).value;
  
  let entireList = ["resize","translate","FftSpectrum","FftFilter","clusterSeg","binaryClass"];
  let selectedList = ["crop"];
  let choiceList = ["grayscale","rotate","swapColour","swapColour","simpleThresh","adaptThresh","otsuThresh","imageHist","histEqua","affine",
  "identityKernel","smoothingKernel","sharpeningKernel","edgeDetectionKernel","morphologicalKernel","frequencyDomainKernel","customKernel",
  "drawContours",'drawShapes',"contourFeatures","boundingFeatures","edgeDetection","segmentationOpsDropDown"]; 
           
  if (choiceList.includes(secondDropDownChoice)) {         
    removeImageResize();
    showAreaChoice();
    showCanvas ();
    // Check if Selected Area Type is Ticked 
    if (selectedArea) {
      showCanvasFollow ();
      showHoverSquare();
      placeImageCanvas = true;
          } 
    
    if (secondDropDownChoice == 'rotate') {
      showRotateAngle()
      } else if (secondDropDownChoice == 'swapColour') {
        showSwapColour()
      } else if (secondDropDownChoice == 'simpleThresh' ) {
        showSimpleThresh()
        showThreshVals ()
      } else if (secondDropDownChoice == 'affine') {
        showAffineTransform ()
      } else if (secondDropDownChoice == 'adaptThresh') {
        showAdaptThreshVals ()
      } else if (secondDropDownChoice == 'otsuThresh') {
        showThreshVals ()     
      } else if (secondDropDownChoice == 'smoothingKernel') {
        showSmoothingKernel ()     
      } else if (secondDropDownChoice == 'edgeDetectionKernel') {
        showEdgeKernel ()
      } else if (secondDropDownChoice == 'morphologicalKernel') {
        showMorphologicalKernel ()
      } else if (secondDropDownChoice == 'customKernel') {
        showCustomKernel ()
        showStrideChoice ()
        showPaddingChoice ()
      } else if (secondDropDownChoice == 'drawShapes') {
        showShapeChoice()
      } else if (secondDropDownChoice == 'contourFeatures') {
        showcontourFeatureChoice()
      } else if (secondDropDownChoice == 'boundingFeatures') {
        showBoundingBoxChoice()
      } else if (secondDropDownChoice == 'edgeDetection') {
        showEdgeDetectionChoice ()
      }                 

  } else if (selectedList.includes(secondDropDownChoice))  {
      removeAreaChoice();
      showHoverSize ();
      showCanvas();
      showHoverSquare();
      placeImageCanvas = true;
    
    } else if (entireList.includes(secondDropDownChoice))  {
      removeAllCanvas ();
      removeHoverSquare();
      
      if (secondDropDownChoice == 'translate') {
        showTranslate ()
      } else if (secondDropDownChoice == "resize") {
        showImageResize()
      } else if (secondDropDownChoice == "FftSpectrum") {
        showSelectImagePrompt ()
        placeImageCanvas = true
      } else if (secondDropDownChoice == "FftFilter") {
        showFftFilter ()
        placeImageCanvas = true
      } else if (secondDropDownChoice == 'clusterSeg') {
        showClusterSeg();
      } else if (secondDropDownChoice == 'watershed') {
        showSelectImagePrompt();
      } else if (secondDropDownChoice == 'binaryClass') {
        showBinClass()
      }
      
      removeAreaChoice();       
    }
} 

// function that does the choice of the area radio buttons
function areaChoice() {
  removeSelectImagePrompt();

  // Get the selected radio button
  const selectedRadioButton = document.querySelector('input[name="areaSelectionInput"]:checked');

  if (selectedRadioButton.value === 'selectedArea') {
      // The "Selected Area" radio button is selected
      selectedArea = true;
      placeImageCanvas = true;
      showCanvasFollow();
      showHoverSize();
      showHoverSquare();
    } else {
      // Another radio button is selected
      removeHoverSize();
      removeAllCanvas();
      removeHoverSquare();
      showSelectImagePrompt();
      placeImageCanvas = false;
      selectedArea = false;
    }
  } 


// Function to get the relative x and y position of cursor on image
function imageRelative(e) {
  const hoverSquare = document.querySelector('.hoverSquare');
  const imageContainer = document.querySelector('.image-container');

  // Use clientX and clientY relative to the viewport
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Adjust the square's position based on its dimensions
  let temp_left = mouseX - hoverSquare.offsetWidth;
  let temp_top = mouseY - hoverSquare.offsetHeight;

  // Update the square's position considering the scroll position
  temp_left += window.scrollX || document.documentElement.scrollLeft;
  temp_top += window.scrollY || document.documentElement.scrollTop;

  hoverSquare.style.left = temp_left + 'px';
  hoverSquare.style.top = temp_top + 'px';

  const containerRect = imageContainer.getBoundingClientRect();
  const relativeX = mouseX - containerRect.left;
  const relativeY = mouseY - containerRect.top;

  return [relativeX, relativeY];
}

// Shows what is in the blue square
document.querySelector('.image-container').addEventListener('mousemove', function (e) {
    let relativeXY = imageRelative(e);
    let relativeX = relativeXY[0];
    let relativeY = relativeXY[1];

    // Update the size of the window to show what is in the sqyare
    const hoverElement = document.querySelector(".hoverSquare");   
    let snippetWidth, snippetHeight;

    if (isNaN(parseInt(hoverElement.style.width))) {
      snippetWidth = 100;
      snippetHeight = 100;
      hoverElement.style.width = snippetWidth
      hoverElement.style.height = snippetHeight
    } else {
      snippetWidth = parseInt(hoverElement.style.width);
      snippetHeight = parseInt(hoverElement.style.height);
    }
    
    // Shows what is in the square on mousemove
    let selectedImageInfo = showSnippet(relativeX-snippetWidth, relativeY-snippetHeight, snippetWidth, snippetHeight);

    imageData = selectedImageInfo[0];
    imageDataHeight = selectedImageInfo[1];
    imageDataWidth = selectedImageInfo[2];
  });

// Function to show what is in the moving square
function showSnippet(leftVal, topVal, sourceWidth, sourceHeight) {
  const canvasTrial = document.getElementById("myCanvasFollow");

  canvasTrial.width = sourceWidth;
  canvasTrial.height = sourceHeight;

  const ctx = canvasTrial.getContext("2d");
  const img = document.getElementById("mainImage");
  ctx.clearRect(0, 0, canvasTrial.width, canvasTrial.height);

  // Draw the image onto the temporary canvas with the correct coordinates
  // ctx.drawImage(img, leftVal,topVal,sourceWidth,sourceHeight,0,0,canvas.width,canvas.height);
  ctx.drawImage(img, leftVal,topVal,sourceWidth,sourceHeight,0,0,sourceWidth,sourceHeight);

  // Get the image data from the temporary canvas as an ImageData object
  const imageData = ctx.getImageData(0, 0, canvasTrial.width, canvasTrial.height);
  return [imageData, canvasTrial.width, canvasTrial.height];
}

// Event to display square when in image container
document.querySelector('.image-container').addEventListener('mouseenter', function () {
  
  if (selectedArea) {
    document.querySelector('.hoverSquare').style.display = 'flex';
    }
});

// Event to remove square when out image container
document.querySelector('.image-container').addEventListener('mouseleave', function () {
  document.querySelector('.hoverSquare').style.display = 'none';
  
});

// initiates sending the image to python
document.querySelector('.image-container').addEventListener('click', function (e) {
    // Get the Entire Main Image
    if (!selectedArea) {
      entireImageData = getImageParams();
      imageData = entireImageData.data;
      imageDataHeight = entireImageData.height;
      imageDataWidth = entireImageData.width;
    }
    // Get a snippet sized image
    if (selectedArea) {
      imageData = imageData.data;
    }
    sendImageSnippet(imageData,imageDataHeight,imageDataWidth,secondDropDownChoice);
  
});

// Updates the size of the hover box
function updateHoverBox() {
  const hoverElement = document.querySelector(".hoverSquare");

  // Assuming you want to update the main element with the "hoverSquare" class
  const boxWidth = document.getElementById("boxWidth").value;
  const boxHeight = document.getElementById("boxHeight").value;

  // Show the hover box if selectedArea is true
  if (selectedArea) {
    hoverElement.style.display = 'flex';
  }

  if (!usedAspectRatio) {
    hoverElement.style.display = 'flex';
    hoverElement.style.width = boxWidth + 'px';
    hoverElement.style.height = boxHeight + 'px';
  } else {
    hoverElement.style.display = 'flex';
    hoverElement.style.width = boxWidth/aspectRatio  + 'px';
    hoverElement.style.height =  boxHeight/aspectRatio + 'px';
  }
  showSelectImagePrompt();
}

// Resets the main image to the origional image
function resetInitialImage() {
  const imgElement = document.getElementById("mainImage");
  imgElement.src = initialImage;
  removeAllCanvas ();
}


function jsonReplaceMainImg(data) {
  // Replace the main Image
  const imgElement = document.getElementById("mainImage");
  imgElement.src = 'data:image/jpeg;base64,' + data.img;


  imgElement.onload = function() {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth; // Use the naturalWidth and naturalHeight of the image
    canvas.height = imgElement.naturalHeight;

    const ctx = canvas.getContext('2d');
    
    // Draw the image onto the canvas
    ctx.drawImage(imgElement, 0, 0);
    
    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
}

// Function to send and retrieve image to show
function sendImageSnippet(clickedImage,clickedImageHeight,clickedImageWidth,selectedImageProcess ) {

  // Send the image data to the server using a fetch request
  fetch('/process_image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData: clickedImage,
                            imageHeight:clickedImageHeight,
                            imageWidth: clickedImageWidth,
                            imageProcess: selectedImageProcess,
                            imageWidthSelected: selectedImageWidth,
                            imageHeightSelected: selectedImageHeight,
                            imageTranslateDistances: translateDistances,
                            imageAffineTransform: affineTransformChoices,
                            imageRotateAngle: selectedRotateAngle,
                            imageCurrentColourScheme : currentColourScheme,
                            imageDesiredColorScheme: desiredColorScheme,
                            imageselectedSimpleThreshold : selectedSimpleThresholdMethod,
                            imagethresholdValue: thresholdValue,
                            imageAdaptiveParamaters : adaptiveParamaters, 
                            imagethresholdMax: thresholdMax,
                            imageselectedKernel : selectedKernel,
                            imageMorphSelection : morphSelection,
                            imageContourFeatureSelection : contourFeatureSelection,
                            imageContourBoundingBoxSelection : contourBoundingBoxSelection,
                            imagefftFilterSelection : fftFilterSelection,
                            imageSelectedEdgeDetection : selectedEdgeDetection,
                            imageClusterSeg : clusterSeg 
                          }),
    })

  .then(response => response.json())
  .then(data => {
    // Update Current Colour Scheme
    tempCurrentColourScheme = data.currentColourScheme;
    if (tempCurrentColourScheme !== null) {
      currentColourScheme = tempCurrentColourScheme
    }    
    
    // Deal with Histogram of the image
    if (data.histogramVals && data.histogramVals.length > 0) {
      createPlotlyHistogram(data);
    }
    
    if (data.fftThresh && data.fftThresh.length > 0) {
      createFftThresh(data);
    }

    if (!placeImageCanvas) {
      
      jsonReplaceMainImg(data)

    } else {
      // Add the image to the smaller canvases
      let nextFreeCanvasId = getNextFreeCanvas('mainCanvas');
      showNextFreeCanvas(nextFreeCanvasId);
      drawImageInCanvas(data.img, nextFreeCanvasId)
      }

    })
  .catch(error => {
    console.error('Error processing image:', error);
    });
  };

// Function to make predictions on image
function sendPredImage(clickedimageProcess) {
  const mainImageElement = document.getElementById('mainImage');
    mainImageElement.onload = function() {
      // Call getImageParams only after the image has fully loaded
      let predEntireImageData = getImageParams();

      // Send the image data to the server using a fetch request
      fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ predImageData: predEntireImageData.data,
                                predImageHeight:predEntireImageData.height,
                                predImageWidth: predEntireImageData.width,
                                imageProcess: clickedimageProcess,
                                binModel : clickedBinModel,
                                detectionModel: objDetModel                           
                              }),
                            })
      .then(response => response.json())
      .then(data => {
          bin_pred = data.binPred
          console.log("bin_pred",bin_pred)
          jsonReplaceMainImg(data)
        })
      .catch(error => {
        console.error('Error processing image:', error);
        });
      };
    };  