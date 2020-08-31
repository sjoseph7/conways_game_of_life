import React from "react";

export type CellState = "box on" | "box off";
interface CellProps {
  id: string;
  cellState: CellState;
  cellColor: string | undefined;
  handleSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default function Cell(props: CellProps) {
  const { id, cellState, cellColor, handleSelect } = props;
  return (
    <div
      id={id}
      style={{ backgroundColor: cellColor }}
      className={cellState}
      onClick={handleSelect}
    ></div>
  );
}
