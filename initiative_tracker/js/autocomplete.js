export function showSuggestions(input, suggestionsDiv) {
  if (typeof CHARACTER_NAMES === 'undefined' || !Array.isArray(CHARACTER_NAMES)) {
    console.error('❌ CHARACTER_NAMES не загружен!');
    return;
  }

  const usedNames = new Set();
  document.querySelectorAll('#tableBody input[type="text"]').forEach(inp => {
    const val = inp.value.trim();
    if (val) usedNames.add(val);
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
    const item = document.createElement('div');
    item.textContent = name;
    item.onclick = () => {
      input.value = name;
      suggestionsDiv.style.display = 'none';
      input.focus();
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