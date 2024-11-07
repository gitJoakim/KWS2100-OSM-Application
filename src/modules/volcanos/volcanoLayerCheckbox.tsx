import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import React, { useContext, useEffect, useState } from "react";
import { useLayer } from "../map/useLayer";
import { Circle, Fill, Icon, Stroke, Style, Text } from "ol/style";
import { Feature, MapBrowserEvent } from "ol";
import { Point } from "ol/geom";
import { MapContext } from "../map/mapContext";
import { FeatureLike } from "ol/Feature";
import { Cluster } from "ol/source";

// base url for github repo
const baseRepoUrl = "/KWS2100-OSM-Application ";

interface VolcanoProperties {
  VolcanoName: string;
  ExplosivityIndexMax: number;
  StartDate: string;
  EndDate: string;
}

type VolcanoFeature = {
  getProperties(): VolcanoProperties;
} & Feature<Point>;

function volcanoStyle(f: FeatureLike) {
  const feature = f as VolcanoFeature;
  const volcano = feature.getProperties();
  const volcEIM = volcano.ExplosivityIndexMax;
  return [
    new Style({
      image: new Circle({
        stroke: new Stroke({ color: "black", width: 2 }),
        fill: new Fill({
          color: volcEIM > 3 ? "red" : volcEIM > 2 ? "orange" : "yellow",
        }),
        radius: Math.min(Math.max((volcEIM + 5) * 3.5, 15), 35),
      }),
    }),
    new Style({
      image: new Icon({
        src: baseRepoUrl + "/icons/volcano_icon_color.svg",
        width: Math.min(Math.max((volcEIM + 5) * 5, 15), 50),
      }),
    }),
  ];
}

function activeVolcanoStyle(f: FeatureLike) {
  const feature = f as VolcanoFeature;
  const volcano = feature.getProperties();
  const volcEIM = volcano.ExplosivityIndexMax;
  return [
    new Style({
      image: new Circle({
        stroke: new Stroke({ color: "white", width: 3 }),
        fill: new Fill({
          color: volcEIM > 3 ? "red" : volcEIM > 2 ? "orange" : "yellow",
        }),
        radius: Math.min(Math.max((volcEIM + 5) * 5, 20), 45),
      }),
    }),
    new Style({
      image: new Icon({
        src: baseRepoUrl + "/icons/volcano_icon_color.svg",
        width: Math.min(Math.max((volcEIM + 5) * 7, 20), 65),
      }),
    }),
  ];
}

const clusterStyle = (f: FeatureLike) => {
  const features = f.get("features");
  const amountOfFeatures = features.length;

  return [
    new Style({
      image: new Circle({
        stroke: new Stroke({ color: "black", width: 2 }),
        fill: new Fill({ color: "#a3a2a2" }),
        radius: Math.min(Math.max(amountOfFeatures * 3.5, 15), 40),
      }),
      text: new Text({
        text: amountOfFeatures.toString(),
        font: "bold 20px sans-serif",
        fill: new Fill({ color: "white" }),
        stroke: new Stroke({
          color: "black",
          width: 2,
        }),
      }),
    }),
    new Style({
      image: new Icon({
        src: baseRepoUrl + "/icons/volcano_icon_color.svg",
        width: Math.min(Math.max(amountOfFeatures * 3.5, 25), 65),
      }),
    }),
  ];
};

const volcanoSource = new VectorSource({
  url: baseRepoUrl + "/volcanic_eruptions.json",
  format: new GeoJSON(),
});

const volcanoLayer = new VectorLayer({
  className: "volcano",
  source: volcanoSource,
  style: volcanoStyle,
});

const volcanoClusterSource = new Cluster({
  distance: 50,
  source: volcanoSource,
});

const volcanoClusterLayer = new VectorLayer({
  source: volcanoClusterSource,
  style: clusterStyle,
});

export function VolcanoLayerCheckbox() {
  const { map } = useContext(MapContext);
  const [checked, setChecked] = useState(false);
  const [activeFeature, setActiveFeature] = useState<VolcanoFeature>();

  // clicking on a feature
  function handleClickFeature(e: MapBrowserEvent<MouseEvent>) {
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      e.pixel,
      (f) => {
        features.push(f);
      },
      { hitTolerance: 1, layerFilter: (l) => l === volcanoLayer },
    );
    if (features.length === 1) {
      setActiveFeature(features[0] as VolcanoFeature);
    } else {
      setActiveFeature(undefined);
    }
  }

  useLayer([volcanoLayer, volcanoClusterLayer], checked);

  useEffect(() => {
    activeFeature?.setStyle(activeVolcanoStyle);
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  useEffect(() => {
    if (checked) {
      map.on("click", handleClickFeature);
    }
    return () => map?.un("click", handleClickFeature);
  }, [checked, map]);

  // decluster below 5000 reso
  useEffect(() => {
    function handleResolutionChange() {
      const resolution = map.getView().getResolution();
      if (resolution! <= 5000) {
        volcanoClusterLayer.setVisible(false);
        volcanoLayer.setVisible(true);
      } else {
        volcanoClusterLayer.setVisible(true);
        volcanoLayer.setVisible(false);
      }
    }

    handleResolutionChange();
    map.getView().on("change:resolution", handleResolutionChange);

    return () => {
      map.getView().un("change:resolution", handleResolutionChange);
    };
  }, [map, checked]);
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Volcanic eruptions (2014 - 2024)
      </label>
    </div>
  );
}
