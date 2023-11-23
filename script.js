document.getElementById('qrForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const inputName = document.getElementById('nameInput').value;
  const firmwareType = document.querySelector('input[name="firmware"]:checked').value;  
  const qrElement = document.getElementById('qrcode');
  
  if (inputName.trim() !== '') {
    showLoader(); // Show spinner
    generateQRCode(inputName, firmwareType, qrElement);
  } else {
    // If the input is empty, hide the output image
    qrElement.style.display = 'none';
    alert('Please enter a name!');
  }
});

function showLoader() {
  const qrElement = document.getElementById('qrcode');
  qrElement.style.display = 'block';
  qrElement.innerHTML = `<img class="w3-spin" src="qr.png" style="height:2rem;opacity:0.5">`;
}

function generateQRCode(inputName, firmwareType, qrElement) {
  let bgColor = 'ffffff00'; // QS Transparent background

  if (firmwareType === 'Betaflight') {
    bgColor = '00ff00'; // BF Green background
  }

  const canvas = document.createElement('canvas');
  canvas.width = 288;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  
  // Fill the canvas with the background color
  ctx.fillStyle = `#${bgColor}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const qrUrl = `https://chart.googleapis.com/chart?chs=64x64&cht=qr&chl=${encodeURIComponent(inputName)}`;
  
  // Create QR code image
  const qrImage = new Image();
  qrImage.crossOrigin = 'anonymous';
  qrImage.src = qrUrl;
  
  qrImage.onload = function() {
    // Draw QR code on the canvas
    ctx.drawImage(qrImage, 112, 4); // Position the QR code on the canvas
    
    // Create a new image from the canvas data
    const qrWithBackground = canvas.toDataURL();
    
    // Create a new image element with the QR code and background
    const finalQRImage = new Image();
    finalQRImage.src = qrWithBackground;
    finalQRImage.style.width = '100%';
    
    // Display the final QR code image or hide if input is empty
    qrElement.innerHTML = ''; // Clear previous content

    if (inputName.trim() !== '') {
      qrElement.appendChild(finalQRImage);
    
      // Enable download by clicking the QR code image
      finalQRImage.addEventListener('click', function() {
        const downloadLink = document.createElement('a');
        downloadLink.href = qrWithBackground;
        downloadLink.download = firmwareType+'_'+inputName.trim()+'_qr.png';
        downloadLink.click();
      });
    } else {
      qrElement.style.display = 'none';
    }
  };
}
