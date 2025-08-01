// Store total distance in kilometers
let totalDistance = 0;
let lastX, lastY;
let isFirstMove = true;

// DOM elements
const distanceDisplay = document.getElementById("distance");
const percentageDisplay = document.getElementById("percentage");
const comparisonNameDisplay = document.getElementById("comparison-name");

// Distance comparisons (in km)
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

// Conversion factor
const PIXELS_TO_KM = 0.000025;

// Initialize
function init() {
  // Create and add the button
  const nextBtn = document.createElement("button");
  nextBtn.id = "next-comparison";
  nextBtn.textContent = "Next Comparison";
  document.querySelector(".tracker-container").appendChild(nextBtn);

  // Set up event listeners
  nextBtn.addEventListener("click", pickRandomComparisonAndUpdate);
  document.addEventListener("mousemove", handleMouseMove);

  updateDisplay();
}

function pickRandomComparison() {
  const randomIndex = Math.floor(Math.random() * comparisons.length);
  currentComparison = comparisons[randomIndex];
}

function pickRandomComparisonAndUpdate() {
  pickRandomComparison();
  updateDisplay();
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

  const distanceKm = distancePixels * PIXELS_TO_KM;
  totalDistance += distanceKm;

  lastX = currentX;
  lastY = currentY;

  updateDisplay();
}

function updateDisplay() {
  const roundedDistance = totalDistance.toFixed(2);
  distanceDisplay.textContent = `${roundedDistance} km`;

  const percentage = (
    (totalDistance / currentComparison.distance) *
    100
  ).toFixed(4);

  percentageDisplay.textContent = `${percentage}% of`;
  comparisonNameDisplay.textContent = currentComparison.name;
}

init();
