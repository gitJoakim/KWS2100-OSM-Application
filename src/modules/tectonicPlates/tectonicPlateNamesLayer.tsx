import React, { useState } from "react";
import { useLayer } from "../map/useLayer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import Feature, { FeatureLike } from "ol/Feature";
import { Polygon } from "ol/geom";
import { Fill, Stroke, Style, Text } from "ol/style";

// base url for github repo
const baseRepoUrl = "/KWS2100-OSM-Application ";

type PlateProperties = {
  PlateName: string;
};

type PlateFeature = Feature<Polygon> & {
  getProperties(): PlateProperties;
};

// this is a polygon layer, but the creater butchered it, so I am only displaying the names, while keeping the borders empty
// then using the border layer (linestring) to display the actual borders
const tectonicPlateNamesLayer = new VectorLayer({
  source: new VectorSource({
    url: baseRepoUrl + "/tectonic_plates.json",
    format: new GeoJSON(),
  }),
  style: nameStyle,
});

function nameStyle(f: FeatureLike) {
  const feature = f as PlateFeature;
  const plate = feature.getProperties();
  return new Style({
    text: new Text({
      text: `${plate.PlateName}`,
      font: "16px sans-serif",
      fill: new Fill({
        color: "yellow",
      }),
      stroke: new Stroke({
        color: "black",
        width: 2,
      }),
    }),
  });
}

export function TectonicPlatesNamesLayer() {
  const [checked, setChecked] = useState(true);

  useLayer([tectonicPlateNamesLayer], checked);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {checked ? "Hide" : "Show"} Tectonic Plate Names
      </label>
    </div>
  );
}
