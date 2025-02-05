let uploadedImage = null;
let uploadedFileName = 'quote-image.png';

const canvas = document.getElementById('statusCanvas');
const ctx = canvas.getContext('2d');

let imgX = 0, imgY = 0;
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

let currentFontIndex = 0;
const fonts = ['Arial', 'Roboto', 'Lobster', 'Montserrat', 'Oswald', 'Pacifico', 'Dancing Script'];

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

document.getElementById('rotationSlider').addEventListener('input', rotateText);
document.getElementById('downloadBtn').addEventListener('click', downloadImage);

function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFileName = file.name || 'quote-image.png';

  const reader = new FileReader();

  reader.onload = function (e) {
    const imageData = e.target.result;
    const image = new Image();
    image.onload = function () {
      uploadedImage = image;
      resetImagePosition();
      drawCanvas();
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

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontStyle = styles[currentStyleIndex];
    let fontSize = 30;

    let currentFont = fonts[currentFontIndex];
    ctx.font = `${fontStyle} ${fontSize}px '${currentFont}'`;

    wrapAndDrawText(ctx, userText, 300);

    ctx.restore();
  }
}

function wrapAndDrawText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  const lineHeight = 35;
  let y = -((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line) => {
    ctx.strokeText(line, 0, y);
    ctx.fillText(line, 0, y);
    y += lineHeight;
  });
}

function addText() {
  // Get the text from the input field
  const textInput = document.getElementById('quoteText').value.trim();
  if (textInput === '') {
    alert('Please enter a quote.');
    return;
  }
  userText = textInput;
  drawCanvas();
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
    drawCanvas();
  } else if (isDraggingImage) {
    const mousePos = getMousePos(canvas, e);
    const dx = mousePos.x - imgStartX;
    const dy = mousePos.y - imgStartY;
    imgX += dx;
    imgY += dy;
    imgStartX = mousePos.x;
    imgStartY = mousePos.y;
    drawCanvas();
  }
}

function handleMouseUp() {
  isDraggingText = false;
  isDraggingImage = false;
}

function handleScroll(e) {
  e.preventDefault();
  if (uploadedImage) {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    imgScale += delta;
    if (imgScale < 0.1) imgScale = 0.1;
    drawCanvas();
  }
}

// Touch Events
function handleTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touchPos = getTouchPos(canvas, e);
    if (isOverText(touchPos)) {
      isDraggingText = true;
      textStartX = touchPos.x - textX;
      textStartY = touchPos.y - textY;
    } else if (uploadedImage) {
      isDraggingImage = true;
      imgStartX = touchPos.x;
      imgStartY = touchPos.y;
    }
  } else if (e.touches.length === 2 && uploadedImage) {
    lastDist = getTouchDist(e);
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 1 && isDraggingText) {
    const touchPos = getTouchPos(canvas, e);
    textX = touchPos.x - textStartX;
    textY = touchPos.y - textStartY;
    drawCanvas();
  } else if (e.touches.length === 1 && isDraggingImage) {
    const touchPos = getTouchPos(canvas, e);
    const dx = touchPos.x - imgStartX;
    const dy = touchPos.y - imgStartY;
    imgX += dx;
    imgY += dy;
    imgStartX = touchPos.x;
    imgStartY = touchPos.y;
    drawCanvas();
  } else if (e.touches.length === 2 && uploadedImage) {
    const dist = getTouchDist(e);
    const delta = dist - lastDist;
    imgScale += delta * 0.005;
    if (imgScale < 0.1) imgScale = 0.1;
    lastDist = dist;
    drawCanvas();
  }
}

function handleTouchEnd() {
  isDraggingText = false;
  isDraggingImage = false;
}

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getTouchPos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.touches[0].clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.touches[0].clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getTouchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function isOverText(pos) {
  if (!userText) return false;

  ctx.save();
  ctx.translate(textX, textY);
  ctx.rotate(textRotation);

  let fontStyle = styles[currentStyleIndex];
  let fontSize = 30;
  let currentFont = fonts[currentFontIndex];
  ctx.font = `${fontStyle} ${fontSize}px '${currentFont}'`;

  const metrics = ctx.measureText(userText);
  const textWidth = metrics.width;
  const textHeight = fontSize; // Approximate height

  ctx.restore();

  // Create a rectangle around the text
  const rectX = textX - textWidth / 2;
  const rectY = textY - textHeight / 2;
  const rectWidth = textWidth;
  const rectHeight = textHeight;

  // Check if position is within the rectangle
  return (
    pos.x >= rectX &&
    pos.x <= rectX + rectWidth &&
    pos.y >= rectY &&
    pos.y <= rectY + rectHeight
  );
}

function nextFont() {
  currentFontIndex = (currentFontIndex + 1) % fonts.length;
  drawCanvas();
}

function nextStyle() {
  currentStyleIndex = (currentStyleIndex + 1) % styles.length;
  drawCanvas();
}

function rotateText() {
  const angle = document.getElementById('rotationSlider').value;
  textRotation = angle * (Math.PI / 180); // Convert degrees to radians
  drawCanvas();
}

function downloadImage() {
  drawCanvas();

  // Create a temporary canvas for the full-size image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 1080; // Ideal width for WhatsApp status
  tempCanvas.height = 1920; // Ideal height for WhatsApp status
  const tempCtx = tempCanvas.getContext('2d');

  // Scale factors to adjust positions and sizes accordingly
  const scaleX = tempCanvas.width / canvas.width;
  const scaleY = tempCanvas.height / canvas.height;

  // Draw the image onto the temporary canvas
  if (uploadedImage) {
    const imgWidth = uploadedImage.width * imgScale * scaleX;
    const imgHeight = uploadedImage.height * imgScale * scaleY;

    const centerX = tempCanvas.width / 2;
    const centerY = tempCanvas.height / 2;

    tempCtx.drawImage(
      uploadedImage,
      centerX - imgWidth / 2 + imgX * scaleX,
      centerY - imgHeight / 2 + imgY * scaleY,
      imgWidth,
      imgHeight
    );
  } else {
    // Fill the background if no image is uploaded
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }

  // Draw the text onto the temporary canvas
  if (userText) {
    tempCtx.save();

    tempCtx.translate(textX * scaleX, textY * scaleY);
    tempCtx.rotate(textRotation);

    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.strokeStyle = '#000000';
    tempCtx.lineWidth = 4;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';

    const fontStyle = styles[currentStyleIndex];
    const fontSize = 80;
    const currentFont = fonts[currentFontIndex];

    tempCtx.font = `${fontStyle} ${fontSize}px '${currentFont}'`;

    wrapAndDrawText(tempCtx, userText, 1000);

    tempCtx.restore();
  }

  // Convert the canvas to a data URL
  const dataURL = tempCanvas.toDataURL('image/png');

  // Create a temporary link element to initiate the download
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = uploadedFileName.replace(/\.[^/.]+$/, '') + '.png';

  // Append the link to the body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
}

