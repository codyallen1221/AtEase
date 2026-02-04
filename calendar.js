// Calendar functionality for displaying month and year views

let currentView = 'month'; // 'month' or 'year'
let currentDate = new Date();

function initCalendar() {
  renderCalendar();
  setupToggleButton();
}

function setupToggleButton() {
  const toggleBtn = document.getElementById('calendar-toggle');
  toggleBtn.addEventListener('click', function() {
    currentView = currentView === 'month' ? 'year' : 'month';
    toggleBtn.textContent = currentView === 'month' ? 'Year View' : 'Month View';
    renderCalendar();
  });
}

function renderCalendar() {
  const container = document.getElementById('calendar-container');

  if (currentView === 'month') {
    container.innerHTML = renderMonthView();
  } else {
    container.innerHTML = renderYearView();
  }

  attachDayClickHandlers();
}

function renderMonthView() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  let html = `
    <div class="calendar-header">
      <button class="calendar-nav" data-action="prev-month">&lt;</button>
      <h3>${monthNames[month]} ${year}</h3>
      <button class="calendar-nav" data-action="next-month">&gt;</button>
    </div>
    <div class="calendar-grid month-view">
      <div class="calendar-day-name">Sun</div>
      <div class="calendar-day-name">Mon</div>
      <div class="calendar-day-name">Tue</div>
      <div class="calendar-day-name">Wed</div>
      <div class="calendar-day-name">Thu</div>
      <div class="calendar-day-name">Fri</div>
      <div class="calendar-day-name">Sat</div>
  `;

  // Empty cells for days before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Days of the month
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayClasses = getDayClasses(date, dateStr, todayStr);

    html += `<div class="calendar-day ${dayClasses}" data-date="${dateStr}">${day}</div>`;
  }

  html += '</div>';

  return html;
}

function renderYearView() {
  const year = currentDate.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  let html = `
    <div class="calendar-header">
      <button class="calendar-nav" data-action="prev-year">&lt;</button>
      <h3>${year}</h3>
      <button class="calendar-nav" data-action="next-year">&gt;</button>
    </div>
    <div class="year-grid">
  `;

  for (let month = 0; month < 12; month++) {
    html += renderMiniMonth(year, month, monthNames[month]);
  }

  html += '</div>';
  return html;
}

function renderMiniMonth(year, month, monthName) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  let html = `
    <div class="mini-month">
      <div class="mini-month-name">${monthName}</div>
      <div class="mini-month-grid">
        <div class="mini-day-name">S</div>
        <div class="mini-day-name">M</div>
        <div class="mini-day-name">T</div>
        <div class="mini-day-name">W</div>
        <div class="mini-day-name">T</div>
        <div class="mini-day-name">F</div>
        <div class="mini-day-name">S</div>
  `;

  // Empty cells
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="mini-day empty"></div>';
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayClasses = getDayClasses(date, dateStr, todayStr);

    html += `<div class="mini-day ${dayClasses}" data-date="${dateStr}">${day}</div>`;
  }

  html += '</div></div>';
  return html;
}

function getDayClasses(date, dateStr, todayStr) {
  const classes = [];
  const today = new Date();

  // Check if it's today
  if (dateStr === todayStr) {
    classes.push('today');
  }

  // Check if it's in the future
  if (date > today) {
    classes.push('future');
  }

  // Check if it's in the past and has entries
  if (date < today && hasEntriesForDate(dateStr)) {
    classes.push('has-data');
  }

  return classes.join(' ');
}

function hasEntriesForDate(dateStr) {
  const entries = getEntries();
  return entries.some(entry => entry.date === dateStr);
}

function attachDayClickHandlers() {
  // Navigation buttons
  const navButtons = document.querySelectorAll('.calendar-nav');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      handleNavigation(action);
    });
  });

  // Day clicks
  const days = document.querySelectorAll('.calendar-day.has-data, .mini-day.has-data');
  days.forEach(day => {
    day.addEventListener('click', function() {
      const date = this.dataset.date;
      openModal(date);
    });
  });
}

function handleNavigation(action) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  switch(action) {
    case 'prev-month':
      currentDate = new Date(year, month - 1, 1);
      break;
    case 'next-month':
      currentDate = new Date(year, month + 1, 1);
      break;
    case 'prev-year':
      currentDate = new Date(year - 1, month, 1);
      break;
    case 'next-year':
      currentDate = new Date(year + 1, month, 1);
      break;
  }

  renderCalendar();
}

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', function() {
  initCalendar();
});
