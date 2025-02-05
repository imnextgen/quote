let uploadedImage = null;
let enhancedImageSrc = null;

document.getElementById('imageUpload').addEventListener('change', loadImage);

function loadImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const imageData = e.target.result;
    const image = new Image();
    image.onload = function() {
      drawImageToFitCanvas(image);
      uploadedImage = image; // Store the uploaded image
    };
    image.src = imageData;
  };

  reader.readAsDataURL(file);
}

function drawImageToFitCanvas(image) {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 500;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const aspectRatio = image.width / image.height;
  let drawWidth, drawHeight;

  if (aspectRatio > 1) {
    drawWidth = canvas.width;
    drawHeight = drawWidth / aspectRatio;
  } else {
    drawHeight = canvas.height;
    drawWidth = drawHeight * aspectRatio;
  }

  const offsetX = (canvas.width - drawWidth) / 2;
  const offsetY = (canvas.height - drawHeight) / 2;

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

async function enhanceAndDrawImage() {
  if (!uploadedImage) return;

  const imageData = uploadedImage.src;
  const enhancedImage = await enhanceImage(imageData);

  const image = new Image();
  image.onload = function() {
    drawImageToFitCanvas(image);
    enhancedImageSrc = image.src;
  };
  image.src = enhancedImage;
}

async function enhanceImage(imageData) {
  const response = await fetch('https://api.example.com/v1/enhance', { // Replace with actual API URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY' // Replace with your API key
    },
    body: JSON.stringify({
      image: imageData,
      tasks: [{ name: 'upscale' }] // Adjust based on the API's requirements
    })
  });

  const result = await response.json();
  return result.enhancedImage; // Adjust based on the API's response structure
}

function generateQuoteImage() {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  const text = document.getElementById('quoteText').value;

  // Redraw the uploaded (enhanced) image
  if (uploadedImage) {
    drawImageToFitCanvas(uploadedImage);
  }
  if (enhancedImageSrc) {
    const enhancedImage = new Image();
    enhancedImage.src = enhancedImageSrc;
    enhancedImage.onload = function() {
      drawImageToFitCanvas(enhancedImage);
    };
  }

  // Set text properties
  ctx.fillStyle = '#FFFFFF'; // Text color
  ctx.font = '30px Arial'; // Font size and style
  ctx.textAlign = 'center'; // Center-align the text
  ctx.textBaseline = 'middle'; // Vertically center the text

  // Draw text
  const lines = wrapText(ctx, text, canvas.width - 40);
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index * 40));
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  let lines = [];
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
  const canvas = document.getElementById('statusCanvas');
  const link = document.createElement('a');
  link.download = 'quote-image.png';
  link.href = canvas.toDataURL('image/png', 1.0); // High-quality PNG
  link.click();
}
