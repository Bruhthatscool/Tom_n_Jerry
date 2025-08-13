// Store total distance in kilometers
let totalDistance = 0;
let lastX, lastY;
let isFirstMove = true;

// Color palette variables
let currentPalette = "fire";
const palettes = {
  fire: () => `hsl(${Math.random() * 20 + 10}, 100%, 50%)`,
  ocean: () => `hsl(${Math.random() * 30 + 190}, 80%, 60%)`,
  forest: () => `hsl(${Math.random() * 60 + 100}, 80%, 40%)`,
  rainbow: () => `hsl(${Math.random() * 360}, 100%, 50%)`,
};
let particles = [];

// Time-based estimation
let lastActiveTime = Date.now();
let estimatedDistance = 0;
const KM_PER_HOUR_ESTIMATE = 3;

// DOM elements
const distanceDisplay = document.getElementById("distance");
const percentageDisplay = document.getElementById("percentage");
const comparisonNameDisplay = document.getElementById("comparison-name");

// Particle System
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 3;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = palettes[currentPalette]();
    this.life = 100;
    this.decay = Math.random() * 3 + 1;
    this.shape = this.getRandomShape(); // New: Random shape type
    this.rotation = 0;
    this.rotationSpeed = Math.random() * 0.2 - 0.1;
  }

  getRandomShape() {
    const shapes = ["circle", "square", "triangle", "star"];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    this.size *= 0.98;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    ctx.globalAlpha = this.life / 100;
    ctx.fillStyle = this.color;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    switch (this.shape) {
      case "square":
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
      case "triangle":
        this.drawTriangle();
        break;
      case "star":
        this.drawStar();
        break;
      default: // circle
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }
  drawTriangle() {
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.lineTo(-this.size / 2, this.size / 2);
    ctx.lineTo(this.size / 2, this.size / 2);
    ctx.closePath();
    ctx.fill();
  }

  drawStar() {
    const spikes = 5;
    const outerRadius = this.size / 2;
    const innerRadius = outerRadius * 0.4;
    let rot = (Math.PI / 2) * 3;
    let x, y;

    ctx.beginPath();
    ctx.moveTo(0, -outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerRadius;
      y = Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += Math.PI / spikes;

      x = Math.cos(rot) * innerRadius;
      y = Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += Math.PI / spikes;
    }

    ctx.lineTo(0, -outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].life <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

// Comparisons
const comparisons = [
  { name: "a penguin's migration", distance: 4000 },
  { name: "an arctic tern's yearly migration", distance: 70000 },
  { name: "a monarch butterfly's migration", distance: 4800 },
  { name: "a marathon", distance: 0.042 },
  { name: "Mount Everest", distance: 8.849 },
  { name: "the English Channel swim", distance: 33.8 },
  { name: "a 5K running race", distance: 5 },
  { name: "Earth's diameter", distance: 12742 },
  { name: "the NYC subway A train", distance: 31 },
  { name: "Usain Bolt's 100m sprint", distance: 0.1 },
];

let currentComparison = comparisons[0];
let aiComparisonActive = false;
const PIXELS_TO_KM = 0.000025;

async function getAIComparison(distance) {
  percentage = Number(percentage);
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDumTs0VFqXgRIDGyU0lNbjFZqElI3Po_o",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Given a distance of ${distance.toFixed(
                    2
                  )} km and a percentage of ${percentage.toFixed(
                    3
                  )}%, write only the object of the sentence "That's ${percentage.toFixed(
                    3
                  )}% of ____". Return just the short, funny comparison for the blank, under 8 words, no punctuation at the start or end. 
                  The comparison must be randomly picked from a very broad range of categories such as: 
- animals (rare or unusual, avoid cat, snail, sloth, turtle)
- outer space objects and events
- foods and drinks
- famous landmarks
- fictional characters or pop culture items
- historical events
- unusual natural phenomena
- sports (avoid marathons unless relevant)
- gadgets or technology

Do NOT reuse the same category in consecutive calls.
Do NOT repeat comparisons from earlier requests.
Treat each request as totally new and unrelated to past ones.`,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function init() {
  // Get references to existing buttons
  const nextComparisonBtn = document.getElementById("next-comparison");
  const colorToggleBtn = document.getElementById("color-toggle");
  const colorPalette = document.getElementById("color-palette");
  const shapeToggle = document.getElementById("shape-toggle");
  const shapePalette = document.getElementById("shape-palette");
  // Set up event listeners
  nextComparisonBtn.addEventListener("click", async () => {
    const aiMessage = await getAIComparison(totalDistance);
    if (aiMessage) {
      aiComparisonActive = true;
      comparisonNameDisplay.textContent = aiMessage;
    } else {
      aiComparisonActive = false;
      pickRandomComparison();
      updateDisplay();
    }
  });

  colorToggleBtn.addEventListener("click", () => {
    colorPalette.classList.toggle("hidden");
  });

  // Color palette options
  document.querySelectorAll(".color-option").forEach((option) => {
    option.addEventListener("click", () => {
      currentPalette = option.dataset.palette;
      colorPalette.classList.add("hidden");
      particles = [];
    });
  });

  // shape options
  shapeToggle.addEventListener("click", () => {
    shapePalette.classList.toggle("hidden");
  });

  document.querySelectorAll(".shape-option").forEach((option) => {
    option.addEventListener("click", () => {
      // Update all future particles
      Particle.prototype.getRandomShape = () => option.dataset.shape;
      shapePalette.classList.add("hidden");
      particles = []; // Clear existing particles
    });
  });

  // Other initialization
  document.addEventListener("mousemove", handleMouseMove);

  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
        isFirstMove = false;
      }
    },
    { passive: false }
  );

  document.addEventListener("visibilitychange", handleVisibilityChange);
  handleVisibilityChange();
  setInterval(updateEstimatedDistance, 1000);
  updateDisplay();
}

function pickRandomComparison() {
  // Get current index
  const currentIndex = comparisons.findIndex(
    (comp) => comp.name === currentComparison.name
  );

  // Calculate next index (with wrap-around)
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * comparisons.length);
  } while (nextIndex === currentIndex && comparisons.length > 1);

  currentComparison = comparisons[nextIndex];
}

function handleVisibilityChange() {
  if (document.hidden) {
    lastActiveTime = Date.now();
  } else {
    const timeInactiveMs = Date.now() - lastActiveTime;
    const hoursInactive = timeInactiveMs / (1000 * 60 * 60);
    estimatedDistance += hoursInactive * KM_PER_HOUR_ESTIMATE;
    lastActiveTime = Date.now();
  }
}

function updateEstimatedDistance() {
  if (!document.hidden && estimatedDistance > 0) {
    totalDistance += estimatedDistance;
    estimatedDistance = 0;
    updateDisplay();
  }
}

function handleMouseMove(e) {
  const { clientX: currentX, clientY: currentY } = e;

  if (isFirstMove) {
    lastX = currentX;
    lastY = currentY;
    isFirstMove = false;
    return;
  }

  const distancePixels = Math.sqrt(
    Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2)
  );

  totalDistance += distancePixels * PIXELS_TO_KM;
  lastX = currentX;
  lastY = currentY;

  // Add just 1 particle per frame
  if (particles.length < 50) {
    particles.push(new Particle(currentX, currentY));
  }

  updateDisplay();
}

function updateDisplay() {
  distanceDisplay.textContent = totalDistance.toFixed(2);
  percentageDisplay.textContent = (
    (totalDistance / currentComparison.distance) *
    100
  ).toFixed(3);

  // Only change the name if AI comparison is not active
  if (!aiComparisonActive) {
    comparisonNameDisplay.textContent = currentComparison.name;
  }
}

init();

