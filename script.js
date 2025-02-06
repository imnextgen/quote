let uploadedImage = null;
let uploadedFileName = 'quote-image.jpeg';

const canvas = document.getElementById('statusCanvas');
const ctx = canvas.getContext('2d');

let imgX = 0,
    imgY = 0;
let imgScale = 1;
let isDraggingImage = false;
let imgStartX, imgStartY;
let lastDist = 0;

let userText = '';
let textX = canvas.width / 2;
let textY = canvas.height / 2;
let isDraggingText = false;
let textStartX, textStartY;
let textRotation = 0;
let textSize = 30; // Default text size
let textColor = '#FFFFFF'; // Default text color

let currentFontIndex = 0;
const fonts = [
  'Arial',
  'Roboto',
  'Lobster',
  'Montserrat',
  'Oswald',
  'Pacifico',
  'Dancing Script',
];

let currentStyleIndex = 0;
const styles = ['normal', 'bold', 'italic', 'bold italic'];

// Event Listeners
document.getElementById('imageUpload').addEventListener('change', loadImage);

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp);

canvas.addEventListener('wheel', handleScroll);

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd);

document.getElementById('addTextBtn').addEventListener('click', addText);
document.getElementById('nextFontBtn').addEventListener('click', nextFont);
document.getElementById('nextStyleBtn').addEventListener('click', nextStyle);

document
  .getElementById('rotationSlider')
  .addEventListener('input', rotateText);
document
  .getElementById('textSizeSlider')
  .addEventListener('input', updateTextSize);
document
  .getElementById('textColorPicker')
  .addEventListener('input', updateTextColor);
document.getElementById('downloadBtn').addEventListener('click', downloadImage);

function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFileName = file.name || 'quote-image.jpeg';

  const reader = new FileReader();

  reader.onload = function (e) {
    const imageData = e.target.result;
    const image = new Image();
    image.onload = function () {
      uploadedImage = image;
      resetImagePosition();
      drawCanvas(); // Redraw the canvas after image is loaded
    };
    image.src = imageData;
  };

  reader.readAsDataURL(file);
}

function resetImagePosition() {
  imgX = 0;
  imgY = 0;
  imgScale = 1;
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Image
  if (uploadedImage) {
    const imgWidth = uploadedImage.width * imgScale;
    const imgHeight = uploadedImage.height * imgScale;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.drawImage(
      uploadedImage,
      centerX - imgWidth / 2 + imgX,
      centerY - imgHeight / 2 + imgY,
      imgWidth,
      imgHeight
    );
  } else {
    // Fill the background if no image is uploaded
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw Text
  if (userText) {
    ctx.save();

    ctx.translate(textX, textY);
    ctx.rotate(textRotation);

    ctx.fillStyle = textColor; // Apply the updated text color
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply text style (size, font, and style)
    let fontStyle = styles[currentStyleIndex];
    let currentFont = fonts[currentFontIndex];
    ctx.font = `${fontStyle} ${textSize}px '${currentFont}'`; // Use textSize here

    wrapAndDrawText(ctx, userText, 300);

    ctx.restore();
  }
}

function addText() {
  const textInput = document.getElementById('quoteText').value.trim();
  if (textInput === '') {
    alert('Please enter a quote.');
    return;
  }
  userText = textInput;
  textX = canvas.width / 2;
  textY = canvas.height / 2;
  drawCanvas();
}

function updateTextSize() {
  textSize = parseInt(document.getElementById('textSizeSlider').value, 10);
  drawCanvas(); // Re-draw the canvas after updating text size
}

function updateTextColor() {
  textColor = document.getElementById('textColorPicker').value;
  drawCanvas(); // Re-draw the canvas after updating text color
}

function handleMouseDown(e) {
  const mousePos = getMousePos(canvas, e);
  if (isOverText(mousePos)) {
    isDraggingText = true;
    textStartX = mousePos.x - textX;
    textStartY = mousePos.y - textY;
  } else if (uploadedImage) {
    isDraggingImage = true;
    imgStartX = mousePos.x;
    imgStartY = mousePos.y;
  }
}

function handleMouseMove(e) {
  if (isDraggingText) {
    const mousePos = getMousePos(canvas, e);
    textX = mousePos.x - textStartX;
    textY = mousePos.y - textStartY;
    drawCanvas(); // Redraw the canvas when dragging the text
  } else if (isDraggingImage) {
    const mousePos = getMousePos(canvas, e);
    const dx = mousePos.x - imgStartX;
    const dy = mousePos.y - imgStartY;

    imgX += dx;
    imgY += dy;

    imgStartX = mousePos.x;
    imgStartY = mousePos.y;

    drawCanvas(); // Redraw the canvas when dragging the image
  }
}

function handleMouseUp() {
  isDraggingText = false;
  isDraggingImage = false;
}

function handleScroll(e) {
  const scaleAmount = 0.1;
  if (e.deltaY < 0) {
    imgScale += scaleAmount;
  } else if (e.deltaY > 0) {
    imgScale = Math.max(0.1, imgScale - scaleAmount);
  }
  drawCanvas(); // Redraw the canvas after zooming
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const touchPos = getTouchPos(canvas, touch);
  if (isOverText(touchPos)) {
    isDraggingText = true;
    textStartX = touchPos.x - textX;
    textStartY = touchPos.y - textY;
  } else if (uploadedImage) {
    isDraggingImage = true;
    imgStartX = touchPos.x;
    imgStartY = touchPos.y;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (isDraggingText || isDraggingImage) {
    const touch = e.touches[0];
    const touchPos = getTouchPos(canvas, touch);
    if (isDraggingText) {
      textX = touchPos.x - textStartX;
      textY = touchPos.y - textStartY;
    } else if (isDraggingImage) {
      const dx = touchPos.x - imgStartX;
      const dy = touchPos.y - imgStartY;

      imgX += dx;
      imgY += dy;

      imgStartX = touchPos.x;
      imgStartY = touchPos.y;
    }
    drawCanvas(); // Redraw the canvas when dragging
  }
}

function handleTouchEnd() {
  isDraggingText = false;
  isDraggingImage = false;
}

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getTouchPos(canvas, touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function isOverText(mousePos) {
  ctx.save(); // Save the current context state
  ctx.translate(textX, textY);
  ctx.rotate(textRotation);

  // Apply the current font settings
  let fontStyle = styles[currentStyleIndex];
  let currentFont = fonts[currentFontIndex];
  ctx.font = `${fontStyle} ${textSize}px '${currentFont}'`;

  // Measure text dimensions
  const textMetrics = ctx.measureText(userText);
  const textWidth = textMetrics.width;
  const textHeight = textSize; // Approximate height

  // Calculate mouse position relative to the rotated text
  const dx = mousePos.x - textX;
  const dy = mousePos.y - textY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) - textRotation;
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);

  ctx.restore(); // Restore the context to its original state

  return (
    x > -textWidth / 2 &&
    x < textWidth / 2 &&
    y > -textHeight / 2 &&
    y < textHeight / 2
  );
}

function nextFont() {
  currentFontIndex = (currentFontIndex + 1) % fonts.length;
  drawCanvas(); // Redraw the canvas after changing font
}

function nextStyle() {
  currentStyleIndex = (currentStyleIndex + 1) % styles.length;
  drawCanvas(); // Redraw the canvas after changing style
}

function rotateText() {
  textRotation =
    (document.getElementById('rotationSlider').value * Math.PI) / 180;
  drawCanvas(); // Redraw the canvas after rotation change
}

function downloadImage() {
  const dataURL = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = uploadedFileName;
  link.click();
}
