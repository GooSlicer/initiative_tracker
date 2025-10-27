import { HERO_EMOJIS } from "./heroData.js";
import { saveToStorage } from "./storage.js";

function showSuggestions(input, suggestionsDiv) {
  const usedNames = new Set();
  document.querySelectorAll('#tableBody input[type="text"]').forEach(inp => {
    const val = inp.value.trim();
    if (val) {
      const cleanName = val.replace(/^[^\wа-яА-Я]+/, '').trim();
      usedNames.add(cleanName);
    }
  });

  const value = input.value.toLowerCase();
  suggestionsDiv.innerHTML = '';

  const filtered = CHARACTER_NAMES.filter(name => {
    return !usedNames.has(name) && name.toLowerCase().includes(value);
  });

  if (filtered.length === 0 || value === '') {
    suggestionsDiv.style.display = 'none';
    return;
  }

  filtered.forEach(name => {
    const emoji = HERO_EMOJIS[name] || '';
    const item = document.createElement('div');
    item.textContent = `${emoji} ${name}`;
    item.onclick = () => {
      input.value = `${emoji} ${name}`;
      suggestionsDiv.style.display = 'none';
      input.focus();
      saveToStorage();
    };
    suggestionsDiv.appendChild(item);
  });

  suggestionsDiv.style.display = 'block';
}

export function setupAutocomplete(nameInput, suggestionsDiv) {
  const showIfNeeded = () => {
    suggestionsDiv.style.display = 'none';
    setTimeout(() => showSuggestions(nameInput, suggestionsDiv), 10);
  };

  nameInput.addEventListener('input', showIfNeeded);
  nameInput.addEventListener('focus', showIfNeeded);
  nameInput.addEventListener('blur', () => setTimeout(() => { suggestionsDiv.style.display = 'none'; }, 200));
  suggestionsDiv.addEventListener('mousedown', e => e.preventDefault());
}