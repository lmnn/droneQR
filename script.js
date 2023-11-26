document.getElementById("qrForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const inputName = document.getElementById("nameInput").value;
  const firmwareType = document.querySelector(
    'input[name="firmware"]:checked'
  ).value;
  const qrElement = document.getElementById("qrcode");

  if (inputName.trim() !== "") {
    showLoader(); // Show spinner
    generateQRCode(inputName, firmwareType, qrElement);
  } else {
    // If the input is empty, hide the output image
    qrElement.style.display = "none";
    alert("Please enter a name!");
  }
});

function showLoader() {
  const qrElement = document.getElementById("qrcode");
  qrElement.style.display = "block";
  qrElement.innerHTML = `<img class="w3-spin" src="qr.png" style="height:2rem;opacity:0.5">`;
}

function generateQRCode(inputName, firmwareType, qrElement) {
  let bgColor = "ffffff00"; // QS Transparent background
  let bgImageDataColor = 0;

  if (firmwareType === "Betaflight") {
    bgColor = "00ff00"; // BF Green background
    bgImageDataColor = 4278255360;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 288;
  canvas.height = 72;
  const ctx = canvas.getContext("2d");

  const generatedQr = new QRious({
    value: inputName,
    size: canvas.height,
  });

  // Fill the canvas with the background color
  ctx.fillStyle = `#${bgColor}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const disableText = document.getElementById('hideName').checked;
  if (!disableText) {
    ctx.textRendering = "optimizeSpeed";
    ctx.font = "24px DePixel";
    ctx.fillStyle = "white";
    ctx.fillText(inputName, 76, 42, 208);
  }

  // Get pixel data from canvas
  const data32 = new Uint32Array(
    ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Refill the canvas with the background color
  ctx.fillStyle = `#${bgColor}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw QR code on the canvas
  ctx.drawImage(generatedQr.image, 0, 0);

  // Walk through array of canvas pixel data and draw only the ones that aren't the background color
  for (let i = 0; i < data32.length; i++) {
    if (data32[i] !== bgImageDataColor) {
      ctx.fillStyle = `#fff`;
      ctx.fillRect(i % canvas.width, (i / canvas.width) | 0, 1, 1);

      ctx.fillStyle = `#000`;
      ctx.fillRect((i % canvas.width) + 1, (i / canvas.width + 1) | 0, 1, 1);
    }
  }

  // Create a new image from the canvas data
  setTimeout(() => {
    // Draw QR code on the canvas again in case gpu wasn't done with the process the first time
    ctx.drawImage(generatedQr.image, 0, 0);
    const qrWithBackground = canvas.toDataURL();
    // Create a new image element with the QR code and background
    const finalQRImage = new Image();
    finalQRImage.src = qrWithBackground;
    finalQRImage.style.width = "100%";

    // Display the final QR code image or hide if input is empty
    qrElement.innerHTML = ""; // Clear previous content

    if (inputName.trim() !== "") {
      qrElement.appendChild(finalQRImage);

      // Enable download by clicking the QR code image
      finalQRImage.addEventListener("click", function () {
        const downloadLink = document.createElement("a");
        downloadLink.href = qrWithBackground;
        downloadLink.download = firmwareType + "_" + inputName.trim() + "_qr.png";
        downloadLink.click();
      });
    } else {
      qrElement.style.display = "none";
    }
  }, 0)
}
