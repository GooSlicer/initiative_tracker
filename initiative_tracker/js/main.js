import { loadFromStorage } from "./storage.js";
import { addRow, addRowWithData } from "./table.js";

document.addEventListener("DOMContentLoaded", () => {
  const saved = loadFromStorage();
  if (saved && Array.isArray(saved)) {
    saved.forEach((data) =>
      addRowWithData(data.initiative, data.name, data.hp)
    );
  } else {
    addRow();
  }
});
