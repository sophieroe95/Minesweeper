  const refreshButton = document.querySelector('.refresh-button')
  let timer = document.getElementById('timer')
  let toggleBtn = document.getElementById('toggle')
  let watch = new Stopwatch(timer)
  const listOfRules = document.querySelector('.article')
  const showRules = document.querySelector(".rules");
  const grid = document.querySelector('.grid')
  const flagsLeft = document.querySelector('#flags-left')
  const result = document.querySelector('#result')
  let width = 10
  let bombAmount = 10
  let flags = 0
  let squares = []
  let isGameOver = false

  //reset page button
  refreshButton.addEventListener('click', () => {
    location.reload();
  });

  //start game and start/pause clock
  function start() {
    grid.style.display = 'flex';
    toggleBtn.textContent = 'Pause';
    watch.start();
  }

  function stop() {
    toggleBtn.textContent = 'Start';
    watch.stop();
  }

  toggleBtn.addEventListener('click', function () {
    watch.isOn ? stop() : start();
  });

  function Stopwatch(elem) {
    let time = 0;
    let offset;
    let interval;

    function update() {
      if (this.isOn) {
        time += delta();
      }

      elem.textContent = timeFormatter(time);
    }

    function delta() {
      let now = Date.now();
      let timePassed = now - offset;

      offset = now;

      return timePassed;
    }

    function timeFormatter(time) {
      time = new Date(time);

      let minutes = time.getMinutes().toString();
      let seconds = time.getSeconds().toString();

      if (minutes.length < 2) {
        minutes = '0' + minutes;
      }

      while (seconds.length < 2) {
        seconds = '0' + seconds;
      }

      return ' ' + minutes + ':' + seconds;
    }

    this.start = function () {
      interval = setInterval(update.bind(this), 10);
      offset = Date.now();
      this.isOn = true;
    };

    this.stop = function () {
      clearInterval(interval);
      interval = null;
      this.isOn = false;
    };
    this.isOn = false;
  }

  // show/hide rules
  showRules.addEventListener("click", function showText() {
    listOfRules.style.display = 'flex';
  });

  showRules.addEventListener("dblclick", function hideText() {
    listOfRules.style.display = 'none';
  });

  //create game board
  function createBoard() {
    flagsLeft.innerHTML = bombAmount

    //get shuffled game array with random bombs
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', i);
      square.classList.add(shuffledArray[i]);
      grid.appendChild(square);
      squares.push(square);

      //normal click
      square.addEventListener('click', function (e) {
        click(square);
      });

      //cntrl and left click
      square.oncontextmenu = function (e) {
        e.preventDefault();
        addFlag(square);
      }
    }

    //add numbers
    for (let i = 0; i < squares.length; i++) {
      let total = 0;
      const isLeftEdge = (i % width === 0);
      const isRightEdge = (i % width === width - 1);

      if (squares[i].classList.contains('valid')) {
        // west, north-east, north, north-west, east, south-west, south-east, south
        if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
        if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++;
        if (i > 9 && squares[i - width].classList.contains('bomb')) total++;
        if (i > 10 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;
        if (i < 99 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
        if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
        if (i < 89 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
        if (i < 90 && squares[i + width].classList.contains('bomb')) total++;
        squares[i].setAttribute('data', total);
      }
    }
  }
  createBoard()

  //add Flag with right click
  function addFlag(square) {
    if (isGameOver) return;
    if (!square.classList.contains('checked') && (flags <= bombAmount)) {
      if (!square.classList.contains('flag')) {
        square.classList.add('flag');
        square.innerHTML = ' 🚩';
        flags++;
        flagsLeft.innerHTML = bombAmount - flags;
        checkForWin();


      } else {
        square.classList.remove('flag');
        square.innerHTML = '';
        flags--;
        flagsLeft.innerHTML = bombAmount - flags;
      }
    }
  }

  //click on square actions
  function click(square) {
    let currentId = square.id;
    if (isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;
    if (square.classList.contains('bomb')) {
      gameOver(square);
    } else {
      let total = square.getAttribute('data');
      if (total != 0) {
        square.classList.add('checked');
        if (total == 1) square.classList.add('one');
        if (total == 2) square.classList.add('two');
        if (total == 3) square.classList.add('three');
        if (total == 4) square.classList.add('four');
        square.innerHTML = total;
        return;
      }
      checkSquare(square, currentId);
    }
    square.classList.add('checked');
  }


  //check neighboring squares once square is clicked
  function checkSquare(square, currentId) {
    const isLeftEdge = (currentId % width === 0);
    const isRightEdge = (currentId % width === width - 1);
    // west, north-east, north, north-west, east, south-west, south-east, south
    setTimeout(() => {
      if (currentId > 0 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 9 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1 - width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 9) {
        const newId = squares[parseInt(currentId - width)].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 10 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1 - width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 99 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 90 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1 + width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 89 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1 + width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 90) {
        const newId = squares[parseInt(currentId) + width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
    }, 10);
  }

  //game over
  function gameOver(square) {
    result.innerHTML = 'BOOM! Game Over!';
    isGameOver = true;

    //show ALL the bombs
    squares.forEach(square => {
      if (square.classList.contains('bomb')) {
        square.innerHTML = '💣';
        square.classList.remove('bomb');
        square.classList.add('checked');
      }
    })
  }

  //check for win
  function checkForWin() {
    ///simplified win argument
    let matches = 0;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
        matches++;
      }
      if (matches === bombAmount) {
        result.innerHTML = 'YOU WIN!';
        isGameOver = true;
      }
    }
  }

// code adapted from https://github.com/kubowania/minesweeper and https://gist.github.com/anonymous/fe5cdd7e9cd14fea796b27d19f8d1cb6