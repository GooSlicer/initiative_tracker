import { saveToStorage } from "./storage.js";

export function sortTable() {
  const tableBody = document.getElementById('tableBody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));
  const activeElement = document.activeElement;

  rows.sort((a, b) => {
    const aInitRaw = a.querySelector('.initiative-input').value.trim();
    const bInitRaw = b.querySelector('.initiative-input').value.trim();

    const parseInit = (raw) => {
      if (raw === '!20') return 20;
      if (raw === '!1') return 1;
      const num = parseInt(raw);
      return isNaN(num) ? -1 : num;
    };

    const aVal = parseInit(aInitRaw);
    const bVal = parseInit(bInitRaw);

    const aHp = parseInt(a.querySelectorAll('input[type="number"]')[1]?.value) || 0;
    const bHp = parseInt(b.querySelectorAll('input[type="number"]')[1]?.value) || 0;

    const aDead = aHp <= 0;
    const bDead = bHp <= 0;

    if (aDead === bDead) return bVal - aVal;
    return aDead ? 1 : -1;
  });

  rows.forEach(row => tableBody.appendChild(row));

  if (activeElement && activeElement.tagName === 'INPUT') {
    activeElement.focus();
  }

  saveToStorage();
}