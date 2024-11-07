import React from "react";
interface ColorScale {
  color: string;
  label: string;
}

interface Props {
  title: string;
  scale: ColorScale[];
}

function PointColorInfo({ scale, title }: Props) {
  return (
    <div className="color-info-card">
      <h3>{title}</h3>
      <div className="color-row">
        {scale.map((range) => (
          <div key={range.color}>
            <div
              className="color-box"
              style={{ backgroundColor: range.color }}
            ></div>
            <p>{range.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PointColorInfo;
