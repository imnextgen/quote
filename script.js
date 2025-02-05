let uploadedImage = null;

document.getElementById('imageUpload').addEventListener('change', loadImage);

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

function loadImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    const imageData = e.target.result;
    const enhancedImage = await enhanceImage(imageData);

    const canvas = document.getElementById('statusCanvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = enhancedImage; // Use the enhanced image

    image.onload = function() {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      uploadedImage = image; // Store the enhanced image
    };
  };

  reader.readAsDataURL(file);
}

function generateQuoteImage() {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  const text = document.getElementById('quoteText').value;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw the uploaded (enhanced) image
  if (uploadedImage) {
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
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
