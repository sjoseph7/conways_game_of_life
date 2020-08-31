import React, { useEffect, useState } from "react";
import Grid from "./components/Grid";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import unionFind from "./utils/unionFind";

const ROWS = 16 * 2;
const COLS = 24 * 2;

const STEP_DELAY = 200;

/**
 * *type: [number, number, number] throws error:
 * 'Line 0:  Parsing error: Cannot read property 'map' of undefined'
 */
const LOW_COLOR = [79, 115, 54];
const HIGH_COLOR = [170, 58, 56];
const DEFAULT_COLOR = gradient(LOW_COLOR, HIGH_COLOR, 0); //this.colors[this.colors.length - 1];

const _App = () => {
  const [generation, setGeneration] = useState(0);
  const [cellStates, setCellStates] = useState(createEmptyGrid(false));
  const [cellColors, setCellColors] = useState(createEmptyGrid(""));
  const [stepInterval, setStepInterval] = useState(
    null as NodeJS.Timeout | null
  );

  // ---- Life-Cycle Methods ---- //
  useEffect(() => {
    seedGrid(2);
    // eslint-disable-next-line
  }, []);

  // ---- Handlers ---- //
  const handleSelect = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { id } = event.target as HTMLElement;
    const [row, col] = id.split("_");
    const selectedRow = parseInt(row);
    const selectedCol = parseInt(col);

    // Toggle the state of the selected cell
    setCellStates(cellStates =>
      cellStates.map((cellStatesRow: boolean[], row_index: number) => {
        return cellStatesRow.map((cellState: boolean, col_index: number) => {
          return row_index === selectedRow && col_index === selectedCol
            ? !cellState
            : cellState;
        });
      })
    );

    // Toggle the color of the selected cell
    setCellColors(cellColors =>
      cellColors.map((cellColorsRow: string[], row_index: number) => {
        return cellColorsRow.map((cellColor: string, col_index: number) => {
          return row_index === selectedRow && col_index === selectedCol
            ? cellColor
              ? ""
              : DEFAULT_COLOR
            : cellColor;
        });
      })
    );
  };

  // ---- Setup Methods ---- //
  const seedGrid = (odds: number = 2) => {
    let seededStateGrid = createEmptyGrid(false);
    let seededColorGrid = createEmptyGrid("");

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let cellOn = Math.floor(Math.random() * odds) === 0;
        if (cellOn) {
          seededStateGrid[row][col] = true;
          seededColorGrid[row][col] = DEFAULT_COLOR;
        }
      }
    }
    setCellStates(seededStateGrid);
    setCellColors(seededColorGrid);
  };

  function createEmptyGrid<T extends any>(filler: T): T[][] {
    return Array(ROWS)
      .fill(0)
      .map(() => Array(COLS).fill(filler));
  }

  // ---- Actions ---- //
  const step = () => {
    setCellStates(cellStates => {
      let nextCellStates: boolean[][] = [];
      for (let row = 0; row < ROWS; row++) {
        let nextCellStatesRow: boolean[] = [];
        for (let col = 0; col < COLS; col++) {
          let numberOfNeighbors = countNeighbors(cellStates, row, col);
          let cellState = cellStates[row][col]
            ? numberOfNeighbors === 2 || numberOfNeighbors === 3
            : numberOfNeighbors === 3;
          nextCellStatesRow.push(cellState);
        }
        nextCellStates.push(nextCellStatesRow);
      }

      // Stop when nothing is changing
      if (JSON.stringify(cellStates) === JSON.stringify(nextCellStates)) {
        stop();
        return cellStates;
      }

      // Color code the groups of cells
      const uf = new unionFind(ROWS * COLS + 1);
      const activeCellCoordinates = getActiveCellCoordinates(nextCellStates);
      const nextCellColors = createEmptyGrid("");

      activeCellCoordinates.forEach(([row, col]: number[]) => {
        const neighborCoordinates = getActiveNeighborCoordinates(
          nextCellStates,
          row,
          col
        );
        neighborCoordinates.forEach(coord => {
          let [n_row, n_col] = coord;
          const id = getID(cellStates, row, col);
          const n_id = getID(cellStates, n_row, n_col);
          uf.union(id, n_id);
        });
      });

      activeCellCoordinates.forEach(([row, col]: number[]) => {
        const cellID = getID(cellStates, row, col);
        const cellRoot = uf.root(cellID);
        const sizePercent = (uf.segmentSize(cellRoot) / (ROWS * COLS)) * 10;
        const selectedColor = gradient(LOW_COLOR, HIGH_COLOR, sizePercent);

        nextCellColors[row][col] = selectedColor;
      });

      setCellColors(nextCellColors);
      setGeneration(generation => generation + 1);
      setStepInterval(stepInterval => stepInterval);

      return nextCellStates;
    });
  };

  const run = () => {
    stepInterval && clearInterval(stepInterval);
    setStepInterval(setInterval(step, STEP_DELAY));
  };

  const stop = () => {
    if (stepInterval) {
      clearInterval(stepInterval);
      setStepInterval(null);
    }
  };

  const reset = () => {
    stepInterval && clearInterval(stepInterval);

    setGeneration(0);
    setCellStates(createEmptyGrid(false));
    setCellColors(createEmptyGrid(""));
    setStepInterval(null);
  };

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
          onClick={() => seedGrid()}
        >
          Seed
        </Button>
        <Button
          style={{ margin: "5px" }}
          variant="primary"
          onClick={step}
          disabled={!!stepInterval}
        >
          Step
        </Button>
        <Button
          style={{ margin: "5px" }}
          variant="success"
          onClick={run}
          disabled={!!stepInterval}
        >
          Run
        </Button>
        <Button
          style={{ margin: "5px" }}
          variant="danger"
          onClick={stop}
          disabled={!stepInterval}
        >
          Stop
        </Button>
        <Button style={{ margin: "5px" }} variant="secondary" onClick={reset}>
          Reset
        </Button>
      </ButtonToolbar>
      <Grid
        rows={ROWS}
        cols={COLS}
        cellStates={cellStates}
        cellColors={cellColors}
        handleSelect={handleSelect}
      />
      <h2>Generation: {generation}</h2>
    </div>
  );
};

export default _App;

function countNeighbors(grid: boolean[][], cellRow: number, cellCol: number) {
  if (!grid) {
    return;
  }
  return getActiveNeighborCoordinates(grid, cellRow, cellCol).length;
}

function getActiveCellCoordinates(grid: boolean[][]) {
  const coordGrid = grid.map((gridRow: boolean[], row_index: number) =>
    gridRow.map((cellState: boolean, col_index: number): number[] | false =>
      cellState ? [row_index, col_index] : false
    )
  );

  const coordArray = coordGrid
    .flat()
    .filter((coord): coord is number[] => coord !== false);
  return coordArray;
}

function getActiveNeighborCoordinates(
  grid: boolean[][],
  cellRow: number,
  cellCol: number
) {
  let activeNeighborCoordinates: number[][] = [];

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

function getID(grid: boolean[][], cellRow: number, cellCol: number) {
  let width = grid[0].length;
  return width * cellRow + cellCol;
}

function gradient(color1: number[], color2: number[], percent: number) {
  let result = "#";
  for (let i = 0; i < 3; i++) {
    let newValue = Math.floor(map(percent, 0, 1, color1[i], color2[i]));
    newValue = Math.min(255, Math.max(0, newValue));
    result += (newValue < 16 ? "0" : "") + newValue.toString(16);
  }
  return result;
}

function map(
  value: number,
  from_min: number,
  from_max: number,
  to_min: number,
  to_max: number
) {
  return (
    ((value - from_min) * (to_max - to_min)) / (from_max - from_min) + to_min
  );
}
