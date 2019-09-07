import React from "react";

export default function Cell(props) {
  const { id, cellState, handleSelect } = props;
  return <div id={id} className={cellState} onClick={handleSelect}></div>;
}
