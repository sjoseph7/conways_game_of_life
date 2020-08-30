import React from "react";

export default function Cell(props) {
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
