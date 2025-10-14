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

// ---------------------------
// GLOBAL: unit system setting
// ---------------------------
let unitSystem = localStorage.getItem("unitSystem") || "imperial"; // default

function toggleUnits() {
  unitSystem = unitSystem === "imperial" ? "metric" : "imperial";
  localStorage.setItem("unitSystem", unitSystem);
  alert(`Switched to ${unitSystem === "imperial" ? "Feet & Inches" : "Meters"} display.`);
  // Optionally re-run current calculation if on calculator page
  if (document.getElementById("result")) runCalculator();
  if (document.getElementById("map-result")) runMapping();
}

// Conversion helpers
function metersToFeet(m) { return m * 3.28084; }
//function feetToMeters(ft) { return ft / 3.28084; }

// Display helpers
function formatMeters(metersValue) {
  return `${metersValue.toFixed(2)} m`;
}
// ----------------------------------

// Converts a decimal number in feet to "X ft Y in" format
function formatFeetInches(feetValue) {
  const totalInches = Math.round(feetValue * 12);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet} ft ${inches} in`;
}

// ---------------------------------------------
// CORE MATH: tweak this to change your model
// ---------------------------------------------
function calculateSpacing(gender, steps, speed, frequency = 1) {
  let baseSpacing, hurdleStep;
  if (gender === "men") {
    baseSpacing = 9.14;   // base 3-step spacing at 100%
    hurdleStep = 3.35;     // based on ralph Manns findings for best elite hurdlers
  } else { // Women
    baseSpacing = 8.50;
    hurdleStep = 2.95;    // based on ralph Manns findings for best elite hurdlers
  }

  // Stride length at 100% (for 3-step pattern)
  let strideLength = (baseSpacing - hurdleStep) / 3;

  // Scale stride with speed
  let scaledStride = strideLength * speed / frequency;
  let scaledHurdleStep = hurdleStep * speed
  // Recommended Spacing
  let spacing = scaledHurdleStep + (scaledStride * steps)
 
  // See the console (inspect) in the browser
  console.log({gender, steps, speed, frequency, scaledHurdleStep, scaledStride, spacing});
 
  return spacing; //this returns meters
}

// ----------------------------------------------------
// CALCULATOR: reads DOM, writes result (index.html)
// ----------------------------------------------------
function runCalculator() {
  const gender = document.getElementById("gender").value;
  const steps = parseInt(document.getElementById("steps").value, 10);
  const speed = parseFloat(document.getElementById("speed").value);
  const frequency = parseFloat(document.getElementById("frequency").value);


  const spacing = calculateSpacing(gender, steps, speed, frequency);

  const resultEl = document.getElementById("result");
  if (resultEl) {

   // new with metric toggle
    let displayText = "";
    if (unitSystem === "imperial") {
      displayText = formatFeetInches(metersToFeet(spacing));
    } else {
      displayText = formatMeters(spacing);
    }
    resultEl.textContent = `Recommended spacing: ${displayText}`;
    //-----------------
   
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



// ----------------------------------------------------
// MAPPING: generate hurdle placements from pattern
// ----------------------------------------------------
function runMapping() {
  const gender = document.getElementById("map-gender").value;
  const speed = parseFloat(document.getElementById("map-speed").value);
  const pattern = document.getElementById("pattern").value;
  const frequency = parseFloat(document.getElementById("frequency").value);

  if (!/^[0-9]+$/.test(pattern)) {
    alert("Please enter digits only (e.g., 335 or 5335).");
    return;
  }

  let positions = [0]; // starting line
  let total = 0;

  // --- NEW: regulation spacing constants ---
  const regSpacing = gender === "men" ? 9.14 : 8.50; // in meters

  // --- build hurdle positions ---
  for (let char of pattern) {
    const steps = parseInt(char, 10);
    const spacing = calculateSpacing(gender, steps, speed, frequency);
    total += spacing;
    positions.push(total);
  }

  // --- NEW: Build formatted table output ---
  // Decide which label to show based on the current unit system
  const distanceHeader =
    unitSystem === "imperial" ? "Distance (ft & in)" : "Distance (m)";
  
  let output = `
    <p><em>Note: Place the first hurdle on the first regulation mark (H1). 
    Offsets show distance from the nearest regulation hurdle mark.</em></p>
    <table class="map-table">
      <tr><th>Hurdle</th><th>${distanceHeader}</th><th>Offset vs Reg Mark</th></tr>
  `;


  positions.forEach((dist, i) => {
    const markNum = i + 1;
    let offset;
  
    if (i === 0) {
      offset = "On H1 (start mark)";
    } else {
      const nearestMark = Math.round(dist / regSpacing) * regSpacing;
      const diff = dist - nearestMark;
      let diffDisplay;  // this will hold something like "+1 ft 3 in" or "-0.15 m"
 
      // Check which unit system we’re using
      if (unitSystem === "imperial") {
        const feetDiff = metersToFeet(diff);  // convert to feet
        const sign = feetDiff > 0 ? "+" : feetDiff < 0 ? "−" : ""; // display + or −
        diffDisplay = `${sign}${formatFeetInches(Math.abs(feetDiff))}`;
      } else {
        const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
        diffDisplay = `${sign}${formatMeters(Math.abs(diff))}`;
      }

      const nearestMarkNum = Math.round(dist / regSpacing) + 1;
      const direction = diff >= 0 ? "past" : "short of";
      
      if (Math.abs(diff) < 0.5) {
        offset = `On H${nearestMarkNum}`;
      } else {
        offset = `${diffDisplay} (${direction} H${nearestMarkNum})`;
      }
    }
  
    output += `
      <tr>
        <td>H${markNum}</td>
        <td>${
          unitSystem === "imperial"
            ? formatFeetInches(metersToFeet(dist))
            : formatMeters(dist)
        }</td>
        <td>${offset}</td>
      </tr>
    `;
  });


  output += "</table>";

  // --- inject result ---
  const resultEl = document.getElementById("map-result");
  if (resultEl) {
    resultEl.innerHTML = output;
  } else {
    console.error("#map-result element not found.");
  }
}

window.runMapping = runMapping;
















