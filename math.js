/*
 ===============================
 HURDLE SPACING MATH ENGINE
 ===============================

 This file handles ONLY the calculation logic for hurdle spacing.
 You can safely edit formulas here without affecting UI or PWA setup.
*/

function calculateSpacing() {
  const steps = parseInt(document.getElementById("steps").value);
  const speed = parseFloat(document.getElementById("speed").value);
  const gender = document.getElementById("gender").value;

  // ---------------------------
  // 1. Base Reference Anchors
  // ---------------------------
  let baseSpacing, hurdleStep;
  if (gender === "men") {
    baseSpacing = 30;   // 3-step @ 100% speed (men)
    hurdleStep = 8;     // hurdle clearance distance
  } else {
    baseSpacing = 28;   // 3-step @ 100% speed (women)
    hurdleStep = 7;
  }

  // ---------------------------
  // 2. Calculate stride length
  // ---------------------------
  let strideLength = (baseSpacing - hurdleStep) / 3; // stride @ 100% for 3-step

  // ---------------------------
  // 3. Scale stride with speed
  // ---------------------------
  let scaledStride = strideLength * speed;

  // ---------------------------
  // 4. Scale hurdle step with speed
  // ---------------------------
  let scaledHurdleStep = hurdleStep * speed;

  // ---------------------------
  // 5. Rebuild hurdle spacing
  // ---------------------------
  let spacing = scaledHurdleStep + (scaledStride * steps);

  // Round nicely
  spacing = spacing.toFixed(1);

  // ---------------------------
  // Debug logs (open DevTools → Console)
  // ---------------------------
  console.log("=== Calculation Debug ===");
  console.log("Gender:", gender);
  console.log("Steps:", steps);
  console.log("Speed (%):", speed * 100);
  console.log("Hurdle step distance:", hurdleStep);
  console.log("Stride length @100%:", strideLength.toFixed(2));
  console.log("Scaled stride length:", scaledStride.toFixed(2));
  console.log("Final spacing:", spacing);

  // ---------------------------
  // Display result on page
  // ---------------------------
  document.getElementById("result").innerText =
    `Recommended spacing: ${spacing} ft`;
}

//To Generate the Table
function generateTable() {
  const gender = document.getElementById("gender").value;
  const tablesContainer = document.getElementById("tables-container");
  tablesContainer.innerHTML = ""; // clear old tables

  // Define speeds
  const speedLevels = [0.6, 0.7, 0.8, 0.9, 1.0];

  // Create table element
  let table = document.createElement("table");

  // Header row
  let headerRow = "<tr><th>Steps</th>";
  speedLevels.forEach(s => {
    headerRow += `<th>${Math.round(s*100)}%</th>`;
  });
  headerRow += "</tr>";
  table.innerHTML = headerRow;

  // Build rows for steps 2–9
  for (let steps = 2; steps <= 9; steps++) {
    let row = `<tr><td>${steps}</td>`;
    speedLevels.forEach(s => {
      const spacing = calculateSpacing(gender, steps, s);
      row += `<td>${spacing.toFixed(1)} ft</td>`;
    });
    row += "</tr>";
    table.innerHTML += row;
  }

  // Append to page
  tablesContainer.appendChild(table);
}



