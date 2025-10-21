// js/table.js

import { saveToStorage } from './storage.js';
import { setupAutocomplete } from './autocomplete.js';

import { HERO_MAX_HP } from './heroMaxHP.js';

export function updateRowStyle(row, hpInput, nameInput) {
  const hpStr = hpInput.value.trim();
  const name = nameInput.value.trim();

  // Удаляем все специальные классы
  row.classList.remove('dead', 'deceased', 'initiative-20');

  // --- Проверка инициативы ---
  const initInput = row.querySelector('.initiative-input');
  const initValue = parseInt(initInput?.value) || 0;
  if (initValue === 20) {
    row.classList.add('initiative-20');
  }

  // --- Проверка здоровья ---
  if (hpStr === '') {
    return;
  }

  const hp = parseInt(hpStr) || 0;

  const isHero = HERO_MAX_HP.hasOwnProperty(name);
  const maxHP = isHero ? HERO_MAX_HP[name] : null;

  if (hp > 0) {
    return;
  }

  if (!isHero) {
    row.classList.add('dead');
    return;
  }

  if (hp <= -maxHP) {
    row.classList.add('deceased');
  } else {
    row.classList.add('dead');
  }
}

export function sortTable() {
  const tableBody = document.getElementById('tableBody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));
  const activeElement = document.activeElement;

  rows.sort((a, b) => {
    const aInit = parseInt(a.querySelector('.initiative-input').value) || -1;
    const bInit = parseInt(b.querySelector('.initiative-input').value) || -1;
    const aHp = parseInt(a.querySelectorAll('input[type="number"]')[1]?.value) || 0;
    const bHp = parseInt(b.querySelectorAll('input[type="number"]')[1]?.value) || 0;

    const aDead = aHp <= 0;
    const bDead = bHp <= 0;

    if (aDead === bDead) return bInit - aInit;
    return aDead ? 1 : -1;
  });

  rows.forEach(row => tableBody.appendChild(row));

  if (activeElement && activeElement.tagName === 'INPUT') {
    activeElement.focus();
  }

  saveToStorage();
}

export function addRowWithData(initiative = '', name = '', hp = '') {
  const tableBody = document.getElementById('tableBody');
  const row = document.createElement('tr');

  // D20
  const initCell = document.createElement('td');
  const initInput = document.createElement('input');
  initInput.type = 'number';
  initInput.className = 'initiative-input';
  initInput.min = '-30';
  initInput.max = '99';
  initInput.value = initiative;
  initInput.addEventListener('input', function () {
  let val = parseInt(this.value);
  if (isNaN(val)) return;
  if (val < -30) this.value = -30;
  if (val > 99) this.value = 99;
  updateRowStyle(row, hpInput, nameInput); // ← добавили!
  sortTable();
  });

  // Имя
  const nameCell = document.createElement('td');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Имя';
  nameInput.value = name;

  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.className = 'suggestions';
  suggestionsDiv.style.display = 'none';
  setupAutocomplete(nameInput, suggestionsDiv);

  nameInput.addEventListener('input', saveToStorage);
  nameCell.style.position = 'relative';
  nameCell.appendChild(nameInput);
  nameCell.appendChild(suggestionsDiv);

  // HP: поле ввода + подсказка максимального HP
const hpCell = document.createElement('td');
hpCell.style.position = 'relative';

const hpInput = document.createElement('input');
hpInput.type = 'number';
hpInput.value = hp;
hpInput.style.width = '100%';
hpInput.style.paddingRight = '20px'; // место для подсказки

// Подсказка максимального HP (серая, справа внутри поля)
const maxHpLabel = document.createElement('span');
maxHpLabel.style.position = 'absolute';
maxHpLabel.style.right = '50px';
maxHpLabel.style.top = '50%';
maxHpLabel.style.transform = 'translateY(-50%)';
maxHpLabel.style.color = '#888';
maxHpLabel.style.fontSize = '0.85em';
maxHpLabel.style.pointerEvents = 'none'; // чтобы не мешала кликам

function updateMaxHpLabel() {
  const name = nameInput.value.trim();
  const isHero = HERO_MAX_HP.hasOwnProperty(name);
  if (isHero) {
    maxHpLabel.textContent = '/' + HERO_MAX_HP[name];
    maxHpLabel.style.display = 'block';
  } else {
    maxHpLabel.style.display = 'none';
  }
}

// Обновляем подсказку при изменении имени
nameInput.addEventListener('input', updateMaxHpLabel);
nameInput.addEventListener('blur', updateMaxHpLabel);

updateMaxHpLabel(); // при создании

hpInput.addEventListener('input', () => {
  updateRowStyle(row, hpInput, nameInput);
  saveToStorage();
  sortTable();
});

hpCell.appendChild(hpInput);
hpCell.appendChild(maxHpLabel);

  // Урон
  const damageCell = document.createElement('td');
  damageCell.className = 'damage-cell';

  const damageInput = document.createElement('input');
  damageInput.type = 'number';
  damageInput.className = 'damage-input';
  damageInput.min = '0';

  const applyBtn = document.createElement('button');
  applyBtn.className = 'apply-damage-btn';
  applyBtn.textContent = '–';
  applyBtn.onclick = function () {
    const currentHP = parseInt(hpInput.value);
    const damage = parseInt(damageInput.value);
    hpInput.value = currentHP - damage;
    damageInput.value = '';
    updateRowStyle(row, hpInput, nameInput);
    saveToStorage();
    sortTable();
  };

  // Сборка
  initCell.appendChild(initInput);
  hpCell.appendChild(hpInput);
  damageCell.appendChild(damageInput);
  damageCell.appendChild(applyBtn);

  row.appendChild(initCell);
  row.appendChild(nameCell);
  row.appendChild(hpCell);
  row.appendChild(damageCell);

  tableBody.appendChild(row);
  updateRowStyle(row, hpInput, nameInput);
}

export function addRow() {
  addRowWithData('', '', '');
}

export function resetAll() {
  if (confirm('Сбросить всю таблицу? Все данные будут удалены.')) {
    localStorage.removeItem('initiativeTrackerData');
    document.getElementById('tableBody').innerHTML = '';
    addRow();
  }
}