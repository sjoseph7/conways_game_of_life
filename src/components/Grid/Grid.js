import React from "react";

import Cell from "../Cell/Cell";

export default function Grid(props) {
  const { rows, cols, cellStates, handleSelect } = props;

  let cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let id = `${row}_${col}`;
      let cellState = cellStates[row][col] ? "box on" : "box off";
      cells.push(
        <Cell
          key={id}
          id={id}
          cellState={cellState}
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
