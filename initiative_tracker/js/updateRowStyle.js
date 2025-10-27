import { cleanName, HERO_MAX_HP } from "./heroMaxHP.js";

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