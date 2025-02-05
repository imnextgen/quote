function generateQuoteImage() {
  const canvas = document.getElementById('statusCanvas');
  const ctx = canvas.getContext('2d');
  const text = document.getElementById('quoteText').value;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set background color
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set text properties
  ctx.fillStyle = '#000000';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text
  const lines = wrapText(ctx, text, canvas.width - 40);
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, 50 + (index * 30));
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
