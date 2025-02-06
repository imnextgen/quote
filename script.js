// script.js

// Variables for image handling
let uploadedImage = null;
let uploadedFileName = 'quote-image.jpeg';

// Canvas and context
const canvas = document.getElementById('statusCanvas');
const ctx = canvas.getContext('2d');

// Image positioning and scaling
let imgX = 0,
    imgY = 0;
let imgScale = 1;
let isDraggingImage = false;
let imgStartX, imgStartY;

// Text properties
let userText = '';
let textX = canvas.width / 2;
let textY = canvas.height / 2;
let isDraggingText = false;
let textStartX, textStartY;
let textRotation = 0;
let textSize = 30; // Default text size
let textColor = '#FFFFFF'; // Default text color
let isBold = false;
let isItalic = false;
let isUnderline = false;

// Fonts and styles
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

// Multi-touch variables for pinch-to-zoom
let initialDistance = 0;
let initialScale = 1;

// Event Listeners

// Handle the click event on the custom upload button
document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('imageUpload').click();
});

// Image upload handling
document.getElementById('imageUpload').addEventListener('change', loadImage);

// Mouse events for dragging
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp);

// Touch events for dragging and pinch-to-zoom on mobile devices
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('touchcancel', handleTouchEnd);

// Button controls
document.getElementById('addTextBtn').addEventListener('click', addText);
document.getElementById('nextFontBtn').addEventListener('click', nextFont);
document.getElementById('boldBtn').addEventListener('click', toggleBold);
document.getElementById('italicBtn').addEventListener('click', toggleItalic);
document
  .getElementById('underlineBtn')
  .addEventListener('click', toggleUnderline);

// Sliders and color picker
document
  .getElementById('rotationSlider')
  .addEventListener('input', rotateText);
document
  .getElementById('textSizeSlider')
  .addEventListener('input', updateTextSize);
document
  .getElementById('textColorPicker')
  .addEventListener('input', updateTextColor);

// Download button
document.getElementById('downloadBtn').addEventListener('click', downloadImage);

// Functions

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
      drawCanvas(); // Redraw the canvas after the image is loaded
      // Hide the upload button by adding a class to the canvas container
      document.getElementById('canvasContainer').classList.add('image-loaded');
    };
    image.src = imageData;
  };

  reader.readAsDataURL(file);
}

// Updated resetImagePosition function
function resetImagePosition() {
  imgX = 0;
  imgY = 0;

  const canvasAspectRatio = canvas.width / canvas.height;
  const imageAspectRatio = uploadedImage.width / uploadedImage.height;

  if (
    uploadedImage.width <= canvas.width &&
    uploadedImage.height <= canvas.height
  ) {
    // Image is smaller than canvas; display at original size
    imgScale = 1;
  } else {
    // Scale down the image to fit within the canvas
    if (imageAspectRatio > canvasAspectRatio) {
      imgScale = canvas.width / uploadedImage.width;
    } else {
      imgScale = canvas.height / uploadedImage.height;
    }
  }

  // Center the image
  imgX = 0;
  imgY = 0;
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
    ctx.fillStyle = '#CCCCCC';
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

    // Apply text style (size, font, weight, and style)
    let fontWeight = isBold ? 'bold' : 'normal';
    let fontStyle = isItalic ? 'italic' : 'normal';
    let currentFont = fonts[currentFontIndex];
    ctx.font = `${fontStyle} ${fontWeight} ${textSize}px '${currentFont}'`;

    wrapAndDrawText(ctx, userText, canvas.width * 0.8); // Adjust maxWidth as needed

    ctx.restore();
  }
}

function wrapAndDrawText(context, text, maxWidth) {
  const lines = [];
  const lineHeight = textSize * 1.2;
  const paragraphs = text.split('\n');

  // Split text into words and handle wrapping
  paragraphs.forEach((paragraph) => {
    let words = paragraph.split(' ');
    let line = '';

    words.forEach((word, index) => {
      let testLine = line + word + ' ';
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > maxWidth && index > 0) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    });

    lines.push(line);
  });

  // Adjust starting Y position to center text vertically
  let y = (-lines.length / 2) * lineHeight + lineHeight / 2;

  // Draw each line of text
  lines.forEach((line) => {
    context.fillText(line.trim(), 0, y);
    context.strokeText(line.trim(), 0, y);

    // Underline
    if (isUnderline) {
      const textWidth = context.measureText(line.trim()).width;
      context.beginPath();
      context.moveTo(-textWidth / 2, y + lineHeight / 4);
      context.lineTo(textWidth / 2, y + lineHeight / 4);
      context.lineWidth = 2;
      context.strokeStyle = textColor;
      context.stroke();
    }

    y += lineHeight;
  });
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

function rotateText() {
  textRotation =
    (document.getElementById('rotationSlider').value * Math.PI) / 180;
  drawCanvas(); // Redraw the canvas after rotation change
}

function nextFont() {
  currentFontIndex = (currentFontIndex + 1) % fonts.length;
  drawCanvas(); // Redraw the canvas after changing font
}

function toggleBold() {
  isBold = !isBold;
  document.getElementById('boldBtn').classList.toggle('active', isBold);
  drawCanvas();
}

function toggleItalic() {
  isItalic = !isItalic;
  document.getElementById('italicBtn').classList.toggle('active', isItalic);
  drawCanvas();
}

function toggleUnderline() {
  isUnderline = !isUnderline;
  document
    .getElementById('underlineBtn')
    .classList.toggle('active', isUnderline);
  drawCanvas();
}

function downloadImage() {
  const dataURL = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = uploadedFileName;
  link.click();
}

// Mouse and Touch Event Handlers

function handleMouseDown(e) {
  const mousePos = getMousePos(canvas, e);
  if (isOverText(mousePos)) {
    isDraggingText = true;
    textStartX = mousePos.x - textX;
    textStartY = mousePos.y - textY;
  } else if (uploadedImage && isOverImage(mousePos)) {
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

function handleTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const touchPos = getTouchPos(canvas, touch);
    if (isOverText(touchPos)) {
      isDraggingText = true;
      textStartX = touchPos.x - textX;
      textStartY = touchPos.y - textY;
    } else if (uploadedImage && isOverImage(touchPos)) {
      isDraggingImage = true;
      imgStartX = touchPos.x;
      imgStartY = touchPos.y;
    }
  } else if (e.touches.length === 2) {
    // Pinch-to-zoom start
    isDraggingImage = false;
    isDraggingText = false;
    initialDistance = getDistanceBetweenTouches(e.touches[0], e.touches[1]);
    initialScale = imgScale;
  }
}

function handleTouchMove(e) {
  e.preventDefault();

  if (e.touches.length === 1) {
    if (isDraggingText) {
      const touch = e.touches[0];
      const touchPos = getTouchPos(canvas, touch);
      textX = touchPos.x - textStartX;
      textY = touchPos.y - textStartY;
      drawCanvas(); // Redraw the canvas when dragging the text
    } else if (isDraggingImage) {
      const touch = e.touches[0];
      const touchPos = getTouchPos(canvas, touch);
      const dx = touchPos.x - imgStartX;
      const dy = touchPos.y - imgStartY;

      imgX += dx;
      imgY += dy;

      imgStartX = touchPos.x;
      imgStartY = touchPos.y;

      drawCanvas(); // Redraw the canvas when dragging
    }
  } else if (e.touches.length === 2) {
    // Pinch-to-zoom move
    const currentDistance = getDistanceBetweenTouches(e.touches[0], e.touches[1]);
    const scaleChange = currentDistance / initialDistance;
    imgScale = initialScale * scaleChange;
    drawCanvas();
  }
}

function handleTouchEnd(e) {
  if (e.touches.length < 2) {
    // Reset variables when touches end
    isDraggingText = false;
    isDraggingImage = false;
  }
}

// Helper Functions

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x:
      ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y:
      ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
}

function getTouchPos(canvas, touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x:
      ((touch.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y:
      ((touch.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
}

function isOverText(pos) {
  ctx.save();
  ctx.translate(textX, textY);
  ctx.rotate(textRotation);

  let fontWeight = isBold ? 'bold' : 'normal';
  let fontStyle = isItalic ? 'italic' : 'normal';
  let currentFont = fonts[currentFontIndex];
  ctx.font = `${fontStyle} ${fontWeight} ${textSize}px '${currentFont}'`;

  const lines = userText.split('\n');
  const lineHeight = textSize * 1.2;
  const textHeight = lines.length * lineHeight;
  const maxLineWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line.trim()).width)
  );

  const dx = pos.x - textX;
  const dy = pos.y - textY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) - textRotation;
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);

  ctx.restore();

  return (
    x > -maxLineWidth / 2 &&
    x < maxLineWidth / 2 &&
    y > -textHeight / 2 &&
    y < textHeight / 2
  );
}

function isOverImage(pos) {
  const imgWidth = uploadedImage.width * imgScale;
  const imgHeight = uploadedImage.height * imgScale;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const x = pos.x - (centerX - imgWidth / 2 + imgX);
  const y = pos.y - (centerY - imgHeight / 2 + imgY);

  return x >= 0 && x <= imgWidth && y >= 0 && y <= imgHeight;
}

function getDistanceBetweenTouches(touch1, touch2) {
  const pos1 = getTouchPos(canvas, touch1);
  const pos2 = getTouchPos(canvas, touch2);
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.hypot(dx, dy);
}

// Zoom functionality with mouse wheel
canvas.addEventListener('wheel', handleScroll);

function handleScroll(e) {
  e.preventDefault();
  const scaleAmount = 0.1;
  if (e.deltaY < 0) {
    imgScale += scaleAmount;
  } else if (e.deltaY > 0) {
    imgScale = Math.max(0.1, imgScale - scaleAmount);
  }
  drawCanvas(); // Redraw the canvas after zooming
}
