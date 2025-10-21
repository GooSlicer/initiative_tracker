const STORAGE_KEY = 'initiativeTrackerData';

export function saveToStorage() {
  const rows = [];
  document.querySelectorAll('#tableBody tr').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 3) {
      rows.push({
        initiative: inputs[0].value,
        name: inputs[1].value,
        hp: inputs[2].value
      });
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.warn('Ошибка загрузки данных:', e);
    return null;
  }
}