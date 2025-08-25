/*
 ==========================================
 HURDLE SPACING MATH + TABLE GENERATION
 ==========================================
 This file exports functions to the global window so that:
  - index.html buttons can call runCalculator()
  - tables.html can call generateTable(), setTableGender()

 You can safely change ONLY the math inside calculateSpacing()
 without breaking UI wiring.
*/

// ---------------------------
// GLOBAL: table gender setting
// ---------------------------
let tableGender = "men"; // default for the tables page

// ---------------------------------------------
// CORE MATH: tweak this to change your model
// ---------------------------------------------
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

  // See the console (inspect) in the browser
  console.log({gender, steps, speed, hurdleStep, stride100, stride, total});
 
  // Final spacing formula
  return scaledHurdleStep + (scaledStride * steps);
}

// ----------------------------------------------------
// CALCULATOR: reads DOM, writes result (index.html)
// ----------------------------------------------------
function runCalculator() {
  const gender = document.getElementById("gender").value;
  const steps = parseInt(document.getElementById("steps").value, 10);
  const speed = parseFloat(document.getElementById("speed").value);

  const spacing = calculateSpacing(gender, steps, speed);

  const resultEl = document.getElementById("result");
  if (resultEl) {
    resultEl.textContent = `Recommended spacing: ${spacing.toFixed(1)} ft`;
  } else {
    console.error('#result element not found.');
  }
}

// ----------------------------------------------------
// TABLES: render tables (tables.html)
// ----------------------------------------------------
function setTableGender(gender) {
  tableGender = gender;

  // Toggle button styles if present
  const menBtn = document.getElementById("men-btn");
  const womenBtn = document.getElementById("women-btn");
  if (menBtn && womenBtn) {
    menBtn.classList.remove("active");
    womenBtn.classList.remove("active");
    const activeBtn = document.getElementById(gender + "-btn");
    if (activeBtn) activeBtn.classList.add("active");
  }

  generateTable();
}

function generateTable() {
  const gender = tableGender;
  const container = document.getElementById("tables-container");
  if (!container) {
    console.error('#tables-container not found.');
    return;
  }

  container.innerHTML = ""; // clear

  const speedLevels = [0.6, 0.7, 0.8, 0.9, 1.0];

  // Build a table
  const table = document.createElement("table");

  // Header
  let header = "<tr><th>Steps</th>";
  speedLevels.forEach(s => header += `<th>${Math.round(s*100)}%</th>`);
  header += "</tr>";
  table.innerHTML = header;

  // Rows for steps 2–9
  for (let steps = 2; steps <= 9; steps++) {
    let rowHtml = `<tr><td>${steps}</td>`;
    speedLevels.forEach(s => {
      const spacing = calculateSpacing(gender, steps, s);
      rowHtml += `<td>${spacing.toFixed(1)}</td>`;
    });
    rowHtml += "</tr>";
    table.innerHTML += rowHtml;
  }

  container.appendChild(table);
}

// ----------------------------------------------------
// EXPOSE functions to window for inline handlers
// ----------------------------------------------------
window.runCalculator = runCalculator;
window.generateTable = generateTable;
window.setTableGender = setTableGender;
window.calculateSpacing = calculateSpacing; // handy for console testing

