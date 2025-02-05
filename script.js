let uploadedImage = null;
let enhancedImage = null;
let uploadedFileName = 'quote-image.png'; // Default file name

document.getElementById('imageUpload').addEventListener('change', loadImage);

function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  uploadedFileName = file.name || 'quote-image.png'; // Store the uploaded file's name
  
  const reader = new FileReader();

  reader.onload = function(e) {
    const imageData = e.target.result;
    const image = new Image();
    image.onload = function() {
      uploadedImage = image;
      enhancedImage = null; // Reset enhanced image
      displayImageOnCanvas(image);
    };
    image.src = imageData;
  };

  reader.readAsDataURL(file);
}

function displayImageOnCanvas(image) {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions for WhatsApp status
  const targetWidth = 1080;
  const targetHeight = 1920;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Fill canvas with black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate aspect ratios
  const imageAspectRatio = image.width / image.height;
  const canvasAspectRatio = targetWidth / targetHeight;

  let drawWidth, drawHeight;
  if (imageAspectRatio > canvasAspectRatio) {
    // Image is wider than canvas
    drawWidth = targetWidth;
    drawHeight = drawWidth / imageAspectRatio;
  } else {
    // Image is taller than canvas
    drawHeight = targetHeight;
    drawWidth = drawHeight * imageAspectRatio;
  }

  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

async function enhanceAndDrawImage() {
  if (!uploadedImage) {
    alert("Please upload an image first.");
    return;
  }

  // Convert the image to a Data URL
  const imageDataUrl = uploadedImage.src;

  try {
    const enhancedImageDataUrl = await enhanceImage(imageDataUrl);
    const image = new Image();
    image.onload = function() {
      enhancedImage = image;
      displayImageOnCanvas(image);
    };
    image.src = enhancedImageDataUrl;
  } catch (error) {
    console.error("Enhancement failed:", error);
    alert("Image enhancement failed. Please try again.");
  }
}

async function enhanceImage(imageDataUrl) {
  // Replace with your actual API endpoint and API key
  const apiUrl = 'https://api.example.com/v1/enhance'; // Replace with actual API URL
  const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key

  const base64Image = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      image_data: base64Image
      // Include other parameters as required
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    throw new Error(errorData.message || 'Unknown API error');
  }

  const result = await response.json();
  // Adjust according to the API's response
  const enhancedImageDataUrl = 'data:image/png;base64,' + result.data.enhanced_image_base64;
  return enhancedImageDataUrl;
}

function generateQuoteImage() {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  const text = document.getElementById('quoteText').value.trim();

  if (!uploadedImage && !enhancedImage) {
    alert("Please upload an image first.");
    return;
  }

  if (!text) {
    alert("Please enter a quote.");
    return;
  }

  // Use the enhanced image if available, else use the uploaded image
  const imageToUse = enhancedImage || uploadedImage;
  displayImageOnCanvas(imageToUse);

  // Add text
  addTextToCanvas(ctx, text);
}

function addTextToCanvas(ctx, text) {
  // Set text properties
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;

  // Wrap text and draw it on the canvas
  const maxWidth = ctx.canvas.width - 200;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = 100;
  const totalTextHeight = lines.length * lineHeight;
  let y = (ctx.canvas.height - totalTextHeight) / 2 + lineHeight / 2;

  lines.forEach((line) => {
    // Outline for better visibility
    ctx.strokeText(line, ctx.canvas.width / 2, y);
    ctx.fillText(line, ctx.canvas.width / 2, y);
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
  const canvas = document.getElementById('statusCanvas');

  if (!uploadedImage && !enhancedImage) {
    alert("Please generate an image before downloading.");
    return;
  }

  const link = document.createElement('a');

  // Use uploaded image's filename for download
  const fileExtension = uploadedFileName.split('.').pop();
  const baseFileName = uploadedFileName.replace(/\.[^/.]+$/, ""); // Remove extension

  link.download = baseFileName + '.png';

  // Use canvas as is since it's already set to 1080x1920
  link.href = canvas.toDataURL('image/png');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
