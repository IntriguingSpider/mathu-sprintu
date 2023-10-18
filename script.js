// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

//Refresh Splash Page Best Scores
const bestScoresToDOM = function () {
  bestScores.forEach((bestScore, i) => {
    bestScore.textContent = `${bestScoreArray[i].bestScore}s`;
  });
};

//Check local storage for best scores and set best score array values
const getSavedBestScores = function () {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
};

//Update Best Score Array
const updateBestScore = function () {
  bestScoreArray.forEach((score, i) => {
    if (questionAmount == score.questions) {
      const savedBestScore = Number(bestScoreArray[i].bestScore);
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[i].bestScore = finalTimeDisplay;
      }
    }
  });
  bestScoresToDOM();
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
};

//Reset Game
const playAgain = function () {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
};

//Show Score Page
const showScorePage = function () {
  //Show Play Again Button After One Second
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
};

//Format & Display Time in DOM
const scoresToDOM = function () {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  //Scroll To Top and Go to ScorePage
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
};

//Stop Timer and Process Results
const checkTime = function () {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    //Check for wrong scores add penalty time
    console.log('playerGuessArray', playerGuessArray);
    equationsArray.forEach((equation, i) => {
      if (!(equation.evaluated === playerGuessArray[i])) {
        penaltyTime += 0.5;
      }
    });
    console.log('penaltyTime', penaltyTime);
    finalTime = timePlayed + penaltyTime;
    console.log(finalTime);
    scoresToDOM();
  }
};

//Add a 10th of a second to time played
const addTime = function () {
  timePlayed += 0.1;
  checkTime();
};

//Start Timer when game page is clicked
const startTimer = function () {
  //Reset Times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
};

//Scroll and Store User Selection in playerGuessArray
const select = function (guessedTrue) {
  //Scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  //Add player guess to Array
  return guessedTrue
    ? playerGuessArray.push('true')
    : playerGuessArray.push('false');
};

// Displays Game Page
const showGamePage = function () {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

//Get Random Number up to a Max Number
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  console.log('correctEquations', correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log('wrongEquations', wrongEquations);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

//Add Equations to DOM
const equationsToDOM = function () {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    //Equation Text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    //Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
};

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

//Displays 3, 2, 1, GO!
const countdownStart = function () {
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = 'Go!';
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
};

//Navigate From Splash Page to Countdown Page
const showCountdown = function () {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  populateGamePage();

  countdownStart();
};

//Get Value from Selected Radio Button
const getRadioValue = function () {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    {
      if (radioInput.checked) {
        radioValue = radioInput.value;
      }
    }
  });
  return radioValue;
};

//Form that decides amount of questions
const selectQuestionAmount = function (e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log('questionAmount', questionAmount);
  if (questionAmount) {
    showCountdown();
  }
};

//

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    //Remove Selected Label Styling
    radioEl.classList.remove('selected-label');
    //Add it back if the radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
});

//Event Listeners
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

//On Load
getSavedBestScores();
