import { loadFromStorage } from "./storage.js";
import { addRow } from "./buttons.js";
import { addRowWithData } from "./table.js";

// при загрузке контента вытаскивает данные из кеша
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
