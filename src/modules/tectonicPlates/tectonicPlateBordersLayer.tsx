import { useState } from "react";
import { useLayer } from "../map/useLayer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Stroke, Style } from "ol/style";

// base url for github repo
const baseRepoUrl = "/KWS2100-OSM-Application ";

// display of linestring
const tectonicPlateBorderLayer = new VectorLayer({
  source: new VectorSource({
    url: baseRepoUrl + "/tectonic_boundaries.json",
    format: new GeoJSON(),
  }),
  style: plateStyle,
});

// added 2 strokes, bottom one bigger as a neat way to create a stroke on a stroke
function plateStyle() {
  return [
    new Style({
      stroke: new Stroke({
        color: "black",
        width: 5,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: "yellow",
        width: 4,
      }),
    }),
  ];
}

export function TectonicPlatesBordersLayer() {
  const [checked] = useState(true);

  useLayer([tectonicPlateBorderLayer], checked);

  return null;
}
