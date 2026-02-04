// Modal functionality for displaying day details

function createModal() {
  const modal = document.createElement('div');
  modal.id = 'day-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2 id="modal-date"></h2>
      <div id="modal-total" class="modal-total"></div>
      <ul id="modal-drinks-list" class="modal-drinks-list"></ul>
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal when clicking the X
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside the content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function openModal(date) {
  const modal = document.getElementById('day-modal');
  const entries = getEntries();

  // Filter entries for the selected date
  const dayEntries = entries.filter(entry => entry.date === date);

  if (dayEntries.length === 0) {
    return; // Don't open modal if no entries
  }

  // Calculate total caffeine for the day
  const totalCaffeine = dayEntries.reduce((sum, entry) => sum + entry.mg, 0);

  // Update modal content
  document.getElementById('modal-date').textContent = formatDate(date);
  document.getElementById('modal-total').textContent = `Total: ${totalCaffeine} mg`;

  // Populate drinks list
  const drinksList = document.getElementById('modal-drinks-list');
  drinksList.innerHTML = '';
  dayEntries.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.drink}: ${entry.mg} mg`;
    drinksList.appendChild(li);
  });

  // Show modal
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('day-modal');
  modal.style.display = 'none';
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Initialize modal on page load
document.addEventListener('DOMContentLoaded', function() {
  createModal();
});
