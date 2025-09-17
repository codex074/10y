// --- Fireworks Effect ---
const fireworksContainer = document.getElementById('fireworks-canvas');
if (fireworksContainer) {
  const fireworks = new Fireworks.default(fireworksContainer, {
    opacity: 0.5,
    acceleration: 1.05,
    friction: 0.97,
    gravity: 1.5,
    particles: 75,
    explosion: 8,
    mouse: { click: false, move: false, max: 1 }
  });
  fireworks.start();
}


// --- Music Player ---
const player = document.getElementById('custom-player');
const audio = document.getElementById('music-track');
const playBtn = document.getElementById('play-pause-btn');

if(player) {
    function togglePlay() {
      if (audio.paused) {
        audio.play();
        playBtn.className = 'play-btn pause';
      } else {
        audio.pause();
        playBtn.className = 'play-btn play';
      }
    }
    player.addEventListener('click', togglePlay);
}


// --- Gallery, Text, and Display Logic ---
const container = document.getElementById('gallery-container');
const imageSpans = document.querySelectorAll('#gallery-container span');
const textArea = document.getElementById('text-display-area');
const textTitle = document.getElementById('text-title');
const textDesc = document.getElementById('text-description');
const displayImageBox = document.getElementById('display-image-box');
const mainDisplayImage = document.getElementById('main-display-image');
const closeDisplayBtn = document.getElementById('close-display-btn');
const anniversaryContainer = document.getElementById('anniversary-container');

let currentActiveId = null;

function resumeGallery() {
  container.classList.remove('paused');
  // Explicitly resume the CSS animation
  container.style.animationPlayState = 'running';
  textArea.classList.remove('visible');
  displayImageBox.classList.remove('visible');
  anniversaryContainer.classList.remove('zoomed-in');
  if (currentActiveId) {
    document.getElementById(currentActiveId).classList.remove('active');
  }
  currentActiveId = null;
}

function showDetails(span) {
    if (!container.classList.contains('paused')) {
        // Pause the CSS animation to show details
        container.classList.add('paused');
        container.style.animationPlayState = 'paused';

        imageSpans.forEach(s => s.classList.remove('active'));
        span.classList.add('active');
        currentActiveId = span.id;

        const title = span.dataset.title;
        const description = span.dataset.description;
        textTitle.textContent = title;
        textDesc.textContent = description;
        textArea.classList.add('visible');
        
        mainDisplayImage.src = span.querySelector('img').src;
        displayImageBox.classList.add('visible');
        anniversaryContainer.classList.add('zoomed-in');
    }
}

if(closeDisplayBtn) {
    closeDisplayBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        resumeGallery();
    });
}

document.body.addEventListener('click', (event) => {
    if (container.classList.contains('paused') && 
        !isDragging && // Make sure user is not dragging
        !event.target.closest('#gallery-container span') && 
        !event.target.closest('#text-display-area') &&
        !event.target.closest('#display-image-box') &&
        !event.target.closest('#custom-player')
    ) {
        resumeGallery();
    }
});


// --- Drag-to-Rotate Logic ---
let isDragging = false;
let hasDragged = false;
let startX;
let currentRotation = 0;
let rotationOnDragStart = 0;

const onPointerDown = (event) => {
  if (container.classList.contains('paused')) return;

  isDragging = true;
  hasDragged = false;
  startX = event.pageX || event.touches[0].pageX;

  const style = window.getComputedStyle(container);
  const matrix = new DOMMatrix(style.transform);
  rotationOnDragStart = Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI);
  if(isNaN(rotationOnDragStart)) rotationOnDragStart = 0;

  container.style.animationPlayState = 'paused';
};

const onPointerMove = (event) => {
  if (!isDragging) return;

  hasDragged = true;
  event.preventDefault();

  const currentX = event.pageX || event.touches[0].pageX;
  const deltaX = currentX - startX;
  const rotationAngle = deltaX * 0.5;
  
  currentRotation = rotationOnDragStart + rotationAngle;
  container.style.transform = `perspective(1000px) rotateY(${currentRotation}deg)`;
};

const onPointerUp = (event) => {
  if (!isDragging) return;
  
  if (!hasDragged) {
    const clickedSpan = event.target.closest('#gallery-container span');
    if (clickedSpan) {
      showDetails(clickedSpan);
    }
  } else {
    // If a drag occurred, explicitly resume the animation
    if (!container.classList.contains('paused')) {
      container.style.animationPlayState = 'running';
    }
  }
  isDragging = false;
};

// Mouse Events
container.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);

// Touch Events
container.addEventListener('touchstart', onPointerDown, { passive: true });
window.addEventListener('touchmove', onPointerMove);
window.addEventListener('touchend', onPointerUp);