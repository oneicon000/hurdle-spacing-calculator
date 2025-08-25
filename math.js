// ---------------------------
// GLOBAL: table gender setting
// ---------------------------
let tableGender = "men"; // default

// ---------------------------
// MAIN CALCULATOR
// ---------------------------
function runCalculator() {
  const gender = document.getElementById("gender").value;
  const steps = parseInt(document.getElementById("steps").value);
  const speed = parseFloat(document.getElementById("speed").value);

  const spacing = calculateSpacing(gender, steps, speed);

  document.getElementById("result").textContent =
    `Recommended spacing: ${spacing.toFixed(1)} ft`;
}

// ---------------------------
// CORE MATH FUNCTION
// ---------------------------
function calculateSpacing(gender, steps, speed) {
  let baseSpacing, hurdleStep;
  if (gender === "men") {
    baseSpacing = 30;   // base 3-step spacing at 100%
    hurdleStep = 8;     // hurdle clearance distance
  } else {
    baseSpacing = 28;
    hurdleStep = 7;
  }

  // Stride length at 100% (for 3-step pattern)
  let strideLength = (baseSpacing - hurdleStep) / 3;

  // Scale stride with speed
  let scaledStride = strideLength * speed;

  // (currently not scaling hurdle step – but could adjust here later)
  let scaledHurdleStep = hurdleStep;

  // Final spacing formula
  return scaledHurdleStep + (scaledStride * steps);
}

// ---------------------------
// TABLE FUNCTIONS
// ---------------------------
function setTableGender(gender) {
  tableGender = gender;

  // Update button styles
  document.getElementById("men-btn").classList.remove("active");
  document.getElementById("women-btn").classList.remove("active");
  document.getElementById(gender + "-btn").classList.add("active");

  generateTable();
}

function generateTable() {
  const gender = tableGender;
  const tablesContainer = document.getElementById("tables-container");
  tablesContainer.innerHTML = ""; // clear old tables

  const speedLevels = [0.6, 0.7, 0.8, 0.9, 1.0];

  // Build table
  let table = document.createElement("table");

  // Header row
  let headerRow = "<tr><th>Steps</th>";
  speedLevels.forEach(s => {
    headerRow += `<th>${Math.round(s * 100)}%</th>`;
  });
  headerRow += "</tr>";
  table.innerHTML = headerRow;

  // Rows for steps 2–9
  for (let steps = 2; steps <= 9; steps++) {
    let row = `<tr><td>${steps}</td>`;
    speedLevels.forEach(s => {
      const spacing = calculateSpacing(gender, steps, s);
      row += `<td>${spacing.toFixed(1)}</td>`;
    });
    row += "</tr>";
    table.innerHTML += row;
  }

  tablesContainer.appendChild(table);
}
