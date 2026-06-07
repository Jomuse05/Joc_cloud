const GAME_SECONDS = 10;
const RANKING_KEY = "click-game-ranking";

const API_URL = "https://api-ranking-gddv-arcva6h0aqfybycz.spaincentral-01.azurewebsites.net/api/manageranking";
const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const endScreen = document.querySelector("#end-screen");
const startForm = document.querySelector("#start-form");
const playerNameInput = document.querySelector("#player-name");
const timerElement = document.querySelector("#timer");
const clickCountElement = document.querySelector("#click-count");
const clickButton = document.querySelector("#click-button");
const finalScore = document.querySelector("#final-score");
const rankingList = document.querySelector("#ranking-list");
const playAgainButton = document.querySelector("#play-again");

let playerName = "";
let clicks = 0;
let secondsLeft = GAME_SECONDS;
let timerId = null;

startForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }

  playerName = name;
  startGame();
});

clickButton.addEventListener("click", () => {
  clicks += 1;
  clickCountElement.textContent = clicks;
});

playAgainButton.addEventListener("click", () => {
  clicks = 0;
  secondsLeft = GAME_SECONDS;
  playerNameInput.value = "";
  showScreen(startScreen);
  playerNameInput.focus();
});

function startGame() {
  document.getElementById("bg-music").play();
  clicks = 0;
  secondsLeft = GAME_SECONDS;
  clickCountElement.textContent = "0";
  timerElement.textContent = formatTime(secondsLeft);
  showScreen(gameScreen);

  clearInterval(timerId);
  timerId = setInterval(() => {
    secondsLeft -= 1;
    timerElement.textContent = formatTime(secondsLeft);

    if (secondsLeft <= 0) {
      finishGame();
    }
  }, 1000);
}

async function finishGame() {
  clearInterval(timerId);
  timerId = null;

  await saveScore(playerName, clicks);
  finalScore.textContent = `${playerName}, has hecho ${clicks} clicks.`;
  await renderRanking();
  
  showScreen(endScreen);
}

function showScreen(screenToShow) {
  [startScreen, gameScreen, endScreen].forEach((screen) => {
    screen.classList.toggle("hidden", screen !== screenToShow);
  });
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function getRanking() {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Error a la xarxa");
    return await response.json();
  } catch (error) {
    console.error("Error carregant el rànquing:", error);
    return []; // Si falla, retorna una llista buida
  }
}

async function saveScore(name, score) {
  try {
    await fetch(`${API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score })
    });
  } catch (error) {
    console.error("Error desant la puntuació:", error);
  }
}

async function renderRanking() {
  rankingList.innerHTML = "<li>Cargando puntuaciones...</li>"; // Missatge de càrrega
  
  const ranking = await getRanking(); // Crida a la base de dades
  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "ranking-empty";
    emptyMessage.textContent = "Todavía no hay puntuaciones.";
    rankingList.after(emptyMessage);
    return;
  }

  ranking.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${escapeHtml(entry.name)}</span><span class="score">${entry.score}</span>`;
    rankingList.appendChild(item);
  });
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}
