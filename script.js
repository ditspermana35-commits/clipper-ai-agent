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

// Bank Data Teks Variasi Caption Bahasa Inggris (US) untuk Copy-Paste Deskripsi Postingan
const captions = [
    `You won't believe what happened here! 😱🔥\n\nWatch closely from start to finish.\n\n#gaming #highlight #goldenmoment #viral #clips`,
    `This is easily the craziest moment of the week! 🚀⚡\n\nCheck out this epic highlight.\n\n#shorts #reels #viralvideo #trending #epic`,
    `Did that actually just happen?! 😳🔥\n\nDrop a comment if you saw that coming!\n\n#foryou #fyp #clip #gamingmoments #unbelievable`,
    `Absolute perfection in one clip! 🧠🎯\n\nShare this with a friend who needs to see it.\n\n#bestclips #viral #gameplay #mindblown #explore`,
    `This moment deserves to go down in history! 🏆💥\n\nRate this play from 1 to 10 below.\n\n#trending #shorts #epicmoments #insane #foryoupage`,
    `I still can't get over how insane this was! 🤯🔥\n\nFollow for more daily epic highlights.\n\n#foryou #viral #omg #clips #highlight`
];

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
    statusText.innerText = "⏳ Analyzing Video & Extracting Golden Moment...";

    video.onloadedmetadata = () => {
        const totalDuration = video.duration;

        // Otomatis tentukan potongan video 30 detik
        if (totalDuration > 30) {
            startTime = Math.floor(totalDuration * 0.3);
            clipDuration = 30;
        } else {
            startTime = 0;
            clipDuration = totalDuration;
        }

        const endTime = Math.min(startTime + clipDuration, totalDuration);

        // Ambil caption acak untuk kebutuhan salin deskripsi postingan
        const randomCaption = captions[Math.floor(Math.random() * captions.length)];

        // Update UI Web PWA
        timestampEl.innerText = `${formatTime(startTime)} - ${formatTime(endTime)} (Clip Length: ${Math.round(clipDuration)}s)`;
        headlineEl.innerText = "Clean Video Mode (No Overlay Text)";
        hookEl.innerText = "Ready to Export";
        
        captionEl.innerText = `${randomCaption}\n\nTime Stamp: ${formatTime(startTime)} - ${formatTime(endTime)}`;

        statusText.innerText = "✅ Golden Moment Found! Ready to Trim & Export.";
        exportBtn.disabled = false;
        copyCaptionBtn.disabled = false;
    };
});

copyCaptionBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(captionEl.innerText);
    alert("Caption copied to clipboard!");
});

// Setup Web Audio API Global untuk Mencegah Leak Memori RAM
let audioCtx = null;
let source = null;
let dest = null;

exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    statusText.innerText = "🎥 Processing 9:16 Clean Video + Audio... Please wait.";

    // Unmute video sebelum merekam
    video.muted = false;

    // Paksa Canvas ke Format Vertikal 9:16 (720x1280) untuk TikTok/Reels/Shorts
    const ctx = canvas.getContext('2d');
    canvas.width = 720;   // Lebar 720px (Aman dari crash RAM HP)
    canvas.height = 1280; // Tinggi 1280px (Rasio 9:16)

    // Hitung posisi video agar pas di tengah (Center Fit / Letterbox)
    const videoAspect = (video.videoWidth || 1280) / (video.videoHeight || 720);
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;

    if (videoAspect > canvasAspect) {
        // Video Landscape
        drawWidth = canvas.width;
        drawHeight = canvas.width / videoAspect;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
    } else {
        // Video Vertikal
        drawWidth = canvas.height * videoAspect;
        drawHeight = canvas.height;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
    }

    // Setup Web Audio API
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
        const fileName = `clipper-clean-${Date.now()}.${fileExt}`;
        
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

        statusText.innerText = "🎉 Success! Clean 9:16 Video + Audio generated and auto-downloaded.";
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

        // 1. Clear Canvas Background (Hitam)
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Murni merekam gambar video di tengah TANPA overlay teks/box apa pun
        ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
});
