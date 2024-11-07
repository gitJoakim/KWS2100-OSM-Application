import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "../map/mapContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { useLayer } from "../map/useLayer";
import Feature, { FeatureLike } from "ol/Feature";
import { MapBrowserEvent } from "ol";
import {
  ForestFireFeature,
  ForestFireProperties,
  MeteoriteFeature,
  MeteoriteProperties,
} from "./drawingInterfaces";
import CircleStyle from "ol/style/Circle";
import { Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";

export function UserDrawing() {
  const { map } = useContext(MapContext);
  const blankSource = new VectorSource(); // used as initial value
  const [userDrawingSource, setUserDrawingSource] = useState<VectorSource>(() =>
    fetchData(),
  );
  const [checked, setChecked] = useState(false);
  const [selectedGeometry, setSelectedGeometry] = useState("Polygon");
  const [activeFeature, setActiveFeature] = useState<
    ForestFireFeature | MeteoriteFeature
  >();

  // base url for github repo
  const baseRepoUrl = "/KWS2100-OSM-Application ";

  // fetches from local
  function fetchData(): VectorSource {
    const res = localStorage.getItem("draw-data");
    if (res) {
      const geoJSONFormat = new GeoJSON();
      const features = geoJSONFormat.readFeatures(JSON.parse(res));
      return new VectorSource({ features });
    } else {
      return blankSource;
    }
  }

  /* sets Forest Fire Properties */
  function setForestFireProperties() {
    const forestFireProperties: ForestFireProperties = {
      TimeReported: new Date().toLocaleString(),
      AuthoritiesNotified: getAuthoritiesNotified(),
      ExtraInformation: prompt(
        "Please add any and all infromation you have about this forest fire:",
      )!,
    };
    return forestFireProperties;
  }

  /* sets Meteorite Properties */
  function setMeteoriteProperties(coordinates: Coordinate) {
    const meteoriteProperties: MeteoriteProperties = {
      TimeReported: new Date().toLocaleString(),
      EstimatedSize: getMeteoriteSize()!,
      ExtraInformation: prompt("Any addition information:")!,
      ImpactPoint: coordinates,
    };
    return meteoriteProperties;
  }

  /* Simple fucntion to get a boolean value from user*/
  function getAuthoritiesNotified() {
    let authoritiesNotified;
    while (true) {
      let input = prompt(
        "Have authorities been notified of the forest fire? (Y/N)",
      )?.toLowerCase();
      if (input === "y" || input === "n") {
        authoritiesNotified = input === "y";
        break;
      } else {
        alert("Please enter 'Y' for Yes or 'N' for No.");
      }
    }
    return authoritiesNotified;
  }

  /* function prompt demaning estimated kg for meteorite*/
  function getMeteoriteSize() {
    let userInput: string | null = null;
    while (true) {
      userInput = prompt("Estimated size of meteorite? (kg):");

      if (userInput === null) {
        return null;
      }
      const estimatedWeight: number = parseFloat(userInput);
      if (!isNaN(estimatedWeight)) {
        return estimatedWeight;
      }
    }
  }

  /* takes care of drawing when user htis Draw button */
  function handleUserDraw() {
    const geoType: any = selectedGeometry;
    const draw = new Draw({ type: geoType, source: userDrawingSource });
    map.addInteraction(draw);
    draw.on("drawend", (event) => {
      map.removeInteraction(draw);
      const feature = event.feature.clone();
      if (geoType === "Polygon") {
        feature.setProperties(setForestFireProperties());
        saveToLocalStorage(feature);
      } else if (geoType === "Point") {
        const geo = feature.getGeometry() as Point;
        const coords = geo.getCoordinates();
        feature.setProperties(setMeteoriteProperties(coords));
        saveToLocalStorage(feature);
      }
    });
  }

  /* Function name kind of explains itself... */
  function saveToLocalStorage(feature: Feature) {
    userDrawingSource.addFeature(feature);

    // convert all features to GeoJSON
    const features = userDrawingSource.getFeatures();
    const geoJSONFormat = new GeoJSON();
    const geoJSONFeatures = geoJSONFormat.writeFeaturesObject(features);

    // updates local storage with all features
    localStorage.setItem("draw-data", JSON.stringify(geoJSONFeatures));
  }

  /* Delete all drawings */
  function handleClearAllDrawings() {
    localStorage.removeItem("draw-data");
    userDrawingSource.clear();
  }

  /* Hovering features after they've been drawn */
  function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      e.pixel,
      (f) => {
        features.push(f);
      },

      { hitTolerance: 1, layerFilter: (l) => l === userDrawingLayer },
    );
    if (features.length === 1) {
      if (features[0].getGeometry()?.getType() === "Polygon") {
        setActiveFeature(features[0] as ForestFireFeature);
      } else {
        setActiveFeature(features[0] as MeteoriteFeature);
      }
    } else {
      setActiveFeature(undefined);
    }
  }
  useEffect(() => {
    activeFeature?.setStyle(activeFeatureStyle);
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  /* STYLES */
  function userDrawingStyle(f: FeatureLike): Style | Style[] {
    const geometry = f.getGeometry();
    const geometryType = geometry!.getType();
    const feature = f.getProperties();

    const polygonStyle = new Style({
      stroke: new Stroke({
        color: "red",
        width: 4,
      }),
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.3)",
      }),
    });

    if (geometryType === "Point") {
      return [
        new Style({
          image: new CircleStyle({
            radius: Math.min(Math.max(10, feature.EstimatedSize * 3), 40),
            fill: new Fill({
              color: "rgba(0, 0, 0, 0.9)",
            }),
            stroke: new Stroke({
              color: "gray",
              width: 2,
            }),
          }),
        }),
        new Style({
          image: new Icon({
            src: baseRepoUrl + "/icons/meteorite_icon.svg",
            width: Math.min(Math.max(10, feature.EstimatedSize * 3), 40),
          }),
        }),
      ];
    } else {
      return polygonStyle;
    }
  }

  function activeFeatureStyle(f: FeatureLike): Style | Style[] {
    const geometry = f.getGeometry();
    const geometryType = geometry!.getType();
    const feature = f.getProperties();

    const polygonStyle = new Style({
      stroke: new Stroke({
        color: "pink",
        width: 4,
      }),
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.3)",
      }),
      text: new Text({
        text: `Forest fire reported: ${feature.TimeReported}\nAuthorities Notified: ${feature.AuthoritiesNotified ? "Yes" : "No"}\nExtra information:\n${feature.ExtraInformation}`,
        offsetY: -10,
        textAlign: "center",
        textBaseline: "bottom",
        font: "bold 14px sans-serif",
        backgroundFill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
        backgroundStroke: new Stroke({
          color: "rgba(0, 0, 0, 0.7)",
          width: 2,
        }),
        padding: [5, 10, 5, 10],
      }),
    });

    if (geometryType === "Point") {
      return [
        new Style({
          image: new CircleStyle({
            radius: Math.min(Math.max(10, feature.EstimatedSize * 3), 40),
            fill: new Fill({
              color: "rgba(0, 0, 0, 0.5)",
            }),
            stroke: new Stroke({
              color: "white",
              width: 3,
            }),
          }),
          text: new Text({
            text: `Meteorite reported: ${feature.TimeReported}\nEstimated size: ${feature.EstimatedSize}kg\nExtra information: ${feature.ExtraInformation}\nApproximate impact point: ${feature.ImpactPoint}`,
            offsetY: -50,
            font: "bold 14px sans-serif",
            backgroundFill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
            backgroundStroke: new Stroke({
              color: "rgba(0, 0, 0, 0.7)",
              width: 2,
            }),
            padding: [5, 10, 5, 10],
          }),
        }),
        new Style({
          image: new Icon({
            src: baseRepoUrl + "/icons/meteorite_icon.svg",
            width: Math.min(Math.max(10, feature.EstimatedSize * 3), 40),
          }),
        }),
      ];
    } else {
      return polygonStyle;
    }
  }

  /* vectorLayer */
  const userDrawingLayer = new VectorLayer({
    source: userDrawingSource,
    visible: checked,
    style: userDrawingStyle,
  });

  /* useEffect for pointermove(hover) */
  useEffect(() => {
    if (checked) {
      map.on("pointermove", handlePointerMove);
    }
    return () => map?.un("pointermove", handlePointerMove);
  }, [checked]);

  useEffect(() => {
    setUserDrawingSource(fetchData());
  }, []);
  useLayer([userDrawingLayer], checked);

  return (
    <div className="drawing-panel">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Drawing Layer
      </label>
      <select
        style={checked ? { display: "block" } : { display: "none" }}
        value={selectedGeometry}
        onChange={(e) => setSelectedGeometry(e.target.value)}
      >
        <option value="Polygon">Add Forest Fire (Polygon)</option>
        <option value="Point">Add Meteorite (Point)</option>
      </select>

      <button
        style={checked ? { display: "block" } : { display: "none" }}
        onClick={handleUserDraw}
      >
        Start Drawing
      </button>
      <button
        style={checked ? { display: "block" } : { display: "none" }}
        onClick={handleClearAllDrawings}
      >
        Delete All Drawings
      </button>
    </div>
  );
}
