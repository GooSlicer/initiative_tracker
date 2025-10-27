import { saveToStorage } from "./storage.js";
import { setupAutocomplete } from "./autocomplete.js";
import { HERO_MAX_HP, HERO_EMOJIS } from "./heroMaxHP.js";

export function updateRowStyle(row, hpInput, nameInput) {
  const hpStr = hpInput.value.trim();
  const rawName = nameInput.value.trim();
  row.classList.remove('dead', 'deceased', 'initiative-20', 'initiative-crit-fail');

  const initInput = row.querySelector('.initiative-input');
  const initValueRaw = initInput?.value.trim();

  row.classList.remove('initiative-20', 'initiative-crit-fail');

  if (initValueRaw === '!20') {
    row.classList.add('initiative-20');
  }
  else if (initValueRaw === '!1') {
    row.classList.add('initiative-crit-fail');
  }

  if (hpStr === '') return;

  const hp = parseInt(hpStr);
  if (isNaN(hp)) return;

  const clean = cleanName(rawName);
  const isHero = HERO_MAX_HP.hasOwnProperty(clean);
  const maxHP = isHero ? HERO_MAX_HP[clean] : null;

  if (hp > 0) return;

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

export function cleanName(name) {
  return name.replace(/^[^\wа-яА-Я]+/, '').trim();
}
// сортировка таблицы по инициативе
function sortTable() {
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
//заполняет таблицу пустой строкой
export function addRowWithData(initiative = "", name = "", hp = "") {
  const tableBody = document.getElementById("tableBody");
  const row = document.createElement("tr");

  // D20
  const initCell = document.createElement("td");
  const initInput = document.createElement('input');
  initInput.type = 'text';
  initInput.placeholder = "d20";
  initInput.className = "initiative-input";
  initInput.min = "-30";
  initInput.max = "99";
  initInput.value = initiative;
  initInput.addEventListener('input', function () {
    let value = this.value;

    if (value === '!20' || value === '!1') {
    } else if (value === '') {
    } else {
      value = value.replace(/[^0-9\-]/g, '');
      const num = parseInt(value);
      if (!isNaN(num)) {
        if (num < -30) value = '-30';
        if (num > 99) value = '99';
      } else {
        value = '';
      }
    }

    this.value = value;
    updateRowStyle(row, hpInput, nameInput);
    sortTable();
  });

  // Имя
  const nameCell = document.createElement("td");
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Имя";
  nameInput.value = name;

  const suggestionsDiv = document.createElement("div");
  suggestionsDiv.className = "suggestions";
  suggestionsDiv.style.display = "none";
  setupAutocomplete(nameInput, suggestionsDiv);

  nameInput.addEventListener("input", saveToStorage);
  nameCell.style.position = "relative";
  nameCell.appendChild(nameInput);
  nameCell.appendChild(suggestionsDiv);

  // HP
  const hpCell = document.createElement("td");
  hpCell.style.position = "relative";
  hpCell.style.alignSelf = "center";

  const hpInput = document.createElement("input");
  hpInput.type = "number";
  hpInput.value = hp;

  // Подсказка максимального HP
  const maxHpLabel = document.createElement("span");
  maxHpLabel.style.position = "relative";
  maxHpLabel.style.height = "0px";
  maxHpLabel.style.left = "45px";
  maxHpLabel.style.top = "6px";
  maxHpLabel.style.color = "#888";
  maxHpLabel.style.fontSize = "0.85em";
  maxHpLabel.style.pointerEvents = "none";

  function updateMaxHpLabel() {
    const name = nameInput.value.trim();
    const clean = cleanName(name);
    const isHero = HERO_MAX_HP.hasOwnProperty(clean);
    if (isHero) {
      maxHpLabel.textContent = "/" + HERO_MAX_HP[clean];
      maxHpLabel.style.display = "block";
    } else {
      maxHpLabel.style.display = "none";
    }
  }

  nameInput.addEventListener("input", updateMaxHpLabel);
  nameInput.addEventListener("blur", updateMaxHpLabel);

  updateMaxHpLabel();

  hpInput.addEventListener("input", () => {
    updateRowStyle(row, hpInput, nameInput);
    saveToStorage();
    sortTable();
  });

  hpCell.appendChild(hpInput);
  hpCell.appendChild(maxHpLabel);

  // Кнопка удалить
  const deleteCell = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Удалить";
  deleteBtn.onclick = function () {
    row.remove();
  };

  // Урон
  const damageCell = document.createElement("td");
  damageCell.className = "damage-cell";

  const damageInput = document.createElement("input");
  damageInput.type = "number";
  damageInput.className = "damage-input";
  damageInput.min = "0";

  const applyBtn = document.createElement("button");
  applyBtn.className = "apply-damage-btn";
  applyBtn.textContent = "–";
  applyBtn.onclick = function () {
    const currentHP = parseInt(hpInput.value);
    const damage = parseInt(damageInput.value);
    hpInput.value = currentHP - damage;
    damageInput.value = "";
    updateRowStyle(row, hpInput, nameInput);
    saveToStorage();
    sortTable();
  };

  // Сборка
  initCell.appendChild(initInput);
  hpCell.appendChild(hpInput);
  damageCell.appendChild(damageInput);
  damageCell.appendChild(applyBtn);
  deleteCell.appendChild(deleteBtn);

  row.appendChild(initCell);
  row.appendChild(nameCell);
  row.appendChild(hpCell);
  row.appendChild(damageCell);
  row.appendChild(deleteCell);

  tableBody.appendChild(row);
  updateRowStyle(row, hpInput, nameInput);
  nameInput.addEventListener('blur', () => {
    const value = nameInput.value.trim();
    const cleanName = value.replace(/^[^\wа-яА-Я]+/, '').trim();
    if (HERO_EMOJIS[cleanName]) {
      nameInput.value = `${HERO_EMOJIS[cleanName]} ${cleanName}`;
    }
    saveToStorage();
  });
}

export function addRow() { //кнопка +
  addRowWithData("", "", "");
}

// кнопка добавить персонажей
export function fillHeroes() {
  const existingNames = new Set();
  document.querySelectorAll('#tableBody input[type="text"]').forEach(input => {
    const rawName = input.value.trim();
    if (rawName) {
      const clean = cleanName(rawName);
      existingNames.add(clean);
    }
  });
  for (const [name, emoji] of Object.entries(HERO_EMOJIS)) {
    if (!existingNames.has(name)) {
      addRowWithData("", `${emoji} ${name}`, "");
    }
  }
  saveToStorage();
  sortTable();
}

export function resetAll() { //кнопка сбросить
  if (confirm("Сбросить всю таблицу? Все данные будут удалены.")) {
    localStorage.removeItem("initiativeTrackerData");
    document.getElementById("tableBody").innerHTML = "";
    addRow();
  }
}