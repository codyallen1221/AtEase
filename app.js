let entriesCache = [];
let dailyGoalCache = null;

function getEntries() {
  return entriesCache;
}

function getDailyGoal() {
  return dailyGoalCache;
}

async function loadUserData() {
  try {
    const { data: entries, error: entriesError } = await supabaseClient
      .from("entries")
      .select("id, date, drink, mg")
      .order("created_at", { ascending: true });

    if (entriesError) throw entriesError;
    entriesCache = entries || [];

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("daily_goal")
      .maybeSingle();

    if (profileError) throw profileError;
    dailyGoalCache = profile?.daily_goal ?? null;

    renderEntries();
    renderStats();
    if (typeof renderCalendar === "function") renderCalendar();
  } catch (err) {
    showAppError("Could not load your data: " + err.message);
  }
}

function clearUserData() {
  entriesCache = [];
  dailyGoalCache = null;
  const list = document.getElementById("entries-list");
  if (list) list.innerHTML = "";
}

function showAppError(message) {
  const el = document.getElementById("app-error");
  el.textContent = message;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 5000);
}

function calculateDailyAverage() {
  if (entriesCache.length === 0) return 0;

  const dailyTotals = {};
  entriesCache.forEach(entry => {
    if (!dailyTotals[entry.date]) {
      dailyTotals[entry.date] = 0;
    }
    dailyTotals[entry.date] += entry.mg;
  });

  const totalMg = Object.values(dailyTotals).reduce((sum, mg) => sum + mg, 0);
  const numDays = Object.keys(dailyTotals).length;

  return Math.round(totalMg / numDays);
}

async function addEntry(drink, mg) {
  if (!currentUser) return;

  const date = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseClient
    .from("entries")
    .insert({ user_id: currentUser.id, date, drink, mg })
    .select("id, date, drink, mg")
    .single();

  if (error) {
    showAppError("Could not save entry: " + error.message);
    return;
  }

  entriesCache.push(data);
  renderEntries();
  renderStats();
  if (typeof renderCalendar === "function") renderCalendar();
}

async function setDailyGoal(goal) {
  if (!currentUser) return;

  const { error } = await supabaseClient
    .from("profiles")
    .upsert({ user_id: currentUser.id, daily_goal: goal, updated_at: new Date().toISOString() });

  if (error) {
    showAppError("Could not save goal: " + error.message);
    return;
  }

  dailyGoalCache = goal;
  renderStats();
}

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

function renderEntries() {
  const entriesList = document.getElementById("entries-list");
  entriesList.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];
  const todayEntries = entriesCache.filter(entry => entry.date === today);

  if (todayEntries.length === 0) {
    const noEntries = document.createElement("li");
    noEntries.className = "no-entries";
    noEntries.textContent = "No entries for today yet.";
    entriesList.appendChild(noEntries);
    return;
  }

  const dailyTotal = todayEntries.reduce((sum, entry) => sum + entry.mg, 0);

  const dateHeader = document.createElement("li");
  dateHeader.className = "date-group-header";
  dateHeader.textContent = `Today - Total: ${dailyTotal} mg`;
  entriesList.appendChild(dateHeader);

  todayEntries.forEach(entry => {
    const li = document.createElement("li");
    li.className = "entry-item";
    li.textContent = `  ${entry.drink}: ${entry.mg} mg`;
    entriesList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("entry-form");
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const drinkInput = document.getElementById("drink");
    const mgInput = document.getElementById("mg");

    await addEntry(drinkInput.value, Number(mgInput.value));

    drinkInput.value = "";
    mgInput.value = "";
  });

  const goalSettingsIcon = document.getElementById("goal-settings");
  goalSettingsIcon.addEventListener("click", async function() {
    const currentGoal = getDailyGoal();
    const message = currentGoal
      ? `Current goal: ${currentGoal} mg\n\nEnter your new daily average goal (mg):`
      : "Enter your daily average goal (mg):";

    const newGoal = prompt(message, currentGoal || "");

    if (newGoal !== null && newGoal.trim() !== "") {
      const goalValue = parseInt(newGoal);
      if (!isNaN(goalValue) && goalValue > 0) {
        await setDailyGoal(goalValue);
      } else {
        alert("Please enter a valid number greater than 0.");
      }
    }
  });
});
