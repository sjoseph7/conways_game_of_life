import React from "react";

import Cell from "./Cell";

export default function Grid(props) {
  const { rows, cols, cellStates, cellColors, handleSelect } = props;

  let cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `${row}_${col}`;
      const cellState = cellStates[row][col] ? "box on" : "box off";
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
