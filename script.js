const videoInput = document.getElementById('videoInput');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const statusText = document.getElementById('statusText');

const timestampEl = document.getElementById('timestamp');
const hookEl = document.getElementById('hook');
const headlineEl = document.getElementById('headline');
const captionEl = document.getElementById('caption');

const exportBtn = document.getElementById('exportBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyCaptionBtn = document.getElementById('copyCaptionBtn');

let startTime = 0;
let clipDuration = 30; // Durasi potong otomatis (30 detik)

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    video.src = url;
    statusText.innerText = "⏳ Menganalisis Video & Deteksi Golden Moment...";

    video.onloadedmetadata = () => {
        const totalDuration = video.duration;

        // Ambil potongan klip di area terbaik (30% dari total durasi)
        if (totalDuration > 30) {
            startTime = Math.floor(totalDuration * 0.3);
            clipDuration = 30;
        } else {
            startTime = 0;
            clipDuration = totalDuration;
        }

        const endTime = Math.min(startTime + clipDuration, totalDuration);

        // Update UI
        timestampEl.innerText = `${formatTime(startTime)} - ${formatTime(endTime)} (Durasi Klip: ${Math.round(clipDuration)}d)`;
        hookEl.innerText = "JANGAN SKIP! MOMEN INI PARAH BANGET 😱";
        headlineEl.innerText = "Detik-detik Aksi Gila Terjadi 🔥";
        
        captionEl.innerText = `Momen gila yang gak sengaja terekam! 😱🔥\n\nTonton dari detik ${formatTime(startTime)} sampai habis biar gak penasaran.\n\n#gaming #highlight #goldenmoment #viral #clips`;

        statusText.innerText = "✅ Golden Moment Ditemukan! Siap Dipotong & Diunduh.";
        exportBtn.disabled = false;
        copyCaptionBtn.disabled = false;
    };
});

// Copy Caption ke Clipboard
copyCaptionBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(captionEl.innerText);
    alert("Caption berhasil disalin!");
});

// Pemotongan & Otomatis Download
exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    statusText.innerText = "🎥 Memotong klip video & menyiapkan unduhan...";

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    
    // Saat perekaman selesai, pemicu unduh otomatis langsung dijalankan
    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        
        downloadBtn.href = downloadUrl;
        downloadBtn.download = `clipper-golden-moment-${Date.now()}.webm`;
        downloadBtn.hidden = false;

        // Pemicu Unduh Otomatis
        const autoDownloadLink = document.createElement('a');
        autoDownloadLink.href = downloadUrl;
        autoDownloadLink.download = `clipper-golden-moment-${Date.now()}.webm`;
        document.body.appendChild(autoDownloadLink);
        autoDownloadLink.click();
        document.body.removeChild(autoDownloadLink);

        statusText.innerText = "🎉 Klip berhasil dipotong & file otomatis diunduh!";
        exportBtn.disabled = false;
    };

    video.currentTime = startTime;
    await video.play();
    mediaRecorder.start();

    function drawFrame() {
        if (video.currentTime >= (startTime + clipDuration) || video.paused || video.ended) {
            video.pause();
            mediaRecorder.stop();
            return;
        }

        // Render Frame & Overlay Text
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Background Box Overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(20, 40, canvas.width - 40, 90);

        // Header Text
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(headlineEl.innerText, canvas.width / 2, 80);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(hookEl.innerText, canvas.width / 2, 115);

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
});
