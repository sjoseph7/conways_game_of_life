import React, { Component } from "react";

import Grid from "./components/Grid/Grid";

import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";

import "./App.css";

export default class App extends Component {
  constructor() {
    super();
    this.stepDelay = 150;
    this.rows = 16;
    this.cols = 24;

    this.stepInterval = "";

    this.state = {
      generation: 0,
      cellStates: Array(this.rows)
        .fill()
        .map(() => Array(this.cols).fill(false))
    };
  }

  // ---- Life-Cycle Methods ---- //
  componentDidMount() {
    this.seedGrid(4);
  }

  // ---- Handlers ---- //
  handleSelect = event => {
    const { id } = event.target;
    let [row, col] = id.split("_");
    row = Number(row);
    col = Number(col);

    this.setState(prevState => {
      return {
        cellStates: prevState.cellStates.map((cellStatesRow, row_index) => {
          return cellStatesRow.map((cellState, col_index) => {
            return row === row_index && col === col_index
              ? !cellState
              : cellState;
          });
        })
      };
    });
  };

  // ---- Setup Methods ---- //
  seedGrid = odds => {
    let defaultOdds = 2;
    if (!odds || typeof odds !== "number") {
      odds = defaultOdds;
    }
    console.log(odds);

    let seededGrid = this.createEmptyGrid();

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let cellOn = Math.floor(Math.random() * odds) === 0;
        if (cellOn) seededGrid[row][col] = true;
      }
    }

    this.setState({
      cellStates: seededGrid
    });
  };

  createEmptyGrid = () => {
    return Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
  };

  // ---- Actions ---- //
  step = () => {
    this.setState(prevState => {
      let nextCellStates = [];
      for (let row = 0; row < this.rows; row++) {
        let nextCellStatesRow = [];
        for (let col = 0; col < this.cols; col++) {
          let numberOfNeighbors = countNeighbors(
            prevState.cellStates,
            row,
            col
          );
          let cellState = prevState.cellStates[row][col]
            ? numberOfNeighbors === 2 || numberOfNeighbors === 3
            : numberOfNeighbors === 3;
          nextCellStatesRow.push(cellState);
        }
        nextCellStates.push(nextCellStatesRow);
      }
      if (
        JSON.stringify(prevState.cellStates) === JSON.stringify(nextCellStates)
      ) {
        console.log("!!!");
        this.stop();
        return;
      }
      return {
        cellStates: nextCellStates,
        generation: (prevState.generation += 1)
      };
    });
  };

  run = () => {
    this.stop();
    this.stepInterval = setInterval(this.step, this.stepDelay);
  };

  stop = () => {
    clearInterval(this.stepInterval);
  };

  reset = () => {
    this.setState({
      cellStates: this.createEmptyGrid(),
      generation: 0
    });
  };

  render() {
    return (
      <div className="center">
        <h1>
          Conway's
          <br />
          Game of Life
        </h1>
        <ButtonToolbar style={{ textAlign: "center" }} className="center">
          <Button
            style={{ margin: "5px" }}
            variant="warning"
            onClick={this.seedGrid}
          >
            Seed
          </Button>
          <Button
            style={{ margin: "5px" }}
            variant="primary"
            onClick={this.step}
          >
            Step
          </Button>
          <Button
            style={{ margin: "5px" }}
            variant="success"
            onClick={this.run}
          >
            Run
          </Button>
          <Button
            style={{ margin: "5px" }}
            variant="danger"
            onClick={this.stop}
          >
            Stop
          </Button>
          <Button
            style={{ margin: "5px" }}
            variant="secondary"
            onClick={this.reset}
          >
            Reset
          </Button>
        </ButtonToolbar>
        <Grid
          rows={this.rows}
          cols={this.cols}
          cellStates={this.state.cellStates}
          handleSelect={this.handleSelect}
        />
        <h2>Generation: {this.state.generation}</h2>
      </div>
    );
  }
}

function countNeighbors(cellStates, cellRow, cellCol) {
  let numberOfNeighbors = 0;
  if (!cellStates) {
    return;
  }
  let width = cellStates[0].length - 1;
  let height = cellStates.length - 1;
  [-1, 0, 1].forEach(row => {
    [-1, 0, 1].forEach(col => {
      // Skip self
      if (row === 0 && col === 0) {
        return;
      } else if (cellRow + row > height || cellRow + row < 0) {
        return;
      } else if (cellCol + col > width || cellCol + col < 0) {
        return;
      }

      if (cellStates[cellRow + row][cellCol + col]) {
        numberOfNeighbors += 1;
      }
    });
  });

  return numberOfNeighbors;
}
