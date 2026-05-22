/* ==========================================================================
   Ruby & Kkeutsuni's Cozy Web App - JavaScript Interactions
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initCursorTrail();
  initRubyChaseGame();
  initPetSimulator();
  initGallery();
  initRetroTV();
  loadGuestbook();
});

/* ==========================================================================
   1. Interactive Cursor Paw Trail (Canvas Effect)
   ========================================================================== */
function initCursorTrail() {
  const canvas = document.getElementById("trailCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });

  const particles = [];
  const pawColors = ["#FF7A5A", "#FFC83B", "#4ECCA3", "#FFECE6"];
  let lastX = 0;
  let lastY = 0;
  let distThreshold = 40; // Generate paw print every 40px moved

  window.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > distThreshold) {
      createPawPrint(x, y);
      lastX = x;
      lastY = y;
    }
  });

  function createPawPrint(x, y) {
    const color = pawColors[Math.floor(Math.random() * pawColors.length)];
    const size = Math.random() * 12 + 12; // 12px to 24px
    const rotation = Math.random() * Math.PI * 2;
    particles.push({
      x,
      y,
      size,
      color,
      rotation,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01,
      floatY: Math.random() * -0.5 - 0.2
    });
  }

  // Render Loop
  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.alpha -= p.decay;
      p.y += p.floatY;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      // Draw cute cat paw print
      const r = p.size / 2.5;
      // Main pad (bean shape)
      ctx.beginPath();
      ctx.ellipse(0, r/4, r * 1.2, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4 Toe beans
      const toeOffset = r * 1.1;
      const toeSize = r * 0.45;
      
      // Toe 1 (Leftmost)
      ctx.beginPath();
      ctx.arc(-toeOffset * 0.9, -toeOffset * 0.2, toeSize, 0, Math.PI * 2);
      ctx.fill();

      // Toe 2 (Middle Left)
      ctx.beginPath();
      ctx.arc(-toeOffset * 0.35, -toeOffset * 0.8, toeSize, 0, Math.PI * 2);
      ctx.fill();

      // Toe 3 (Middle Right)
      ctx.beginPath();
      ctx.arc(toeOffset * 0.35, -toeOffset * 0.8, toeSize, 0, Math.PI * 2);
      ctx.fill();

      // Toe 4 (Rightmost)
      ctx.beginPath();
      ctx.arc(toeOffset * 0.9, -toeOffset * 0.2, toeSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    requestAnimationFrame(drawParticles);
  }

  drawParticles();
}

/* ==========================================================================
   2. Profile Card Heart Splash (Click Effect)
   ========================================================================== */
function triggerHeartSplash(event, catType) {
  event.stopPropagation();
  const rect = event.currentTarget.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const emojis = catType === "ruby" ? ["🐾", "💪", "💚", "✨", "🏋️‍♂️"] : ["💅", "💖", "💅", "🔥", "✨", "😒"];

  for (let i = 0; i < 8; i++) {
    const emoji = document.createElement("div");
    emoji.className = "flying-emoji";
    emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Position at absolute viewport for click overlay
    emoji.style.position = "fixed";
    emoji.style.left = `${centerX}px`;
    emoji.style.top = `${centerY}px`;
    
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    emoji.animate([
      { transform: "translate(-50%, -50%) scale(0.5) translate(0, 0)", opacity: 1 },
      { transform: `translate(-50%, -50%) scale(1.3) translate(${destX}px, ${destY}px)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 400,
      easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
      fill: "forwards"
    });

    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1500);
  }
}

/* ==========================================================================
   3. Ruby's Toy Chase Game
   ========================================================================== */
let toyType = "⚾";

function initRubyChaseGame() {
  const arena = document.getElementById("chaseArena");
  const toy = document.getElementById("chaseToy");
  const paw = document.getElementById("chasePaw");
  const speedVal = document.getElementById("speedVal");

  if (!arena || !toy || !paw) return;

  // Set initial toy icon
  toy.innerHTML = `<span style="font-size: 1.5rem">${toyType}</span>`;

  let arenaRect = arena.getBoundingClientRect();
  window.addEventListener("resize", () => {
    arenaRect = arena.getBoundingClientRect();
  });

  // Track positions
  let toyX = 150;
  let toyY = 150;
  let pawX = 50;
  let pawY = 50;
  let velocity = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastTime = Date.now();

  // Mouse moves inside the arena
  arena.addEventListener("mousemove", (e) => {
    // Relative coordinates
    toyX = e.clientX - arenaRect.left;
    toyY = e.clientY - arenaRect.top;

    // Update toy position instantly
    toy.style.left = `${toyX}px`;
    toy.style.top = `${toyY}px`;

    // Calculate velocity
    const now = Date.now();
    const dt = (now - timeSinceLastMove(now)) / 1000;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    if (dt > 0) {
      velocity = Math.min(Math.round(speed * 0.15), 180); // cap at 180 km/h
      speedVal.innerText = velocity;
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  let lastTimeValue = Date.now();
  function timeSinceLastMove(now) {
    const t = lastTimeValue;
    lastTimeValue = now;
    return t;
  }

  // Arena Physics Loop (paw chases toy with spring damping)
  function updateChasePhysics() {
    // Distance vectors
    const dx = toyX - pawX;
    const dy = toyY - pawY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Easing factor - Ruby is muscular and fast!
    const ease = 0.08;

    if (distance > 5) {
      pawX += dx * ease;
      pawY += dy * ease;
    }

    paw.style.left = `${pawX}px`;
    paw.style.top = `${pawY}px`;

    // Visual feedback on caught
    if (distance < 20) {
      paw.style.transform = "translate(-50%, -50%) scale(1.15)";
      paw.style.backgroundColor = "#FF7A5A"; // Glow pink
      if (Math.random() < 0.05) {
        spawnGameEmoji(pawX, pawY, "⭐");
      }
    } else {
      paw.style.transform = "translate(-50%, -50%) scale(1)";
      paw.style.backgroundColor = "var(--color-mint)"; // Standard blue-mint
    }

    requestAnimationFrame(updateChasePhysics);
  }

  updateChasePhysics();

  // Spawns stars inside the arena
  function spawnGameEmoji(x, y, emojiStr) {
    const emoji = document.createElement("div");
    emoji.className = "flying-emoji";
    emoji.innerText = emojiStr;
    emoji.style.left = `${x}px`;
    emoji.style.top = `${y}px`;
    
    arena.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1200);
  }
}

// Allows switching toy emoji
function resetChaseGame() {
  const toyList = ["🥎", "🐟", "🧶", "🐁", "🐔"];
  toyType = toyList[Math.floor(Math.random() * toyList.length)];
  const toy = document.getElementById("chaseToy");
  if (toy) {
    toy.innerHTML = `<span style="font-size: 1.5rem">${toyType}</span>`;
    
    // Cute bounce animation on toy change
    toy.animate([
      { transform: "translate(-50%, -50%) scale(0.3)" },
      { transform: "translate(-50%, -50%) scale(1.2)" },
      { transform: "translate(-50%, -50%) scale(1)" }
    ], { duration: 400 });
  }
}

/* ==========================================================================
   4. Kkeutsuni's Petting Simulator
   ========================================================================== */
const kkeutsuniQuotes = {
  forehead: [
    "이마를 만져주다니, 집사치고 제법 성의가 느껴지는구나. 😒",
    "골골... 앗! 방금 나는 골골송을 부르지 않았다냥! (자존심)",
    "기분 좋군... 하지만 티 내지 않겠어. 뚱... 🐾",
    "더 쓰다듬어라 집사. 멈추면 할퀴어버릴지도 모른다냥. 💅"
  ],
  cheek: [
    "볼살을 꼬집지 마라냥! 이것은 렉돌/샴 믹스의 솜사탕 볼이다! 솜뭉치라냥! 🐈",
    "볼 만지기 1회당 츄르 2개다냥. 장부 적어놨다냥. 💸",
    "뚱한 표정이 귀엽다고? 집사 눈이 삐었구냥... (사실은 좋음) 💕",
    "시크한 고양이의 볼을 만지는 호사를 누리게 해주겠다냥."
  ],
  chin: [
    "어어... 거기다냥! 골골골골골... 턱 밑은 사기 구역이다냥... 💤",
    "골골골... 나른해진다냥... 사파이어 눈이 감긴다냥... Zzz... 💤",
    "흥, 역시 집사는 턱밑 긁기가 전공이구냥. 100점 주겠다냥! ✨",
    "고롱고롱... 기분 좋아졌다냥... 조금 더 서비스해봐라!"
  ]
};

let kkeutsuniSatisfaction = 0;

function initPetSimulator() {
  const arena = document.getElementById("petArena");
  const bubble = document.getElementById("petBubble");
  const satisfactionVal = document.getElementById("heartCount");

  if (!arena || !bubble || !satisfactionVal) return;

  const hotspots = arena.querySelectorAll(".hotspot");

  hotspots.forEach(spot => {
    spot.addEventListener("click", (e) => {
      const zone = spot.getAttribute("data-zone");
      const quotes = kkeutsuniQuotes[zone];
      const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

      // Update Speech Bubble
      bubble.style.opacity = 0;
      setTimeout(() => {
        bubble.innerText = selectedQuote;
        bubble.style.opacity = 1;
      }, 150);

      // Increase satisfaction score
      let satisfactionGain = zone === "chin" ? 15 : 10;
      kkeutsuniSatisfaction = Math.min(kkeutsuniSatisfaction + satisfactionGain, 120);
      satisfactionVal.innerText = kkeutsuniSatisfaction;

      // Click heart/paw animation
      const rect = arena.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const emojis = ["💖", "🐾", "✨", "🎵", "🥰"];
      for (let i = 0; i < 4; i++) {
        const emoji = document.createElement("div");
        emoji.className = "flying-emoji";
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = `${clickX}px`;
        emoji.style.top = `${clickY}px`;
        
        arena.appendChild(emoji);
        setTimeout(() => emoji.remove(), 1200);
      }

      // If maximum satisfaction reached
      if (kkeutsuniSatisfaction >= 120) {
        satisfactionVal.innerText = "120 (대만족 요정!)";
        bubble.innerText = "흥! 대만족이다 집사! 내 너에게 특별 무릎잠 서비스를 베풀어주마! 👑💖";
      }
    });
  });
}

/* ==========================================================================
   5. Interactive Local Storage Sticker Guestbook
   ========================================================================== */
function addMessage(event) {
  event.preventDefault();

  const nameInput = document.getElementById("visitorName");
  const textInput = document.getElementById("visitorText");
  const selectedSticker = document.querySelector('input[name="sticker"]:checked');

  if (!nameInput || !textInput || !selectedSticker) return;

  const newMsg = {
    id: Date.now(),
    name: nameInput.value.trim(),
    text: textInput.value.trim(),
    sticker: selectedSticker.value,
    date: new Date().toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    colorIndex: Math.floor(Math.random() * 4) // random 4 pastel styles
  };

  // Get current messages
  const currentMessages = JSON.parse(localStorage.getItem("cats_guestbook") || "[]");
  currentMessages.unshift(newMsg); // add to top
  localStorage.setItem("cats_guestbook", JSON.stringify(currentMessages));

  // Render
  renderMessages(currentMessages);

  // Clear inputs
  nameInput.value = "";
  textInput.value = "";
}

function loadGuestbook() {
  const currentMessages = JSON.parse(localStorage.getItem("cats_guestbook") || "[]");
  renderMessages(currentMessages);
}

function renderMessages(messages) {
  const boardGrid = document.getElementById("boardGrid");
  const boardEmpty = document.getElementById("boardEmpty");

  if (!boardGrid || !boardEmpty) return;

  if (messages.length === 0) {
    boardGrid.style.display = "none";
    boardEmpty.style.display = "block";
    return;
  }

  boardGrid.style.display = "grid";
  boardEmpty.style.display = "none";
  boardGrid.innerHTML = "";

  messages.forEach(msg => {
    const note = document.createElement("div");
    // Class style with random pastel index
    note.className = `sticky-note sticky-note-${msg.colorIndex}`;
    
    // Add slightly random rotation for collage vibe
    const randomRotate = (Math.random() * 8 - 4).toFixed(1); // -4deg to +4deg
    note.style.transform = `rotate(${randomRotate}deg)`;

    note.innerHTML = `
      <span class="note-sticker">${msg.sticker}</span>
      <div class="note-header">📌 ${escapeHTML(msg.name)}</div>
      <div class="note-content">${escapeHTML(msg.text)}</div>
      <div class="note-date">${msg.date}</div>
    `;

    boardGrid.appendChild(note);
  });
}

// Utility: escape HTML helper
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   6. Dynamic Premium Gallery & Lightbox
   ========================================================================== */
const catPhotos = [
  { src: "pic/20170730_011522.jpg", category: "ruby", title: "호기심 대장 아기 루비 🐾", desc: "집사 주변을 요리조리 탐색하는 어릴 적 귀여운 루비" },
  { src: "pic/20170730_022918.jpg", category: "ruby", title: "어둠 속의 보석 눈빛 💎", desc: "캣타워 어스름 속에서 영롱하게 빛나는 에메랄드 눈동자" },
  { src: "pic/20170730_093947.jpg", category: "ruby", title: "햇살 아래 실버 코트 ☀️", desc: "눈부신 아침 햇살을 받으며 단잠에 빠진 슬림 루비" },
  { src: "pic/20170807_234406.jpg", category: "ruby", title: "상자 격파단 에이스 📦", desc: "제 몸보다 턱없이 작은 종이상자도 우겨 들어가는 집념" },
  { src: "pic/20170818_002122.jpg", category: "ruby", title: "접은 청바지 전용 방석 👖", desc: "새 청바지가 오자마자 자기 침대로 선점한 늠름한 루비" },
  { src: "pic/20170819_200822.jpg", category: "ruby", title: "그윽한 상남자 눈빛 🔥", desc: "은빛 털과 우람한 턱선으로 카리스마 발산하기" },
  { src: "pic/20170821_192828.jpg", category: "duo", title: "정답게 포갠 꿀잠 💤", desc: "오빠 청바지 방석에서 서로 기대어 체온을 나누며 꿀잠" },
  { src: "pic/20170823_185931.jpg", category: "duo", title: "창밖 감시반 출동 👀", desc: "바깥 구경은 우리 단짝의 하루 중 가장 중요한 일과!" },
  { src: "pic/20170823_185945.jpg", category: "duo", title: "비둘기 발견 채터링! 🐦", desc: "창밖 새를 보고 동시에 입을 바르르 떠는 귀여운 두 녀석" },
  { src: "pic/20170828_193503.jpg", category: "duo", title: "평화로운 거실의 등대 🛋️", desc: "서로 등을 딱 맞대고 앉아 거실의 평화를 수호하는 중" },
  { src: "pic/20170830_001332.jpg", category: "kkeutsuni", title: "시크한 사파이어 요정 💎", desc: "유난히 푸르고 영롱한 끝순이의 눈부신 눈빛" },
  { src: "pic/20170830_215006.jpg", category: "kkeutsuni", title: "솜털 날리는 요정 미모 💅", desc: "귀를 쫑긋 세우고 호기심 어린 표정으로 집사 바라보기" },
  { src: "pic/20170903_230011.jpg", category: "kkeutsuni", title: "식탁 밑의 비밀 작전 🕵️‍♀️", desc: "집사가 맛있는 거 먹을 때 귀신같이 튀어나와 뚱하게 조르기" },
  { src: "pic/20170915_212326.jpg", category: "kkeutsuni", title: "새침떼기 끝순이 공주 👑", desc: "놀아주기 기다리면서 일부러 뚱하고 뾰로통하게 쳐다보기" },
  { src: "pic/20170926_221528.jpg", category: "kkeutsuni", title: "장모 발리니즈의 품격 ✨", desc: "폭신폭신하고 부드러운 화이트 샴 포인트 털결" },
  { src: "pic/20171006_230240.jpg", category: "duo", title: "싱크대 점령 작전 🍳", desc: "높은 곳은 무조건 같이 올라가야 직성이 풀리는 듀오" },
  { src: "pic/20171021_153252.jpg", category: "duo", title: "데칼코마니 하프 취침 💤", desc: "똑같이 몸을 둥글게 말고 잠자는 환상의 팀워크" },
  { src: "pic/20171021_155700.jpg", category: "duo", title: "자면서도 영혼의 동기화 🔄", desc: "머리 방향까지 정확히 맞추고 꿀잠에 빠진 행복한 순간" },
  { src: "pic/20171021_215319.jpg", category: "ruby", title: "골골송 1초 대기 모드 🎵", desc: "쓰다듬어주자 기분 좋아서 고롱고롱 눈을 감는 루비 오빠" },
  { src: "pic/20180206_084823.jpg", category: "kkeutsuni", title: "눈 위에 핀 하얀 식빵 🍞", desc: "뽀송뽀송하고 탐스러운 식빵 자세의 끝순이 미모 폭발" },
  { src: "pic/20180218_174703.jpg", category: "kkeutsuni", title: "분홍 땡땡이 상자 지킴이 📦", desc: "상자에 들어가서 시크하고 뚱하게 '츄르 가져오라냥' 💅" },
  { src: "pic/20180225_162154.jpg", category: "duo", title: "우당탕탕 휴지 파티의 범인! 💥", desc: "침대 위 휴지 분쇄 완료! '우리가 한 거 아니라냥! 바람 불었다옹!' 👻" }
];

function initGallery() {
  const grid = document.getElementById("galleryGrid");
  const filterBtns = document.querySelectorAll(".gallery-filters .btn");
  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDesc = document.getElementById("lightboxDesc");

  if (!grid || filterBtns.length === 0 || !lightbox) return;

  // 1. Render Gallery Function
  function renderGallery(filterName = "all") {
    grid.innerHTML = "";
    
    const filtered = filterName === "all" 
      ? catPhotos 
      : catPhotos.filter(p => p.category === filterName);

    filtered.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.className = "polaroid-card";
      
      // Calculate a randomized rotation angle for realistic collage style
      const angles = [-2.5, -1.2, 1.5, 2.2, -0.8, 1.8];
      const rotate = angles[idx % angles.length];
      card.style.transform = `rotate(${rotate}deg)`;
      
      // Delays the fade-in animation for stair-step effect
      card.style.animationDelay = `${idx * 0.05}s`;

      card.innerHTML = `
        <div class="polaroid-img-wrapper">
          <img src="${photo.src}" alt="${photo.title}" loading="lazy">
        </div>
        <div class="polaroid-text">
          <h5>${photo.title}</h5>
          <p>${photo.desc}</p>
        </div>
      `;

      // Open Lightbox Event
      card.addEventListener("click", () => {
        openLightbox(photo);
      });

      grid.appendChild(card);
    });
  }

  // 2. Lightbox Control Functions
  function openLightbox(photo) {
    lightboxImg.src = photo.src;
    lightboxTitle.innerText = photo.title;
    lightboxDesc.innerText = photo.desc;
    
    lightbox.style.display = "flex";
    // Trigger CSS opacity transition on next paint
    setTimeout(() => {
      lightbox.classList.add("active");
    }, 10);
    
    // Prevent body scrolling
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    // Wait for animation transition to complete before display:none
    setTimeout(() => {
      lightbox.style.display = "none";
      lightboxImg.src = "";
    }, 300);
    
    // Restore body scrolling
    document.body.style.overflow = "";
  }

  // Lightbox Close Events
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Close Lightbox on Escape Key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });

  // 3. Filter Buttons Wire-up
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove("active"));
      // Add active to current
      btn.classList.add("active");
      
      const filterValue = btn.getAttribute("data-filter");
      
      // Dynamic rendering with neat cascade delay
      renderGallery(filterValue);

      // Play cute sound tick if browser allows
      if (Math.random() < 0.3) {
        btn.animate([
          { transform: "scale(1)" },
          { transform: "scale(0.95)" },
          { transform: "scale(1.05)" },
          { transform: "scale(1)" }
        ], { duration: 300, easing: "ease-in-out" });
      }
    });
  });

  // Initial Draw
  renderGallery("all");
}

/* ==========================================================================
   7. Cat-Eared Retro TV Custom Video Controls
   ========================================================================== */
function initRetroTV() {
  const video = document.getElementById("tvVideo");
  const tvScreen = video ? video.parentElement : null;
  const playBtn = document.getElementById("remotePlayBtn");
  const muteBtn = document.getElementById("remoteMuteBtn");
  const progressBar = document.getElementById("remoteProgressBar");
  const loopBtn = document.getElementById("remoteLoopBtn");
  const expandBtn = document.getElementById("remoteExpandBtn");
  const currentTimeLabel = document.getElementById("videoCurrentTime");
  const durationLabel = document.getElementById("videoDuration");
  const playOverlay = document.getElementById("tvPlayOverlay");
  const powerLed = document.getElementById("tvLed");
  
  const channelDial = document.getElementById("dialChannel");
  const volumeDial = document.getElementById("dialVolume");

  if (!video || !playBtn || !muteBtn || !progressBar) return;

  // Track dial rotation degree values
  let chRotation = 0;
  let volRotation = 45; // starts slightly rotated

  // Toggles Video Playing
  function togglePlay() {
    if (video.paused) {
      // Turn on led & screen
      powerLed.classList.add("active");
      tvScreen.classList.add("playing");
      tvScreen.classList.remove("off");
      
      video.play().then(() => {
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        playBtn.title = "일시정지";
        playOverlay.style.opacity = 0;
      }).catch(err => {
        console.log("Auto-play blocked or failed: ", err);
      });
    } else {
      video.pause();
      playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
      playBtn.title = "재생";
      tvScreen.classList.remove("playing");
      playOverlay.style.opacity = 0.85;
    }
  }

  // Toggles Sound
  function toggleMute() {
    video.muted = !video.muted;
    if (video.muted) {
      muteBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
      muteBtn.title = "음소거 해제";
      muteBtn.classList.add("active");
    } else {
      muteBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
      muteBtn.title = "음소거";
      muteBtn.classList.remove("active");
    }
  }

  // Screen Click -> Toggle Play
  tvScreen.addEventListener("click", togglePlay);
  playBtn.addEventListener("click", togglePlay);
  muteBtn.addEventListener("click", toggleMute);

  // Time Tracker Update
  video.addEventListener("timeupdate", () => {
    // Progress bar update percentage
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    progressBar.value = pct;
    
    // Track labels
    currentTimeLabel.innerText = formatVideoTime(video.currentTime);
  });

  // When metadata loads (duration is known)
  video.addEventListener("loadedmetadata", () => {
    durationLabel.innerText = formatVideoTime(video.duration);
  });

  // If already loaded
  if (video.readyState >= 1) {
    durationLabel.innerText = formatVideoTime(video.duration);
  }

  // Drag Progress Slider -> Seek Video Parts
  progressBar.addEventListener("input", () => {
    const time = (progressBar.value / 100) * video.duration;
    video.currentTime = time;
  });

  // Loop Control
  loopBtn.addEventListener("click", () => {
    video.loop = !video.loop;
    if (video.loop) {
      loopBtn.classList.add("active");
      loopBtn.title = "반복재생 비활성화";
    } else {
      loopBtn.classList.remove("active");
      loopBtn.title = "반복재생 활성화";
    }
  });

  // Fullscreen Request
  expandBtn.addEventListener("click", () => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  });

  // Tactile Dials Click Rotate effect
  if (channelDial) {
    channelDial.addEventListener("click", () => {
      chRotation += 60;
      channelDial.style.transform = `rotate(${chRotation}deg)`;
      
      // Simulate switching television channels (brief static scan flicker effect!)
      tvScreen.classList.add("off");
      video.pause();
      
      setTimeout(() => {
        tvScreen.classList.remove("off");
        // Randomly skip to a random frame of the video
        if (video.duration) {
          video.currentTime = Math.random() * video.duration;
        }
        
        // Resume playing automatically
        powerLed.classList.add("active");
        tvScreen.classList.add("playing");
        video.play().then(() => {
          playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
          playOverlay.style.opacity = 0;
        });
      }, 350);
    });
  }

  if (volumeDial) {
    volumeDial.addEventListener("click", () => {
      volRotation += 45;
      volumeDial.style.transform = `rotate(${volRotation}deg)`;
      
      // Step toggle volume levels (1.0 -> 0.6 -> 0.3 -> 0.0)
      if (video.muted) {
        toggleMute();
      }
      
      let currentVol = video.volume;
      if (currentVol > 0.7) {
        video.volume = 0.5;
        volumeDial.title = "볼륨: 중간 🔉";
      } else if (currentVol > 0.4) {
        video.volume = 0.15;
        volumeDial.title = "볼륨: 작게 🔈";
      } else if (currentVol > 0.1) {
        video.volume = 0.0;
        video.muted = true;
        muteBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
        muteBtn.classList.add("active");
        volumeDial.title = "음소거됨 🔇";
      } else {
        video.volume = 1.0;
        video.muted = false;
        muteBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
        muteBtn.classList.remove("active");
        volumeDial.title = "볼륨: 크게 🔊";
      }
    });
  }

  // Format digital MM:SS times
  function formatVideoTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;
    return `${mm}:${ss}`;
  }
}

