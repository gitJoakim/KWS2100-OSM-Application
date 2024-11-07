import React from "react";

interface EmptyDataCardProps {
  title: string;
  type: string;
}

export function EmptyDataCard({ title, type }: EmptyDataCardProps) {
  return (
    <div className="display-point-card" style={{ textAlign: "center" }}>
      <h2 style={{ paddingBottom: 12 }}>{title}</h2>
      <p>
        Currently no {type} feature selected.
        <br />
        Click on a {type} feature on the map to view the data here.
      </p>
      <br />
      <p>Tip: Zoom in to decluster the datapoints.</p>
    </div>
  );
}
