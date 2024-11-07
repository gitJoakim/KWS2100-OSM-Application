import React from "react";

interface DisplayPointCardProps {
  title: string | null;
  magnitude: number | null;
  time: number | null;
  tsunami: string | null;
}

/* very simple data component for Earthquakes */
export function DisplayPointCard({
  title,
  magnitude,
  time,
  tsunami,
}: DisplayPointCardProps) {
  function convertTime() {
    if (time != null) {
      const date = new Date(time);
      const hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
      const minute = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
      return `${hour}:${minute}  -  ${date.toLocaleDateString()}`;
    } else {
      return null;
    }
  }

  const formattedTime = convertTime();
  return (
    <div className="display-point-card" style={{ border: "4px solid white" }}>
      <h2 style={{ paddingBottom: 12, textAlign: "center" }}>{title}</h2>
      <li>
        Magnitude: <span className="end-of-line">{magnitude}</span>
      </li>
      <li>
        Time of event: <span className="end-of-line">{formattedTime}</span>
      </li>
      <li>
        Tsunami: <span className="end-of-line">{tsunami}</span>
      </li>
    </div>
  );
}
