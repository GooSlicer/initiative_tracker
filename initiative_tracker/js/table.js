import { saveToStorage } from "./storage.js";
import { setupAutocomplete } from "./autocomplete.js";
import { HERO_MAX_HP, HERO_EMOJIS, cleanName } from "./heroData.js";
import { updateRowStyle } from "./updateRowStyle.js";
import { sortTable } from "./sortTable.js";

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
  nameInput.className = "name-input";


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
  deleteBtn.onclick = () => {
  row.classList.add('deleting');
  setTimeout(() => {
    row.remove();
    saveToStorage();
    sortTable();
  }, 300);
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
  const hpStr = hpInput.value.trim();
  const currentHP = hpStr === '' ? 0 : (parseInt(hpStr) || 0);
  
  const damageStr = damageInput.value.trim();
  const damage = damageStr === '' ? 0 : (parseInt(damageStr) || 0);
  
  hpInput.value = currentHP - damage;
  damageInput.value = '';
  if (damage < 0){
    hpInput.classList.add('healed');
    setTimeout(() => {
    hpInput.classList.remove('healed');
  }, 800);
  }
  if (damage > 0){
    hpInput.classList.add('hit');
    setTimeout(() => {
    hpInput.classList.remove('hit');
  }, 800);
  }
  
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