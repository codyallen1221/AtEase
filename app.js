const STORAGE_KEY = "caffeine_entries";

function getEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Calculate daily average (all time)
function calculateDailyAverage() {
  const entries = getEntries();
  if (entries.length === 0) return 0;

  // Group by date and sum mg per day
  const dailyTotals = {};
  entries.forEach(entry => {
    if (!dailyTotals[entry.date]) {
      dailyTotals[entry.date] = 0;
    }
    dailyTotals[entry.date] += entry.mg;
  });

  // Calculate average
  const totalMg = Object.values(dailyTotals).reduce((sum, mg) => sum + mg, 0);
  const numDays = Object.keys(dailyTotals).length;

  return Math.round(totalMg / numDays);
}

// Calculate weekly average (last 4 weeks - daily average)
function calculateWeeklyAverage() {
  const entries = getEntries();
  if (entries.length === 0) return 0;

  const today = new Date();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);

  // Filter entries from last 4 weeks
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= fourWeeksAgo && entryDate <= today;
  });

  if (recentEntries.length === 0) return 0;

  // Sum total mg in last 4 weeks
  const totalMg = recentEntries.reduce((sum, entry) => sum + entry.mg, 0);

  // Divide by 28 days
  return Math.round(totalMg / 28);
}

// Calculate monthly average (last 3 months - daily average)
function calculateMonthlyAverage() {
  const entries = getEntries();
  if (entries.length === 0) return 0;

  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setDate(today.getDate() - 90);

  // Filter entries from last 3 months
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= threeMonthsAgo && entryDate <= today;
  });

  if (recentEntries.length === 0) return 0;

  // Sum total mg in last 3 months
  const totalMg = recentEntries.reduce((sum, entry) => sum + entry.mg, 0);

  // Divide by 90 days
  return Math.round(totalMg / 90);
}

// Add a new entry
function addEntry(drink, mg) {
  const entries = getEntries();

  const newEntry = {
    id: Date.now(),
    date: new Date().toISOString().split("T")[0],
    drink,
    mg
  };

  entries.push(newEntry);
  saveEntries(entries);

  renderEntries(); // update the screen
  renderStats(); // update stats
}

// Render stats section
function renderStats() {
  const dailyAvg = calculateDailyAverage();
  const weeklyAvg = calculateWeeklyAverage();
  const monthlyAvg = calculateMonthlyAverage();

  document.getElementById("daily-avg").textContent = `${dailyAvg} mg`;
  document.getElementById("weekly-avg").textContent = `${weeklyAvg} mg`;
  document.getElementById("monthly-avg").textContent = `${monthlyAvg} mg`;
}

// Render all entries grouped by date
function renderEntries() {
  const entriesList = document.getElementById("entries-list");
  const entries = getEntries();

  // Clear existing list
  entriesList.innerHTML = "";

  // Group entries by date
  const entriesByDate = {};
  entries.forEach(entry => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

  // Render each date group
  sortedDates.forEach(date => {
    const dateEntries = entriesByDate[date];

    // Calculate daily total
    const dailyTotal = dateEntries.reduce((sum, entry) => sum + entry.mg, 0);

    // Create date header with total
    const dateHeader = document.createElement("li");
    dateHeader.className = "date-group-header";
    dateHeader.textContent = `${date} - Total: ${dailyTotal} mg`;
    entriesList.appendChild(dateHeader);

    // Add individual entries for this date
    dateEntries.forEach(entry => {
      const li = document.createElement("li");
      li.className = "entry-item";
      li.textContent = `  ${entry.drink}: ${entry.mg} mg`;
      entriesList.appendChild(li);
    });
  });
}

// Handle form submission
const form = document.getElementById("entry-form");
form.addEventListener("submit", function(e) {
  e.preventDefault(); // prevent page reload

  const drinkInput = document.getElementById("drink");
  const mgInput = document.getElementById("mg");

  addEntry(drinkInput.value, Number(mgInput.value));

  // Clear inputs
  drinkInput.value = "";
  mgInput.value = "";
});

// Initial render
renderEntries();
renderStats();
