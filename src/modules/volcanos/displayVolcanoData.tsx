import { Feature, MapBrowserEvent } from "ol";
import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "../map/mapContext";
import Point from "ol/geom/Point";
import { EmptyDataCard } from "../../components/emptyDataComponent";
import { FeatureLike } from "ol/Feature";
import { DisplayVolcanoCard } from "./volcanoDataCard";

interface VolcanoProperties {
  VolcanoName: string | undefined;
  ExplosivityIndexMax: number;
  StartDate: string;
  EndDate: string;
}

type VolcanoFeature = {
  getProperties(): VolcanoProperties;
} & Feature<Point>;

function useVolcanoFeatures() {
  const { map } = useContext(MapContext);
  const [selectedVolcano, setSelectedVolcano] =
    useState<VolcanoProperties | null>(null);

  function handleMapClick(e: MapBrowserEvent<MouseEvent>) {
    // displays when resolution is lower than 5000, same as when it declusters
    const resolution = map.getView().getResolution();
    if (resolution! >= 5000) {
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
      const volcanoFeature = features[0] as VolcanoFeature;
      const geometry = volcanoFeature.getGeometry();
      if (geometry?.getType() === "Point") {
        const volcanoProperties = volcanoFeature.getProperties();
        setSelectedVolcano(volcanoProperties);
      } else {
        setSelectedVolcano(null);
      }
    } else {
      setSelectedVolcano(null);
    }
  }

  useEffect(() => {
    map.on("click", handleMapClick);
    return () => {
      map.un("click", handleMapClick);
    };
  }, [map]);

  return { selectedVolcano, setSelectedVolcano };
}

export function VolcanoInfo() {
  const { selectedVolcano } = useVolcanoFeatures();
  const volcano = selectedVolcano;

  if (!volcano || volcano.VolcanoName === undefined) {
    return (
      <>
        <EmptyDataCard title={"Volcanic Eruption"} type={"volcano"} />
      </>
    );
  }
  return (
    <>
      <DisplayVolcanoCard
        VolcanoName={volcano.VolcanoName}
        ExplosivityIndexMax={volcano.ExplosivityIndexMax}
        StartDate={volcano.StartDate}
        EndDate={volcano.EndDate}
      />
    </>
  );
}
