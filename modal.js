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
  const dayEntries = getEntries().filter(entry => entry.date === date);

  if (dayEntries.length === 0) {
    return; // Don't open modal if no entries
  }

  renderModalContents(date);
  document.getElementById('day-modal').style.display = 'flex';
}

function renderModalContents(date) {
  const dayEntries = getEntries().filter(entry => entry.date === date);

  if (dayEntries.length === 0) {
    closeModal();
    return;
  }

  const totalCaffeine = dayEntries.reduce((sum, entry) => sum + entry.mg, 0);

  document.getElementById('modal-date').textContent = formatDate(date);
  document.getElementById('modal-total').textContent = `Total: ${totalCaffeine} mg`;

  const drinksList = document.getElementById('modal-drinks-list');
  drinksList.innerHTML = '';
  dayEntries.forEach(entry => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.className = 'modal-drink-label';
    label.textContent = `${entry.drink}: ${entry.mg} mg`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'modal-delete-btn';
    deleteBtn.setAttribute('aria-label', `Delete ${entry.drink}`);
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', async () => {
      if (!confirm(`Delete "${entry.drink}: ${entry.mg} mg"?`)) return;
      deleteBtn.disabled = true;
      const ok = await deleteEntry(entry.id);
      if (ok) {
        renderModalContents(date);
      } else {
        deleteBtn.disabled = false;
      }
    });

    li.appendChild(label);
    li.appendChild(deleteBtn);
    drinksList.appendChild(li);
  });
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
