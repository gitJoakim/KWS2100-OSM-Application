import { Feature, MapBrowserEvent } from "ol";
import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "../map/mapContext";
import Point from "ol/geom/Point";
import { DisplayPointCard } from "./earthquakeDataCard";
import { EmptyDataCard } from "../../components/emptyDataComponent";
import { FeatureLike } from "ol/Feature";

interface EarthquakeProperties {
  mag: number;
  title: string | undefined;
  time: number;
  tsunami: number;
}

type EarthquakeFeature = {
  getProperties(): EarthquakeProperties;
} & Feature<Point>;

function useEarthquakeFeatures() {
  const { map } = useContext(MapContext);
  const [selectedEarthquake, setSelectedEarthquake] =
    useState<EarthquakeProperties | null>(null);

  function handleMapClick(e: MapBrowserEvent<MouseEvent>) {
    // displays when resolution is lower than 500, same as decluster
    const resolution = map.getView().getResolution();
    if (resolution! >= 500) {
      return;
    }
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      e.pixel,
      (f) => {
        features.push(f);
      },
      {
        hitTolerance: 1,
      },
    );
    if (features.length > 0) {
      const earthquakeFeature = features[0] as EarthquakeFeature;
      const geometry = earthquakeFeature.getGeometry();
      if (geometry?.getType() === "Point") {
        const earthquakeProperties = earthquakeFeature.getProperties();
        setSelectedEarthquake(earthquakeProperties);
      } else {
        setSelectedEarthquake(null);
      }
    } else {
      setSelectedEarthquake(null);
    }
  }

  useEffect(() => {
    map.on("click", handleMapClick);
    return () => {
      map.un("click", handleMapClick);
    };
  }, [map]);

  return { selectedEarthquake, setSelectedEarthquake };
}

export function EarthquakeInfo() {
  const { selectedEarthquake } = useEarthquakeFeatures();
  const eq = selectedEarthquake;

  // couldn't tell if this means Tsunami or just tsunami warning. I left the data as it is.
  const tsunami = eq?.tsunami === 1 ? "Yes" : "No";
  let titleWithoutMagnitude = eq?.title;
  try {
    // trimming title to not include magnitude
    titleWithoutMagnitude = eq?.title?.split("-").slice(1).join("-").trim();
  } catch (error) {
    titleWithoutMagnitude = undefined;
  }

  // Check if eq doesn't exist or if titleWithoutMagnitude is undefined
  if (!eq || titleWithoutMagnitude === undefined) {
    return (
      <>
        <EmptyDataCard title={"Earthquake"} type={"earthquake"} />
      </>
    );
  }
  return (
    <>
      <DisplayPointCard
        title={titleWithoutMagnitude}
        magnitude={eq.mag}
        time={eq.time}
        tsunami={tsunami}
      />
    </>
  );
}
