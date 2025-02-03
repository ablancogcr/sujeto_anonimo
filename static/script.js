const processedImage = document.getElementById("processed-image");
const serverUrl = "/upload"; // Will work locally & on Railway

// Function to capture and send frames
function sendFrame() {
    const video = document.createElement("video");  // Hidden video element
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            function captureAndSend() {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert canvas to blob and send to the server
                    canvas.toBlob(blob => {
                        const formData = new FormData();
                        formData.append("file", blob, "image.jpg");

                        fetch(serverUrl, { method: "POST", body: formData })
                            .then(response => response.blob())
                            .then(blob => {
                                // Update processed image
                                processedImage.src = URL.createObjectURL(blob);
                            })
                            .catch(error => console.error("Error:", error));
                    }, "image/jpeg");
                }
                setTimeout(captureAndSend, 100); // Capture every 100ms (~10 FPS)
            }

            video.addEventListener("loadeddata", () => {
                captureAndSend();
            });
        })
        .catch(err => console.error("Error accessing the camera:", err));
}

// Start sending frames
sendFrame();
