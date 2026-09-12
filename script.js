const tabsContainer = document.getElementById("category-tabs");

const screens = {
  menu: document.getElementById("screen-menu"),
  solo: document.getElementById("screen-solo"),
  partySetup: document.getElementById("screen-party-setup"),
  partyPreview: document.getElementById("screen-party-preview"),
  partyPlay: document.getElementById("screen-party-play"),
  partyReady: document.getElementById("screen-party-ready"),
  partyResult: document.getElementById("screen-party-result"),
};

const menuSoloButton = document.getElementById("menu-solo-button");
const menuPartyButton = document.getElementById("menu-party-button");

const drawIcon = document.getElementById("draw-icon");
const drawButton = document.getElementById("draw-button");
const drawHint = document.getElementById("draw-hint");
const soloPreviewBox = document.getElementById("solo-preview-box");
const soloPreviewA = document.getElementById("solo-preview-a");
const soloPreviewB = document.getElementById("solo-preview-b");
const soloRerollButton = document.getElementById("solo-reroll-button");
const soloConfirmButton = document.getElementById("solo-confirm-button");
const dilemmaBox = document.getElementById("dilemma-box");
const optionAButton = document.getElementById("option-a");
const optionBButton = document.getElementById("option-b");
const reaction = document.getElementById("reaction");
const afterActions = document.getElementById("after-actions");
const redrawButton = document.getElementById("redraw-button");
const shareButton = document.getElementById("share-button");

const partyNameList = document.getElementById("party-name-list");
const addNameButton = document.getElementById("add-name-button");
const partyStartButton = document.getElementById("party-start-button");
const partySetupError = document.getElementById("party-setup-error");

const partyDrawIcon = document.getElementById("party-draw-icon");
const partyDrawButton = document.getElementById("party-draw-button");
const partyDrawHint = document.getElementById("party-draw-hint");
const partyPreviewBox = document.getElementById("party-preview-box");
const partyPreviewA = document.getElementById("party-preview-a");
const partyPreviewB = document.getElementById("party-preview-b");
const partyRerollButton = document.getElementById("party-reroll-button");
const partyConfirmButton = document.getElementById("party-confirm-button");

const turnIndicator = document.getElementById("turn-indicator");
const partyOptionAButton = document.getElementById("party-option-a");
const partyOptionBButton = document.getElementById("party-option-b");

const partyRevealButton = document.getElementById("party-reveal-button");

const partyTally = document.getElementById("party-tally");
const partyAnswerList = document.getElementById("party-answer-list");
const partyAgainButton = document.getElementById("party-again-button");
const partyShareButton = document.getElementById("party-share-button");
const partyChangeMembersButton = document.getElementById("party-change-members-button");

const CUSTOM_STORAGE_KEY = "nitakuGachaCustomDilemmas";

function loadCustomItems() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCustomItems() {
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(DILEMMAS.custom.items));
}

// じぶんで作るカテゴリは他と違い、データを外部ファイル(dilemmas.js)ではなく
// localStorage(この端末だけの保存領域)から読み込む。
DILEMMAS.custom = { label: "じぶんで作る", items: loadCustomItems() };

const categoryKeys = Object.keys(DILEMMAS);
let currentCategory = categoryKeys[0];
let lastIndex = null;
let currentDilemma = null;
let chosenText = null;

let participantNames = [];
let currentTurnIndex = 0;
let partyChoices = [];

const appEl = document.getElementById("app");

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  appEl.classList.toggle("mode-active", name !== "menu");
}

document.querySelectorAll(".back-link[data-back-to]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.backTo);
  });
});

const appHeader = document.getElementById("app-header");
appHeader.addEventListener("click", () => {
  showScreen("menu");
});
appHeader.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showScreen("menu");
  }
});

const CATEGORY_ICONS = {
  teiban: "💬",
  renai: "💕",
  oshikatsu: "⭐",
  ichioku: "💰",
  school: "🏫",
  company: "💼",
  superpower: "✨",
  awkward: "😳",
  custom: "✏️",
};

const customPanel = document.getElementById("custom-panel");
const customInputA = document.getElementById("custom-input-a");
const customInputB = document.getElementById("custom-input-b");
const customInputError = document.getElementById("custom-input-error");
const customAddButton = document.getElementById("custom-add-button");
const customPlayNowButton = document.getElementById("custom-play-now-button");
const customItemList = document.getElementById("custom-item-list");
const customEmptyHint = document.getElementById("custom-empty-hint");
const customSavedHint = document.getElementById("custom-saved-hint");

function updateDrawAvailability() {
  const hasItems = DILEMMAS[currentCategory].items.length > 0;
  drawButton.disabled = !hasItems;
  partyDrawButton.disabled = !hasItems;
}

function renderCustomList() {
  customItemList.innerHTML = "";
  DILEMMAS.custom.items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "custom-item";

    const text = document.createElement("span");
    text.textContent = `${item.a} / ${item.b}`;
    li.appendChild(text);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-name-button";
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      DILEMMAS.custom.items.splice(index, 1);
      saveCustomItems();
      renderCustomList();
      updateDrawAvailability();
    });
    li.appendChild(removeButton);

    customItemList.appendChild(li);
  });
  const hasSaved = DILEMMAS.custom.items.length > 0;
  customEmptyHint.classList.toggle("hidden", hasSaved);
  customSavedHint.classList.toggle("hidden", !hasSaved);
}

function updateCustomPanel() {
  const isCustom = currentCategory === "custom";
  customPanel.classList.toggle("hidden", !isCustom);
  if (isCustom) {
    renderCustomList();
  }
}

function readCustomInput() {
  const a = customInputA.value.trim();
  const b = customInputB.value.trim();
  if (!a || !b) {
    customInputError.classList.remove("hidden");
    return null;
  }
  customInputError.classList.add("hidden");
  return { a, b };
}

customAddButton.addEventListener("click", () => {
  const dilemma = readCustomInput();
  if (!dilemma) return;
  DILEMMAS.custom.items.push(dilemma);
  saveCustomItems();
  customInputA.value = "";
  customInputB.value = "";
  renderCustomList();
  updateDrawAvailability();
});

customPlayNowButton.addEventListener("click", () => {
  const dilemma = readCustomInput();
  if (!dilemma) return;
  customInputA.value = "";
  customInputB.value = "";
  currentDilemma = dilemma;
  showScreen("solo");
  enterSoloDilemma();
  dilemmaBox.scrollIntoView({ behavior: "smooth", block: "start" });
});

function renderTabs() {
  tabsContainer.innerHTML = "";
  categoryKeys.forEach((key) => {
    const tab = document.createElement("button");
    tab.className = "category-tab";
    tab.classList.toggle("active", key === currentCategory);
    const icon = CATEGORY_ICONS[key] || "🎲";
    tab.textContent = `${icon} ${DILEMMAS[key].label}`;
    tab.addEventListener("click", () => {
      currentCategory = key;
      lastIndex = null;
      renderTabs();
      updateCustomPanel();
      updateDrawAvailability();
    });
    tabsContainer.appendChild(tab);
  });
}

function pickDilemma() {
  const items = DILEMMAS[currentCategory].items;
  if (items.length === 0) return null;
  let index;
  do {
    index = Math.floor(Math.random() * items.length);
  } while (items.length > 1 && index === lastIndex);
  lastIndex = index;
  return items[index];
}

// ソロモード

menuSoloButton.addEventListener("click", () => {
  showScreen("solo");
  showSoloPreview();
});

function showSoloPreview() {
  drawIcon.classList.remove("hidden");
  drawButton.classList.remove("hidden");
  drawHint.classList.remove("hidden");
  soloPreviewBox.classList.add("hidden");
  dilemmaBox.classList.add("hidden");
}

function drawSoloPreview() {
  currentDilemma = pickDilemma();
  if (!currentDilemma) return;
  soloPreviewA.textContent = currentDilemma.a;
  soloPreviewB.textContent = currentDilemma.b;
  drawIcon.classList.add("hidden");
  drawButton.classList.add("hidden");
  drawHint.classList.add("hidden");
  dilemmaBox.classList.add("hidden");
  soloPreviewBox.classList.remove("hidden");
}

drawButton.addEventListener("click", drawSoloPreview);
soloRerollButton.addEventListener("click", drawSoloPreview);

function enterSoloDilemma() {
  chosenText = null;

  drawIcon.classList.add("hidden");
  drawButton.classList.add("hidden");
  drawHint.classList.add("hidden");
  optionAButton.textContent = currentDilemma.a;
  optionBButton.textContent = currentDilemma.b;
  [optionAButton, optionBButton].forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("chosen", "unchosen");
  });

  reaction.classList.add("hidden");
  afterActions.classList.add("hidden");

  soloPreviewBox.classList.add("hidden");
  dilemmaBox.classList.remove("hidden");
}

soloConfirmButton.addEventListener("click", enterSoloDilemma);

function chooseSoloOption(chosenButton, unchosenButton, text) {
  chosenText = text;
  chosenButton.classList.add("chosen");
  unchosenButton.classList.add("unchosen");
  optionAButton.disabled = true;
  optionBButton.disabled = true;

  const message = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
  reaction.textContent = message;
  reaction.classList.remove("hidden");
  afterActions.classList.remove("hidden");
}

redrawButton.addEventListener("click", showSoloPreview);

optionAButton.addEventListener("click", () => {
  chooseSoloOption(optionAButton, optionBButton, currentDilemma.a);
});

optionBButton.addEventListener("click", () => {
  chooseSoloOption(optionBButton, optionAButton, currentDilemma.b);
});

shareButton.addEventListener("click", () => {
  const text = `「${currentDilemma.a} or ${currentDilemma.b}」\n私は『${chosenText}』派!あなたはどっち? #究極の二択ガチャ`;
  openShareIntent(text);
});

function openShareIntent(text) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`;
  window.open(url, "_blank");
}

// パーティーモード: メンバー登録

function addNameRow(value) {
  const row = document.createElement("div");
  row.className = "party-name-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "party-name-input";
  input.placeholder = "ニックネーム";
  input.value = value || "";
  input.maxLength = 10;

  const removeButton = document.createElement("button");
  removeButton.className = "remove-name-button";
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    row.remove();
  });

  row.appendChild(input);
  row.appendChild(removeButton);
  partyNameList.appendChild(row);
}

function resetPartySetup() {
  partyNameList.innerHTML = "";
  addNameRow("");
  addNameRow("");
  partySetupError.classList.add("hidden");
}

menuPartyButton.addEventListener("click", () => {
  resetPartySetup();
  showScreen("partySetup");
});

addNameButton.addEventListener("click", () => {
  addNameRow("");
});

function collectPartyNames() {
  return Array.from(document.querySelectorAll(".party-name-input"))
    .map((input) => input.value.trim())
    .filter((name) => name.length > 0);
}

partyStartButton.addEventListener("click", () => {
  const names = collectPartyNames();
  if (names.length < 2) {
    partySetupError.classList.remove("hidden");
    return;
  }
  participantNames = names;
  showPartyPreview();
});

// パーティーモード: お題プレビュー

function showPartyPreview() {
  showScreen("partyPreview");
  partyDrawIcon.classList.remove("hidden");
  partyDrawButton.classList.remove("hidden");
  partyDrawHint.classList.remove("hidden");
  partyPreviewBox.classList.add("hidden");
}

function drawPartyPreview() {
  currentDilemma = pickDilemma();
  if (!currentDilemma) return;
  partyPreviewA.textContent = currentDilemma.a;
  partyPreviewB.textContent = currentDilemma.b;
  partyDrawIcon.classList.add("hidden");
  partyDrawButton.classList.add("hidden");
  partyDrawHint.classList.add("hidden");
  partyPreviewBox.classList.remove("hidden");
}

partyDrawButton.addEventListener("click", drawPartyPreview);
partyRerollButton.addEventListener("click", drawPartyPreview);

partyConfirmButton.addEventListener("click", () => {
  currentTurnIndex = 0;
  partyChoices = new Array(participantNames.length).fill(null);
  showScreen("partyPlay");
  renderPartyTurn();
});

// パーティーモード: 順番に回答

function renderPartyTurn() {
  const name = participantNames[currentTurnIndex];
  turnIndicator.textContent = `${name}さんの番です`;
  partyOptionAButton.textContent = currentDilemma.a;
  partyOptionBButton.textContent = currentDilemma.b;
  [partyOptionAButton, partyOptionBButton].forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("chosen", "unchosen");
  });
}

function chooseForCurrentTurn(chosenButton, unchosenButton, text) {
  partyChoices[currentTurnIndex] = text;
  chosenButton.classList.add("chosen");
  unchosenButton.classList.add("unchosen");
  partyOptionAButton.disabled = true;
  partyOptionBButton.disabled = true;

  setTimeout(() => {
    currentTurnIndex += 1;
    if (currentTurnIndex < participantNames.length) {
      renderPartyTurn();
    } else {
      showScreen("partyReady");
    }
  }, 500);
}

partyRevealButton.addEventListener("click", showPartyResult);

partyOptionAButton.addEventListener("click", () => {
  chooseForCurrentTurn(partyOptionAButton, partyOptionBButton, currentDilemma.a);
});

partyOptionBButton.addEventListener("click", () => {
  chooseForCurrentTurn(partyOptionBButton, partyOptionAButton, currentDilemma.b);
});

// パーティーモード: 結果発表

function showPartyResult() {
  const countA = partyChoices.filter((choice) => choice === currentDilemma.a).length;
  const countB = partyChoices.filter((choice) => choice === currentDilemma.b).length;

  partyTally.textContent = `「${currentDilemma.a}」派: ${countA}人 / 「${currentDilemma.b}」派: ${countB}人`;

  partyAnswerList.innerHTML = "";
  participantNames.forEach((name, i) => {
    const li = document.createElement("li");
    li.textContent = `${name}さん: ${partyChoices[i]}`;
    partyAnswerList.appendChild(li);
  });

  showScreen("partyResult");
}

partyAgainButton.addEventListener("click", showPartyPreview);

partyChangeMembersButton.addEventListener("click", () => {
  showScreen("partySetup");
});

partyShareButton.addEventListener("click", () => {
  const countA = partyChoices.filter((choice) => choice === currentDilemma.a).length;
  const countB = partyChoices.filter((choice) => choice === currentDilemma.b).length;
  const text = `「${currentDilemma.a} or ${currentDilemma.b}」\nみんなで投票したら「${currentDilemma.a}」派 ${countA}人 / 「${currentDilemma.b}」派 ${countB}人 だった! #究極の二択ガチャ`;
  openShareIntent(text);
});

renderTabs();
updateCustomPanel();
updateDrawAvailability();
