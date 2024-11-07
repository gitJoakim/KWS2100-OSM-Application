import React from "react";

interface DisplayPointCardProps {
  VolcanoName: string | null;
  ExplosivityIndexMax: number | null;
  StartDate: string | null;
  EndDate: string | null;
}

/* Simple datacomponent for Volcanos */
export function DisplayVolcanoCard({
  VolcanoName,
  ExplosivityIndexMax,
  StartDate,
  EndDate,
}: DisplayPointCardProps) {
  function convertStringToDate(dateString: string | null) {
    if (!dateString || dateString.length !== 8) {
      return null;
    }

    // cuts string date into day month year
    const year = parseInt(dateString.slice(0, 4));
    const month = parseInt(dateString.slice(4, 6));
    const day = parseInt(dateString.slice(6, 8));

    return `${day}.${month}.${year}`;
  }

  const formattedStartDate = convertStringToDate(StartDate);
  const formattedEndDate = convertStringToDate(EndDate);
  return (
    <div className="display-point-card" style={{ border: "4px solid white" }}>
      <h2 style={{ paddingBottom: 12, textAlign: "center" }}>
        Volcanic Eruption
      </h2>
      <li>
        Name: <span className="end-of-line">{VolcanoName}</span>
      </li>
      <li>
        Max Explosivity Index:{" "}
        <span className="end-of-line">{ExplosivityIndexMax}</span>
      </li>
      <li>
        Start date: <span className="end-of-line">{formattedStartDate}</span>
      </li>
      <li>
        End date: <span className="end-of-line">{formattedEndDate}</span>
      </li>
    </div>
  );
}
