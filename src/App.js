import React, { Component } from "react";

import Grid from "./components/Grid/Grid";

import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";

import unionFind from "./helpers/unionFind";

import "./App.css";

export default class App extends Component {
  constructor() {
    super();
    this.stepDelay = 150;
    this.rows = 16 * 2;
    this.cols = 24 * 2;

    this.colors = [
      "rgba(170,58,56,1)",
      "rgba(152,115,56,1)",
      "rgba(134,115,55,1)",
      "rgba(115,115,55,1)",
      "rgba(79,115,54,1)"
    ];

    this.highColor = [170, 58, 56];
    this.lowColor = [79, 115, 54];

    this.defaultColor = gradient(this.lowColor, this.highColor, 0); //this.colors[this.colors.length - 1];
    this.stepInterval = "";

    this.state = {
      generation: 0,
      cellStates: this.createEmptyGrid(),
      cellColors: this.createEmptyGrid()
    };
  }

  // ---- Life-Cycle Methods ---- //
  componentDidMount() {
    this.seedGrid(2);
  }

  // ---- Handlers ---- //
  handleSelect = event => {
    const { id } = event.target;
    let [row, col] = id.split("_");
    row = Number(row);
    col = Number(col);

    const cellID = getID(this.state.cellStates, row, col);
    console.log(`ID: ${cellID}`);
    console.log(`ID: ${cellID}`);

    this.setState(prevState => {
      return {
        cellStates: prevState.cellStates.map((cellStatesRow, row_index) => {
          return cellStatesRow.map((cellState, col_index) => {
            return row === row_index && col === col_index
              ? !cellState
              : cellState;
          });
        }),
        cellColors: prevState.cellColors.map((cellColorsRow, row_index) => {
          return cellColorsRow.map((cellColor, col_index) => {
            return row === row_index && col === col_index
              ? !cellColor
              : cellColor;
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

    let seededStateGrid = this.createEmptyGrid();
    let seededColorGrid = this.createEmptyGrid();

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let cellOn = Math.floor(Math.random() * odds) === 0;
        if (cellOn) {
          seededStateGrid[row][col] = true;
          seededColorGrid[row][col] = this.defaultColor;
        }
      }
    }

    this.setState({
      cellStates: seededStateGrid,
      cellColors: seededColorGrid
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

      // Stop when nothing is changing
      if (
        JSON.stringify(prevState.cellStates) === JSON.stringify(nextCellStates)
      ) {
        this.stop();
        return;
      }

      // Color code the "creatures"
      const uf = new unionFind(this.rows * this.cols + 1);
      const activeCellCoordinates = getActiveCellCoordinates(nextCellStates);
      const nextCellColors = this.createEmptyGrid();

      activeCellCoordinates.forEach(([row, col]) => {
        const neighborCoordinates = getActiveNeighborCoordinates(
          nextCellStates,
          row,
          col
        );
        neighborCoordinates.forEach(coord => {
          let [n_row, n_col] = coord;
          const id = getID(prevState.cellStates, row, col);
          const n_id = getID(prevState.cellStates, n_row, n_col);
          uf.union(id, n_id);
        });
      });

      activeCellCoordinates.forEach(([row, col]) => {
        const cellID = getID(prevState.cellStates, row, col);
        const cellRoot = uf.root(cellID);
        const sizePercent =
          (uf.segmentSize(cellRoot) / (this.rows * this.cols)) * 10;
        const selectedColor = gradient(
          this.lowColor,
          this.highColor,
          sizePercent
        );
        console.log(`${sizePercent} ==> ${selectedColor}`);

        nextCellColors[row][col] = selectedColor;
      });

      return {
        cellStates: nextCellStates,
        cellColors: nextCellColors,
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
      cellColors: this.createEmptyGrid(),
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
          cellColors={this.state.cellColors}
          handleSelect={this.handleSelect}
        />
        <h2>Generation: {this.state.generation}</h2>
      </div>
    );
  }
}

function countNeighbors(grid, cellRow, cellCol) {
  if (!grid) {
    return;
  }
  return getActiveNeighborCoordinates(grid, cellRow, cellCol).length;
}

function getActiveCellCoordinates(grid) {
  const coordGrid = grid.map((gridRow, row_index) =>
    gridRow.map((cellState, col_index) =>
      cellState ? [row_index, col_index] : false
    )
  );

  const coordArray = coordGrid.flat().filter(coord => coord !== false);
  return coordArray;
}

function getActiveNeighborCoordinates(grid, cellRow, cellCol) {
  let activeNeighborCoordinates = [];

  if (!grid) {
    return [];
  }

  const width = grid[0].length;
  const height = grid.length;
  [-1, 0, 1].forEach(row => {
    [-1, 0, 1].forEach(col => {
      // Skip self
      if (row === 0 && col === 0) {
        return;
      } else if (cellRow + row > height - 1 || cellRow + row < 0) {
        return;
      } else if (cellCol + col > width - 1 || cellCol + col < 0) {
        return;
      }
      let neighbor = grid[cellRow + row][cellCol + col];
      if (neighbor) {
        activeNeighborCoordinates.push([cellRow + row, cellCol + col]);
      }
    });
  });

  return activeNeighborCoordinates;
}

function getID(grid, cellRow, cellCol) {
  let width = grid[0].length;
  return width * cellRow + cellCol;
}

function gradient(color1, color2, percent) {
  let result = "#";
  for (let i = 0; i < 3; i++) {
    let newValue = Math.floor(map(percent, 0, 1, color1[i], color2[i]));
    newValue = Math.min(255, Math.max(0, newValue));
    result += (newValue < 16 ? "0" : "") + newValue.toString(16);
  }
  return result;
}

function map(value, from_min, from_max, to_min, to_max) {
  return (
    ((value - from_min) * (to_max - to_min)) / (from_max - from_min) + to_min
  );
}
