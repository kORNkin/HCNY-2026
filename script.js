const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const jackpot = document.getElementById('jackpot');

const img = new Image();
img.src = 'img/01.jpg'; // Update to your gambling image

const rows = 4; 
const cols = 5;
let pieces = [];
let selectedPiece = null;
let isSolved = false;

img.onload = () => {
    handleResize();
    window.addEventListener('resize', handleResize);
    render();
};

const _part1 = "SENOWW5hYS10";
const _part2 = "b29ra29ubg==";

function petchFrame() {
    const target = document.getElementById('secret-target');
    const decoded = atob(_part1 + _part2);
    target.innerText = decoded;
}

function handleResize() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.6;
    let displayWidth = img.width;
    let displayHeight = img.height;

    if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight *= ratio;
    }
    if (displayHeight > maxHeight) {
        const ratio = maxHeight / displayHeight;
        displayHeight = maxHeight;
        displayWidth *= ratio;
    }

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    init();
}

function init() {
    const w = canvas.width / cols;
    const h = canvas.height / rows;
    pieces = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            pieces.push({
                sx: (c * img.width) / cols,
                sy: (r * img.height) / rows,
                sw: img.width / cols,
                sh: img.height / rows,
                x: Math.random() * (canvas.width - w),
                y: Math.random() * (canvas.height - h),
                tx: c * w, ty: r * h,
                w: w, h: h, locked: false
            });
        }
    }
}

function render() {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw "Poker Table" felt background (No ghost image)
    ctx.fillStyle = "#0a5c2e"; // Deep Casino Green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Add a subtle felt texture pattern (Optional, adds a premium feel)
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=20) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    pieces.forEach(p => {
        ctx.save();
        if(p.locked) {
            // Pieces that are "Home" still get the Neon Glow
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#00ffcc";
        }
        
        // Draw the actual piece
        ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, p.x, p.y, p.w, p.h);
        
        // Draw piece border
        ctx.strokeStyle = "rgba(255, 204, 0, 0.2)"; // Gold border
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.restore();
    });

    if (!isSolved) requestAnimationFrame(render);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

const start = (e) => {
    if(isSolved) return;
    const pos = getPos(e);
    for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (!p.locked && pos.x > p.x && pos.x < p.x + p.w && pos.y > p.y && pos.y < p.y + p.h) {
            selectedPiece = p;
            pieces.splice(i, 1);
            pieces.push(selectedPiece);
            break;
        }
    }
};

const move = (e) => {
    if (selectedPiece) {
        if (e.cancelable) e.preventDefault();
        const pos = getPos(e);
        selectedPiece.x = pos.x - selectedPiece.w / 2;
        selectedPiece.y = pos.y - selectedPiece.h / 2;
    }
};

const end = () => {
    if (selectedPiece) {
        const dist = Math.hypot(selectedPiece.x - selectedPiece.tx, selectedPiece.y - selectedPiece.ty);
        if (dist < 45) {
            selectedPiece.x = selectedPiece.tx;
            selectedPiece.y = selectedPiece.ty;
            selectedPiece.locked = true;
            if (navigator.vibrate) navigator.vibrate([30, 10, 30]); // Double vibration
        }
        selectedPiece = null;
        if (pieces.every(p => p.locked)) {
            isSolved = true;
            setTimeout(() => jackpot.classList.add('show'), 500);
        }
    }
    if (pieces.every(p => p.locked)) {
        isSolved = true;
        petchFrame();
        setTimeout(() => jackpot.classList.add('show'), 500);
    }
};

canvas.addEventListener('mousedown', start);
window.addEventListener('mousemove', move);
window.addEventListener('mouseup', end);
canvas.addEventListener('touchstart', start, {passive: false});
window.addEventListener('touchmove', move, {passive: false});
window.addEventListener('touchend', end);