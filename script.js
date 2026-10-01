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
let detectedClips = [];

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

// Bank Data Content Strategy Engine (Lokal / No API)
const STRATEGY_BANK = [
    {
        headline: "1 HP AND A DREAM OR GAME OVER? 💀",
        hooks: [
            "HOOK AGGRESSIVE A: 1 HP AND A DREAM OR GAME OVER? 💀",
            "HOOK AGGRESSIVE B: HE ACTUALLY THOUGHT HE HAD ME HERE 🔥",
            "HOOK ELEGANT A: When every single bullet decides your fate... 🎯",
            "HOOK ELEGANT B: The most stressful 1v1 in history 🤫"
        ],
        captions: [
            "CAPTION A (DRAMA / ENGAGEMENT BAIT):\n1v1 for the whole tournament and my heart was literally pounding 💀\n\nWould you have pushed or held the angle here?\nDrop your rank in the comments down below! 👇\n\n#gaming #clutch #valorant #fps #viral",
            "CAPTION B (SHOCK / HIGH-SAVEABILITY):\nHe really thought he had this round secured 🔥\n\nSave this clip to learn how to hold calm under pressure in 1v1s!\nTag a friend who always whiffs these shots 👇\n\n#gaminghighlights #clutchmoment #pcgaming #gamer #esports"
        ]
    },
    {
        headline: "NEVER CELEBRATE TOO EARLY UNLESS... 😤",
        hooks: [
            "HOOK AGGRESSIVE A: NEVER CELEBRATE TOO EARLY UNLESS... 😤",
            "HOOK AGGRESSIVE B: THE REACTION WHEN YOU FINALLY WIN 🏆",
            "HOOK ELEGANT A: Pure adrenaline in a single round... ⚡",
            "HOOK ELEGANT B: This feeling after winning a 1v1 tournament round 💯"
        ],
        captions: [
            "CAPTION A (DRAMA / ENGAGEMENT BAIT):\nThe reaction says it all... absolute pure adrenaline 😤\n\nHow do you react when you win a high stakes round?\nTell me your wild gamer reaction stories down below 👇\n\n#gamingcommunity #streamer #gamerreaction #setup #viral",
            "CAPTION B (SHOCK / HIGH-SAVEABILITY):\nWhen the stress finally leaves your body after a clutch 🏆\n\nSave this for motivation before your next ranked match!\nShare this with your duo who needs a win today 👇\n\n#gamemoments #gaminghighlights #esports #shorts #reels"
        ]
    },
    {
        headline: "WE BOTH ALMOST THREW THIS MATCH 😭",
        hooks: [
            "HOOK AGGRESSIVE A: WE BOTH ALMOST THREW THIS MATCH 😭",
            "HOOK AGGRESSIVE B: TOURNAMENT MATCH THAT ALMOST BROKE US 💥",
            "HOOK ELEGANT A: The nerves after a high-stakes tournament round... 💔",
            "HOOK ELEGANT B: Submitting the win after an intense match 📝"
        ],
        captions: [
            "CAPTION A (DRAMA / ENGAGEMENT BAIT):\nBoth of us were shaking during this tournament match 😭\n\nWho do you think made the bigger mistake in this round?\nComment your match breakdown below 👇\n\n#esports #tournament #gaminglife #pcgamer #clutch",
            "CAPTION B (SHOCK / HIGH-SAVEABILITY):\nSubmitting the 1-0 tournament win after nearly throwing 💥\n\nBookmark this clip for tournament mindset tips!\nTag your tournament partner who gets nervous 👇\n\n#competitivegaming #gamer #gamingcontent #streamer #foryou"
        ]
    }
];

// Fungsi Memecah Video Menjadi 3 Klip Secara Otomatis
function generateLocalContentStrategy(totalDuration) {
    statusText.innerText = "⚡ Analyzing Video Duration & Generating Content Strategy...";

    const clipLen = Math.min(25, Math.floor(totalDuration / 3));
    detectedClips = [];

    for (let i = 0; i < 3; i++) {
        const start = i * clipLen;
        const end = (i === 2) ? Math.min(start + clipLen, totalDuration) : start + clipLen;
        const strategy = STRATEGY_BANK[i % STRATEGY_BANK.length];

        detectedClips.push({
            clipNumber: i + 1,
            startTime: start,
            endTime: end,
            headline: strategy.headline,
            hooks: strategy.hooks,
            captions: strategy.captions
        });
    }

    // Tampilkan Klip 1 secara otomatis
    applyClipData(detectedClips[0]);
    statusText.innerText = "✅ Strategy Generated! Clean 9:16 Video Ready to Export.";
}

function applyClipData(clip) {
    startTime = clip.startTime;
    clipDuration = clip.endTime - clip.startTime;

    const randomHook = clip.hooks[Math.floor(Math.random() * clip.hooks.length)];
    const randomCaption = clip.captions[Math.floor(Math.random() * clip.captions.length)];

    timestampEl.innerText = `${formatTime(startTime)} - ${formatTime(clip.endTime)} (Clip ${clip.clipNumber} Length: ${Math.round(clipDuration)}s)`;
    headlineEl.innerText = clip.headline;
    hookEl.innerText = randomHook;
    captionEl.innerText = `${randomCaption}\n\nTime Stamp: ${formatTime(startTime)} - ${formatTime(clip.endTime)}`;

    exportBtn.disabled = false;
    copyCaptionBtn.disabled = false;
}

videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    video.src = url;
    statusText.innerText = "⏳ Loading Video...";

    video.onloadedmetadata = () => {
        generateLocalContentStrategy(video.duration);
    };
});

copyCaptionBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(captionEl.innerText);
    alert("Caption copied to clipboard!");
});

// Setup Web Audio API
let audioCtx = null;
let source = null;
let dest = null;

exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    statusText.innerText = "🎥 Processing 9:16 Clean Video + Audio... Please wait.";

    video.muted = false;

    // Render Canvas 9:16 Vertikal (720x1280)
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 1280;

    const videoAspect = (video.videoWidth || 1280) / (video.videoHeight || 720);
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;

    if (videoAspect > canvasAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / videoAspect;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
    } else {
        drawWidth = canvas.height * videoAspect;
        drawHeight = canvas.height;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
    }

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
        downloadBtn.innerText = `⬇️ DOWNLOAD CLEAN CLIP (${fileExt.toUpperCase()})`;

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

        // Render video murni tanpa overlay teks di canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

        requestAnimationFrame(drawFrame);
    }

    drawFrame();
});
