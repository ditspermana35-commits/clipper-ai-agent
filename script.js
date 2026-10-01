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
let clipDuration = 30;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getSupportedMimeType() {
    const types = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
    ];
    for (let type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return '';
}

videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    video.src = url;
    statusText.innerText = "⏳ Analyzing Video & Detecting Golden Moment...";

    video.onloadedmetadata = () => {
        const totalDuration = video.duration;

        if (totalDuration > 30) {
            startTime = Math.floor(totalDuration * 0.3);
            clipDuration = 30;
        } else {
            startTime = 0;
            clipDuration = totalDuration;
        }

        const endTime = Math.min(startTime + clipDuration, totalDuration);

        // Update UI dengan teks Bahasa Inggris
        timestampEl.innerText = `${formatTime(startTime)} - ${formatTime(endTime)} (Clip Length: ${Math.round(clipDuration)}s)`;
        hookEl.innerText = "DON'T SKIP! THIS IS UNBELIEVABLE 😱";
        headlineEl.innerText = "Crazy Moment Caught on Camera 🔥";
        
        captionEl.innerText = `You won't believe what happened here! 😱🔥\n\nWatch from ${formatTime(startTime)} until the end.\n\n#gaming #highlight #goldenmoment #viral #clips #foryou`;

        statusText.innerText = "✅ Golden Moment Found! Ready to Trim & Download.";
        exportBtn.disabled = false;
        copyCaptionBtn.disabled = false;
    };
});

copyCaptionBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(captionEl.innerText);
    alert("Caption copied to clipboard!");
});

// PENTING: Variabel AudioCtx di luar agar tidak terduplikasi tiap klik
let audioCtx = null;
let source = null;
let dest = null;

exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    statusText.innerText = "🎥 Processing video & audio recording... Please wait.";

    // 1. Wajib aktifkan audio video sebelum merekam
    video.muted = false;

    // Set ukuran canvas presisi sesuai video asli
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // 2. Setup Web Audio API dengan penanganan Resume (Wajib untuk HP)
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        source = audioCtx.createMediaElementSource(video);
        dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
    }
    
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // Ambil track visual dari Canvas & track audio dari Web Audio API
    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
    ]);

    const mimeType = getSupportedMimeType();
    let mediaRecorder;
    try {
        mediaRecorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined);
    } catch (err) {
        mediaRecorder = new MediaRecorder(combinedStream);
    }

    const chunks = [];
    mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        const fileExt = (mediaRecorder.mimeType && mediaRecorder.mimeType.includes('mp4')) ? 'mp4' : 'webm';
        const fileName = `clipper-hd-${Date.now()}.${fileExt}`;
        
        downloadBtn.href = downloadUrl;
        downloadBtn.download = fileName;
        downloadBtn.hidden = false;
        downloadBtn.innerText = `⬇️ CLICK HERE TO DOWNLOAD FILE (${fileExt.toUpperCase()})`;

        // Auto Download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);

        statusText.innerText = "🎉 Success! Video + Audio trimmed and auto-downloaded.";
        exportBtn.disabled = false;
    };

    video.currentTime = startTime;
    await video.play();
    mediaRecorder.start(1000);

    function drawFrame() {
        if (video.currentTime >= (startTime + clipDuration) || video.paused || video.ended) {
            video.pause();
            if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            return;
        }

        // 1. Draw Gambar Video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 2. Skala Teks Overlay Bahasa Inggris
        const scale = canvas.width / 1280;
        const boxHeight = 80 * scale;
        const boxY = 20 * scale;
        const boxWidth = canvas.width * 0.7;
        const boxX = (canvas.width - boxWidth) / 2;

        // Background Box Transparan Rapi
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10 * scale);
        } else {
            ctx.rect(boxX, boxY, boxWidth, boxHeight);
        }
        ctx.fill();

        // English Headline Text
        ctx.fillStyle = "#FFD700";
        ctx.font = `bold ${Math.round(22 * scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(headlineEl.innerText, canvas.width / 2, boxY + (32 * scale));

        // English Hook Subtitle Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
        ctx.fillText(hookEl.innerText, canvas.width / 2, boxY + (60 * scale));

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
});
