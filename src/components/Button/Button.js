import React from "react";

export default function Button(props) {
  const { name } = props;

  return (
    <div>
      <button>{name}</button>
    </div>
  );
}
