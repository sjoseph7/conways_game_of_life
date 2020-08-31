import React from "react";
import Cell from "./Cell";

interface GridProps {
  rows: number;
  cols: number;
  cellStates: boolean[][];
  cellColors: string[][];
  handleSelect: Function;
}

export default function Grid(props: GridProps) {
  const { rows, cols, cellStates, cellColors, handleSelect } = props;

  let cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `${row}_${col}`;
      const cellState = cellStates[row][col] ? "box on" : "box off"; // CSS classes
      const cellColor = cellColors[row][col] || undefined;

      cells.push(
        <Cell
          key={id}
          id={id}
          cellState={cellState}
          cellColor={cellColor}
          handleSelect={handleSelect}
        />
      );
    }
  }

  return (
    <div className="grid" style={{ width: cols * 14 + 1 }}>
      {cells}
    </div>
  );
}
