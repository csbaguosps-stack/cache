/**
 * Admin Dashboard Scripts
 * Auto History Wipe - MVC
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const pillRadios = document.querySelectorAll('.pill-radio');
  const customDaysBox = document.getElementById('customDaysBox');
  const customDaysInput = document.getElementById('customDays');
  const btnSelectAll = document.getElementById('btnSelectAllTypes');
  const btnDeselectAll = document.getElementById('btnDeselectAllTypes');
  const enableTimedCheckbox = document.getElementById('enableTimedCheckbox');
  const timedInputsRow = document.getElementById('timedInputsRow');

  // Pill Radio Click
  pillRadios.forEach((pill) => {
    pill.addEventListener('click', () => {
      pillRadios.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const radio = pill.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      if (radio && radio.value === 'custom') {
        customDaysBox.style.display = 'flex';
        customDaysInput.focus();
      } else {
        customDaysBox.style.display = 'none';
      }
    });
  });

  // Select / Deselect All Data Types
  if (btnSelectAll && btnDeselectAll) {
    btnSelectAll.addEventListener('click', () => {
      document.querySelectorAll('.data-types-grid input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
      });
    });

    btnDeselectAll.addEventListener('click', () => {
      document.querySelectorAll('.data-types-grid input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
      });
    });
  }

  // Toggle Timed Inputs
  function updateTimedInputs() {
    if (!enableTimedCheckbox) return;
    const isEnabled = enableTimedCheckbox.checked;
    timedInputsRow.style.opacity = isEnabled ? '1' : '0.4';
    timedInputsRow.querySelectorAll('input, select').forEach((el) => {
      el.disabled = !isEnabled;
    });
  }

  if (enableTimedCheckbox) {
    enableTimedCheckbox.addEventListener('change', updateTimedInputs);
    updateTimedInputs();
  }
});
