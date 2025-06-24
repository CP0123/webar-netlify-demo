const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri('models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
        detectLoop();
      };
    });
}

const hat = new Image();
hat.src = './assets/hat.png';

async function detectLoop() {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true);

  ctx.clearRect(0, 0, overlay.width, overlay.height);

  detections.forEach(d => {
    const nose = d.landmarks.getNose()[3];
    const width = 150;
    const height = 100;
    ctx.drawImage(hat, nose.x - width / 2, nose.y - height - 30, width, height);
  });

  requestAnimationFrame(detectLoop);
}

document.getElementById('snapshot').addEventListener('click', () => {
  const snap = document.getElementById('snap');
  snap.width = overlay.width;
  snap.height = overlay.height;
  const sctx = snap.getContext('2d');
  sctx.drawImage(video, 0, 0);
  sctx.drawImage(overlay, 0, 0);
  const data = snap.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = 'snapshot.png';
  a.click();
});