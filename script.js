let uploadedImage = null;
let enhancedImage = null;

document.getElementById('imageUpload').addEventListener('change', loadImage);

function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  
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

  // Resize canvas to fit the image while maintaining aspect ratio
  const maxWidth = 500;
  const maxHeight = 500;
  let width = image.width;
  let height = image.height;

  if (width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width *= maxHeight / height;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, width, height);
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

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      image: imageDataUrl,
      tasks: [{ name: 'upscale' }] // Adjust based on the API's requirements
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();
  // Assume the API returns the enhanced image as a Data URL in result.data.enhancedImage
  return result.data.enhancedImage; // Adjust based on the API's actual response
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
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;

  // Wrap text and draw it on the canvas
  const maxWidth = ctx.canvas.width - 40;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = 40;
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
  link.download = 'quote-image.png';
  link.href = canvas.toDataURL('image/png');
  
  // Append the link to the document
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up by removing the link
  document.body.removeChild(link);
}
