import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import './square.css';
import './board.css';
import './game.css';
import './counters.css'


class Square extends React.Component {
  // onClickSquare(e) {
  //   console.log('onClickSquare');
  //   console.log(e);
  // }

  render() {
    let classList = ['square'];

    if (this.props.isWin) {
      classList.push('square--win');
    }

    return (
      <button
        className = {classList.join(' ')}
        onClick = {this.props.onClick}
      >
        <span className = {this.props.value ? 'square__value' : ''}>
          {this.props.value}
        </span>
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key = {i}
        value = {this.props.squares[i]}
        isWin = {this.props.winSquares.indexOf(i) > -1 ? true : false}
        onClick = {() => this.props.onClick(i)}
      />
    );
  }

  renderBoard() {
    let board = [];
    let number = 0;

    for (let i = 0; i < 3; i++) {
      let boardRow = [];

      for (let j = 0; j < 3; j++) {
        boardRow.push(this.renderSquare(number));
        number++;
      }

      board.push(
        <div className='board__row' key={i}>
          {boardRow}
        </div>
      );
    }

    return (
      board
    );
  }

  // onClickBoard(e) {
  //   console.log('onClickBoard');
  //   console.dir(e.target);
  // }

  render() {
    return (
      <div 
        className={'board'}
      >
        {this.renderBoard()}
      </div>
    );
  }
}

class Counters extends React.Component {
  render() {
    let counters = this.props.counters;
    
    return (
      <div className='counters'>
        <div className='counters-colum'>
          <div className='counters-title'>O</div>
          <div className='counters-value'>{counters.human}</div>
        </div>
        <div className='counters-colum'>
          <div className='counters-title'>Ничья</div>
          <div className='counters-value'>{counters.draw}</div>
        </div>
        <div className='counters-colum'>
          <div className='counters-title'>X</div>
          <div className='counters-value'>{counters.ai}</div>
        </div>
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {squares: Array(9).fill(null)}
      ],
       counters: {
        human: 0,
        ai: 0,
        draw: 0
      },
      stepNumber: 0,
      xIsNext: Math.random() < 0.5,
      isEndGame: false,
      winSquares: Array(3).fill(null)
    };
  }

  componentDidMount() {
    this.aiPlayer();
  }

  newGame() {
    console.log('newGame', this);

    if (!this.state.isEndGame) {
      return
    }

    this.setState({
      history: [
        {squares: Array(9).fill(null)}
      ],
      stepNumber: 0,
      xIsNext: Math.random() < 0.5,
      isEndGame: false,
      winSquares: Array(3).fill(null)
    },
      this.aiPlayer);
  }

  endGame(winner) {
    console.log('endGame: ', winner);
    let counters = this.state.counters;

    if (winner.win === 'X') {
      counters.ai ++
    }

    if (winner.win === 'O') {
      counters.human ++
    }

    if (winner.win === 'draw') {
      counters.draw ++
    }

    this.setState({
      isEndGame: true,
      counters,
      winSquares: winner.winSquares
    });
  }

  aiPlayer() {
    if (this.state.xIsNext) {
      let squares = this.state.history[this.state.stepNumber].squares;

      let move = Math.random() < 0.8 ? findBestMove(squares, 'X').index : findRandomMove(squares);

      console.log('aiPlayer: ', move);
      this.move(move);
    }
  }

  move(i) {
    console.log('move', this); 
    console.log(this.state.xIsNext ? 'X' : 'O', i);
    
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (this.state.isEndGame || squares[i]) {
      return;
    }
    
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    },
      this.aiPlayer
    );

    let winner = calculateWinner(squares);

    if (winner.win) {
      this.endGame(winner);
      return;
    }

    if (emptyIndices(squares).length === 0) {
      this.endGame({
        win: 'draw',
        winSquares: [null, null, null]
      });
      return;
    }
  }

  // onClickGame(e) {
  //   console.log('onClickGame');
  //   console.dir(e.target);
  // }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const counters = this.state.counters;

    return (
      <div className='game'>
        <div className='game__title'>Крестики-Нолики</div>

        <div className='game__board'>
          <Board 
            squares = {current.squares}
            winSquares = {this.state.winSquares}
            onClick = {this.move.bind(this)} // или onClick = {(i) => this.move(i)}
          />
        </div>
        
        <div className='game__counters'>
          <Counters 
            isActive = {this.state.isEndGame}
            counters = {counters}
          />
        </div>

        <button
          className='game__new-game'
          onClick={() => this.newGame()}
          disabled = {!this.state.isEndGame}
        >
          Новая игра
        </button>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


// Расчет победителя
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        win: squares[a],
        winSquares: lines[i]
      };
    }
  }

  return {
    win: null,
    winSquares: [null, null, null]
  };
}

// Поиск пустых клеток
function emptyIndices(square) {
  let empty = [];

  for (let i = 0; i < square.length; i++) {
    if (square[i] === null) {
      empty.push(i);
    }
  }

  return empty;
}

// Поиск лучшего хода
function findBestMove(square, player) {
  let availSpots = emptyIndices(square);
  let winner = calculateWinner(square);

  if (winner.win === 'O') {
    return {score: -1};
  } 
  else if (winner.win === 'X') {
    return {score: 1};
  } 
  else if (availSpots.length === 0) {
    return {score: 0};
  }

  let moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = availSpots[i];

    square[availSpots[i]] = player;

    if (player === 'X') {
      let result = findBestMove(square, 'O');
      move.score = result.score;
      
    } 
    else {
      let result = findBestMove(square, 'X');
      move.score = result.score;
    }

    square[availSpots[i]] = null;
    moves.push(move);
  }

  let bestMove;
  // если это ход ИИ, пройти циклом по ходам и выбрать ход с наибольшим количеством очков
  if (player === 'X') { 
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  // иначе пройти циклом по ходам и выбрать ход с наименьшим количеством очков
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

// Поиск случайного хода
function findRandomMove(square) {
  let availSpots = emptyIndices(square);
  let randomIndex = Math.floor(Math.random() * availSpots.length);
  randomIndex = availSpots[randomIndex];

  return randomIndex;
}