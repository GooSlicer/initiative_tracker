import { addRowWithData } from "./table.js";
import { saveToStorage } from "./storage.js";
import { sortTable } from "./sortTable.js";
import { HERO_EMOJIS, cleanName } from "./heroData.js";

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