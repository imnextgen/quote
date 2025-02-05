let uploadedImage = null;

document.getElementById('imageUpload').addEventListener('change', loadImage);

function loadImage(event) {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();
  
  image.onload = function() {
    // Resize canvas to match the uploaded image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image on canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    uploadedImage = image; // Store the uploaded image
  };

  // Load the selected image
  image.src = URL.createObjectURL(event.target.files[0]);
}

function generateQuoteImage() {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  const text = document.getElementById('quoteText').value;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw the uploaded image
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
