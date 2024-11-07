import TileLayer from "ol/layer/Tile";
import { useContext, useEffect, useState } from "react";
import { MapContext } from "../map/mapContext";
import { OSM, XYZ } from "ol/source";
import React from "react";

export function BaseLayerSelector() {
  // url to source of World image from ArcGIS
  const worldImagerySource = new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 18,
  });

  // Tile layers to choose from
  const baseLayerAlternatives = [
    {
      id: "world-image",
      name: "Photo Layer",
      layer: new TileLayer({ source: worldImagerySource }),
    },
    {
      id: "osm",
      name: "Open Street Map",
      layer: new TileLayer({ source: new OSM() }),
    },
  ];

  // baselayer from context
  const { setBaseLayer } = useContext(MapContext);
  const [selectedLayer, setSelectedLayer] = useState(baseLayerAlternatives[0]);

  // set the new base layer whenever the option changes
  useEffect(() => {
    setBaseLayer(selectedLayer.layer);
  }, [selectedLayer]);

  // if API to world imagery fails, it auto falls back on OSM
  useEffect(() => {
    worldImagerySource.on("tileloaderror", () => {
      setSelectedLayer(baseLayerAlternatives[1]);
    });
    return () => {
      worldImagerySource.un("tileloaderror", () => {
        setSelectedLayer(baseLayerAlternatives[1]);
      });
    };
  }, []);

  return (
    <div>
      <select
        onChange={(e) =>
          setSelectedLayer(
            baseLayerAlternatives.find((layer) => layer.id === e.target.value)!,
          )
        }
        value={selectedLayer.id}
      >
        {baseLayerAlternatives.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
