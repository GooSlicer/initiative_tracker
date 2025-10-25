import { saveToStorage } from "./storage.js";
import { setupAutocomplete } from "./autocomplete.js";
import { HERO_MAX_HP, HERO_EMOJIS } from "./heroMaxHP.js";

export function updateRowStyle(row, hpInput, nameInput) {
  const hpStr = hpInput.value.trim(); //хп
  const rawName = nameInput.value.trim(); //имя

  row.classList.remove('dead', 'deceased', 'initiative-20');

  const initInput = row.querySelector('.initiative-input');
  const initValue = parseInt(initInput?.value);
  // читая 20 на инициативу
  if (initValue === 20) {
    row.classList.add('initiative-20');
  }

  if (hpStr === '') return;

  const hp = parseInt(hpStr);

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
export function sortTable() {
  const tableBody = document.getElementById("tableBody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const activeElement = document.activeElement;

  rows.sort((a, b) => {
    const aInit = parseInt(a.querySelector(".initiative-input").value) || -1;
    const bInit = parseInt(b.querySelector(".initiative-input").value) || -1;
    const aHp =
      parseInt(a.querySelectorAll('input[type="number"]')[1]?.value) || 0;
    const bHp =
      parseInt(b.querySelectorAll('input[type="number"]')[1]?.value) || 0;

    const aDead = aHp <= 0;
    const bDead = bHp <= 0;

    if (aDead === bDead) return bInit - aInit; //если мертвый то вниз списка
    return aDead ? 1 : -1;
  });

  rows.forEach((row) => tableBody.appendChild(row));

  if (activeElement && activeElement.tagName === "INPUT") {
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
  const initInput = document.createElement("input");
  initInput.type = "number";
  initInput.placeholder = "d20";
  initInput.className = "initiative-input";
  initInput.min = "-30";
  initInput.max = "99";
  initInput.value = initiative;
  initInput.addEventListener("input", function () {
    let val = parseInt(this.value);
    if (isNaN(val)) return;
    if (val < -30) this.value = -30;
    if (val > 99) this.value = 99;
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

  const hpInput = document.createElement("input");
  hpInput.type = "number";
  hpInput.value = hp;
  hpInput.style.paddingRight = "20px";

  // Подсказка максимального HP
  const maxHpLabel = document.createElement("span");
  maxHpLabel.style.position = "relative";
  maxHpLabel.style.left = "45px";
  maxHpLabel.style.top = "21px";
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

  row.appendChild(initCell);
  row.appendChild(nameCell);
  row.appendChild(hpCell);
  row.appendChild(damageCell);

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

export function resetAll() { //кнопка сбросить
  if (confirm("Сбросить всю таблицу? Все данные будут удалены.")) {
    localStorage.removeItem("initiativeTrackerData");
    document.getElementById("tableBody").innerHTML = "";
    addRow();
  }
}
