const STORAGE_KEY = "caffeine_entries";
const GOAL_KEY = "caffeine_daily_goal";

function getEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getDailyGoal() {
  const goal = localStorage.getItem(GOAL_KEY);
  return goal ? parseInt(goal) : null;
}

function setDailyGoal(goal) {
  localStorage.setItem(GOAL_KEY, goal.toString());
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
  const goal = getDailyGoal();

  document.getElementById("daily-avg").textContent = `${dailyAvg} mg`;

  const goalElement = document.getElementById("daily-goal");
  if (goal) {
    goalElement.textContent = `${goal} mg`;
  } else {
    goalElement.textContent = "Set your daily average goal.";
  }
}

// Render only today's entries
function renderEntries() {
  const entriesList = document.getElementById("entries-list");
  const entries = getEntries();

  // Clear existing list
  entriesList.innerHTML = "";

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Filter entries for today only
  const todayEntries = entries.filter(entry => entry.date === today);

  if (todayEntries.length === 0) {
    const noEntries = document.createElement("li");
    noEntries.className = "no-entries";
    noEntries.textContent = "No entries for today yet.";
    entriesList.appendChild(noEntries);
    return;
  }

  // Calculate daily total
  const dailyTotal = todayEntries.reduce((sum, entry) => sum + entry.mg, 0);

  // Create date header with total
  const dateHeader = document.createElement("li");
  dateHeader.className = "date-group-header";
  dateHeader.textContent = `Today - Total: ${dailyTotal} mg`;
  entriesList.appendChild(dateHeader);

  // Add individual entries for today
  todayEntries.forEach(entry => {
    const li = document.createElement("li");
    li.className = "entry-item";
    li.textContent = `  ${entry.drink}: ${entry.mg} mg`;
    entriesList.appendChild(li);
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

// Handle goal setting/editing
const goalSettingsIcon = document.getElementById("goal-settings");
goalSettingsIcon.addEventListener("click", function() {
  const currentGoal = getDailyGoal();
  const message = currentGoal
    ? `Current goal: ${currentGoal} mg\n\nEnter your new daily average goal (mg):`
    : "Enter your daily average goal (mg):";

  const newGoal = prompt(message, currentGoal || "");

  if (newGoal !== null && newGoal.trim() !== "") {
    const goalValue = parseInt(newGoal);
    if (!isNaN(goalValue) && goalValue > 0) {
      setDailyGoal(goalValue);
      renderStats();
    } else {
      alert("Please enter a valid number greater than 0.");
    }
  }
});

// Initial render
renderEntries();
renderStats();
