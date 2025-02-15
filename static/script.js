const localServerUrl = "http://127.0.0.1:5000/upload";
const renderServerUrl = "https://sujeto-anonimo.onrender.com/upload";
const railwayServerUrl = "https://sujetoanonimo-production.up.railway.app/upload";

function getServerUrl() {
    const host = window.location.hostname;

    if (host.includes("localhost") || host.includes("127.0.0.1")) {
        return localServerUrl;
    } else if (host.includes("onrender.com")) {
        return renderServerUrl;
    } else if (host.includes("railway.app")) {
        return railwayServerUrl;
    } else {
        console.warn("Unknown environment. Defaulting to localhost.");
        return localServerUrl;
    }
}

function startClock() {
    const clockElement = document.getElementById('clock');

    function updateClock() {
        const now = new Date();

        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        const dateString = now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: '2-digit'
        });

        clockElement.innerHTML = `${timeString}.${milliseconds}<br>${dateString}`;

        requestAnimationFrame(updateClock);
    }

    updateClock();
}

function sendFrame() {
    const video = document.createElement("video");
    const processedImage = document.getElementById("processed-image");

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

                    canvas.toBlob(blob => {
                        const formData = new FormData();
                        formData.append("file", blob, "image.jpg");

                        fetch(getServerUrl(), { method: "POST", body: formData })
                            .then(response => response.blob())
                            .then(blob => {
                                const imageUrl = URL.createObjectURL(blob);
                                processedImage.src = imageUrl;

                                processedImage.onload = () => {
                                    const imageContainer = document.querySelector('.image-container');
                                    imageContainer.style.width = `${processedImage.width}px`;
                                    imageContainer.style.height = `${processedImage.height}px`;
                                };
                            })
                            .catch(error => console.error("Error:", error));
                    }, "image/jpeg");
                }
                setTimeout(captureAndSend, 100);
            }

            video.addEventListener("loadeddata", () => {
                captureAndSend();
            });
        })
        .catch(err => console.error("Camera access error:", err));
}

function startApp() {
    const titleOverlay = document.getElementById("title-overlay");
    const processedImage = document.getElementById("processed-image");
    const clockOverlay = document.getElementById("clock");
    const recIndicator = document.getElementById("rec-indicator");


    setTimeout(() => {
        titleOverlay.style.display = 'none';
        processedImage.style.display = 'block';
        clockOverlay.style.display = 'block';
        recIndicator.style.display = 'flex';

        sendFrame();
        startClock();
    }, 3000);
}

startApp();
