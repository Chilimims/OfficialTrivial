const inputEl = document.querySelector("#autocomplete-input");

inputEl.addEventListener("input", onInputChange);

let count = 0;
let gameEnded = false;
let players = [];
let QandA = [];
let currentGuessIndex = 0;
let originalElements = {};
let originalElements2 = {};

const question = document.getElementById("questiontext");
const questiontext = question.textContent;
const questionlength = questiontext.length;
console.log(questionlength);
if (questionlength > 145) {
  question.style.fontSize = "20px";
}

function fetchData() {
  const fetchPlayers = fetch('players.json').then(response => response.json());
  const fetchQuestions = fetch('QandA.json').then(response => response.json());

  Promise.all([fetchPlayers, fetchQuestions])
    .then(results => {
      const [playersData, questionsData] = results;
      players = playersData.players;
      QandA = questionsData.QandA;
      displayQuestion();
    })
    .catch(error => console.error('Error fetching data:', error));
}

const player = players.map((playername) => {
  return playername.name;
})

let currentQuestionIndex = 0;
let correctAnswer;

function displayQuestion() {
  currentQuestionIndex = Math.floor(Math.random() * QandA.length);
  document.getElementById('questiontext').innerText = QandA[currentQuestionIndex].question;
  correctAnswer = QandA[currentQuestionIndex].answer;
}

function onInputChange() {
  if (gameEnded) return;

  inputEl.placeholder = "";
  removeAutocompleteDropdown();

  const value = inputEl.value.toLowerCase();
  
  if (value.length === 0) return;

  const filteredNames = [];

  players.forEach((player) => {
    if (player.toLowerCase().includes(value, 0)) {
      filteredNames.push(player);
    }
  })

  createAutocompleteDropdown(filteredNames);
}

function createAutocompleteDropdown(list) {
  if (gameEnded) return;

  const listEl = document.createElement("ul");
  listEl.className = "autocomplete-list";
  listEl.id = "autocomplete-list";

  list.forEach((playername) => {
    const listItem = document.createElement("li");

    const playerButton = document.createElement("button");
    playerButton.innerHTML = playername;
    playerButton.addEventListener("click", onButtonClick);
    if (count < 8) {
      listItem.appendChild(playerButton);
      listEl.appendChild(listItem);
      count++;
    }
  })

  document.querySelector("#wrapper").appendChild(listEl);
}

function removeAutocompleteDropdown() {
  const listEl = document.querySelector("#autocomplete-list");
  if (listEl) listEl.remove();
  count = 0;
}

function onButtonClick(e) {
  e.preventDefault();

  const buttonEl = e.target;
  inputEl.value = buttonEl.innerHTML;
  removeAutocompleteDropdown();
  checkAnswer(e);
  inputEl.value = "";  
}

function createBox() {
  if (gameEnded) return;

  currentGuessIndex++;
  const answer = document.getElementById("autocomplete-input");
  const answertext = answer.value;

  const correct = document.createElement("p");
  correct.className = "correct";
  correct.id = "correct" + currentGuessIndex;
  correct.innerHTML = answertext;
  inputEl.focus();
  const oldDiv = document.getElementById('guessboxes' + currentGuessIndex);

  originalElements[currentGuessIndex] = oldDiv.cloneNode(true);

  oldDiv.parentNode.replaceChild(correct, oldDiv);

  gameEnded = true;
  inputEl.disabled = true;
}

function createBox2() {
  if (gameEnded) return;

  currentGuessIndex++;
  const answer2 = document.getElementById("autocomplete-input");
  const answertext2 = answer2.value;

  const wrong = document.createElement("p");
  wrong.className = "wrong";
  wrong.id = "wrong" + currentGuessIndex;
  wrong.innerHTML = answertext2;
  inputEl.focus();
  const oldDiv = document.getElementById('guessboxes' + currentGuessIndex);

  originalElements2[currentGuessIndex] = oldDiv.cloneNode(true);

  oldDiv.parentNode.replaceChild(wrong, oldDiv);

  if (currentGuessIndex >= 6) {
    gameEnded = true;
    inputEl.disabled = true;
    const failbox = document.getElementById('failbox');
    failbox.style.visibility = 'visible';
  }
}

function checkAnswer(d) {
  d.preventDefault();

  if (gameEnded) return;

  const guess = document.getElementById("autocomplete-input");
  const guesstext = guess.value;
  if (players.includes(guesstext)) {
    if (guesstext.toLowerCase() === correctAnswer.toLowerCase()) {
      const correctbox = document.getElementById('correctbox');
      createBox();
      correctbox.style.visibility = 'visible';

      const nextButton = document.getElementById("questionContainer");
      nextButton.style.visibility = 'visible';
      document.head.appendChild(style);
    } else {
      createBox2();
    }
  } else {
    inputEl.value = "";
    inputEl.placeholder = "Invalid player name";
    inputEl.classList.add("invalid-placeholder");
  }
}

const form = document.getElementById("form");
form.addEventListener("submit", checkAnswer);

const style = document.createElement("style");
style.innerHTML = `
  .invalid-placeholder::placeholder {
    color: red;
    font-style: oblique;
    opacity: 75%;
  }
`;
document.head.appendChild(style);

function nextRound() {
  correctbox.style.visibility = 'hidden';
  const nextButton = document.getElementById("questionContainer");
  nextButton.style.visibility = 'hidden';

  for (let i = 1; i <= currentGuessIndex; i++) {
    const correctElement = document.getElementById('correct' + i);
    if (correctElement) {
      const parent = correctElement.parentNode;
      if (originalElements[i]) {
        parent.replaceChild(originalElements[i], correctElement);
      }
    }
  }

  for (let i = 1; i <= currentGuessIndex; i++) {
    const wrongElement = document.getElementById('wrong' + i);
    if (wrongElement) {
      const parent = wrongElement.parentNode;
      if (originalElements2[i]) {
        parent.replaceChild(originalElements2[i], wrongElement);
      }
    }
  }

  const failbox = document.getElementById('failbox');
  failbox.style.visibility = 'hidden';

  displayQuestion();

  // Reset game state
  gameEnded = false;
  currentGuessIndex = 0;
  inputEl.disabled = false;
  inputEl.value = '';
  inputEl.focus();
}

window.onload = fetchData;