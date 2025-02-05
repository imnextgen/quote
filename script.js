let uploadedImage = null;
let uploadedFileName = 'quote-image.png';

const canvasContainer = document.getElementById('canvasContainer');
const canvas = document.getElementById('statusCanvas');
const ctx = canvas.getContext('2d');

let isDragging = false;
let startX, startY;
let imgX = 0, imgY = 0;
let imgScale = 1;
let lastDist = 0;

document.getElementById('imageUpload').addEventListener('change', loadImage);

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', duringDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseout', endDrag);

canvas.addEventListener('wheel', handleScroll);

canvas.addEventListener('touchstart', startTouch, {passive: false});
canvas.addEventListener('touchmove', moveTouch, {passive: false});
canvas.addEventListener('touchend', endTouch);

function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFileName = file.name || 'quote-image.png';

  const reader = new FileReader();

  reader.onload = function(e) {
    const imageData = e.target.result;
    const image = new Image();
    image.onload = function() {
      uploadedImage = image;
      resetImagePosition();
      drawImage();
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

function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }
}

function startDrag(e) {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
}

function duringDrag(e) {
  if (isDragging && uploadedImage) {
    const dx = e.offsetX - startX;
    const dy = e.offsetY - startY;
    imgX += dx;
    imgY += dy;
    startX = e.offsetX;
    startY = e.offsetY;
    drawImage();
  }
}

function endDrag() {
  isDragging = false;
}

function handleScroll(e) {
  e.preventDefault();
  if (uploadedImage) {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    imgScale += delta;
    if (imgScale < 0.1) imgScale = 0.1;
    drawImage();
  }
}

// Touch events for mobile devices
function startTouch(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    lastDist = getTouchDist(e);
  }
  e.preventDefault();
}

function moveTouch(e) {
  if (e.touches.length === 1 && isDragging && uploadedImage) {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    imgX += dx;
    imgY += dy;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    drawImage();
  } else if (e.touches.length === 2 && uploadedImage) {
    const dist = getTouchDist(e);
    const delta = dist - lastDist;
    imgScale += delta * 0.005;
    if (imgScale < 0.1) imgScale = 0.1;
    lastDist = dist;
    drawImage();
  }
  e.preventDefault();
}

function endTouch(e) {
  isDragging = false;
  e.preventDefault();
}

function getTouchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function generateQuoteImage() {
  if (!uploadedImage) {
    alert("Please upload an image first.");
    return;
  }

  // Redraw image to ensure it's up to date
  drawImage();

  const text = document.getElementById('quoteText').value.trim();
  if (!text) {
    alert("Please enter a quote.");
    return;
  }

  // Add text
  addTextToCanvas(ctx, text);
}

function addTextToCanvas(ctx, text) {
  // Set text properties
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;

  const maxWidth = canvas.width - 40;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = 40;
  const totalTextHeight = lines.length * lineHeight;
  let y = canvas.height / 2 - totalTextHeight / 2 + lineHeight / 2;

  lines.forEach((line) => {
    ctx.strokeText(line, canvas.width / 2, y);
    ctx.fillText(line, canvas.width / 2, y);
    y += lineHeight;
  });
}

function wrapText(ctx, text, maxWidth) {
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
  return lines;
}

function downloadImage() {
  if (!uploadedImage) {
    alert("Please generate an image before downloading.");
    return;
  }

  // Create a temporary canvas to generate the image at the desired dimensions
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 1080;  // WhatsApp ideal width
  tempCanvas.height = 1920; // WhatsApp ideal height
  const tempCtx = tempCanvas.getContext('2d');

  // Calculate image position and scale for the temporary canvas
  const scaleFactor = tempCanvas.width / canvas.width;

  // Draw the image onto the temporary canvas
  tempCtx.fillStyle = '#000';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  if (uploadedImage) {
    const imgWidth = uploadedImage.width * imgScale * scaleFactor;
    const imgHeight = uploadedImage.height * imgScale * scaleFactor;

    const centerX = tempCanvas.width / 2;
    const centerY = tempCanvas.height / 2;

    tempCtx.drawImage(
      uploadedImage,
      centerX - imgWidth / 2 + imgX * scaleFactor,
      centerY - imgHeight / 2 + imgY * scaleFactor,
      imgWidth,
      imgHeight
    );
  }

  // Add text onto the temporary canvas
  addTextToCanvas(tempCtx, document.getElementById('quoteText').value.trim());

  // Save the image
  const link = document.createElement('a');

  // Use uploaded image's filename for download
  const baseFileName = uploadedFileName.replace(/\.[^/.]+$/, ''); // Remove extension

  link.download = baseFileName + '.png';

  link.href = tempCanvas.toDataURL('image/png');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
