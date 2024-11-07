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

interface EarthquakeProperties {
  mag: number;
  place: string;
  time: number;
}

type EarthquakeFeature = {
  getProperties(): EarthquakeProperties;
} & Feature<Point>;

function earthquakeStyle(f: FeatureLike) {
  const feature = f as EarthquakeFeature;
  const earthquake = feature.getProperties();

  return [
    new Style({
      image: new Circle({
        stroke: new Stroke({ color: "black", width: 2 }),
        fill: new Fill({
          color:
            earthquake.mag > 6.5
              ? "#0047ab"
              : earthquake.mag > 5.5
                ? "#288df7"
                : "#6EB5FF",
        }),
        radius: earthquake.mag * 3.5,
      }),
    }),
    new Style({
      image: new Icon({
        src: baseRepoUrl + "/icons/earthquake_house_icon.svg",
        width: earthquake.mag * 7,
      }),
    }),
  ];
}

function activeEarthquakeStyle(f: FeatureLike) {
  const feature = f as EarthquakeFeature;
  const earthquake = feature.getProperties();

  return [
    new Style({
      image: new Circle({
        stroke: new Stroke({ color: "white", width: 3 }),
        fill: new Fill({
          color:
            earthquake.mag > 6.5
              ? "#0047ab"
              : earthquake.mag > 5.5
                ? "#288df7"
                : "#6EB5FF",
        }),
        radius: earthquake.mag * 5.5,
      }),
    }),
    new Style({
      image: new Icon({
        src: baseRepoUrl + "/icons/earthquake_house_icon.svg",
        width: earthquake.mag * 10.5,
      }),
    }),
  ];
}

const clusterStyle = (f: FeatureLike) => {
  const amountOfFeatures = f.get("features").length;

  return [
    new Style({
      image: new Circle({
        stroke: new Stroke({ color: "black", width: 2 }),
        fill: new Fill({ color: "#288df7" }),
        radius: Math.min(Math.max(amountOfFeatures / 3, 15), 40),
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
        src: baseRepoUrl + "/icons/earthquake_house_icon.svg",
        width: Math.min(Math.max(amountOfFeatures * 0.7, 30), 65),
      }),
    }),
  ];
};

export function EarthquakeLayerCheckbox() {
  const { map } = useContext(MapContext);
  const [checked, setChecked] = useState(false);
  const [earthquakeSourceUrl, setEarthquakeSourceUrl] = useState<
    string | undefined
  >(undefined);
  const [activeFeature, setActiveFeature] = useState<EarthquakeFeature>();

  // checkbox visibility, invis for 1.5sec while data gets fetched
  const [isVisible, setIsVisible] = useState(false);
  function delayCheckboxWhileFetchingData() {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }

  // fetching data and adding it as a vectorSource
  async function fetchAndStoreEarthquakeData() {
    try {
      const storageData = localStorage.getItem("earthquake-data");
      if (storageData !== null) {
        const parsedStorageData = JSON.parse(storageData);
        // struggled to get it to work, but this from stackoverflow did the trick
        const dataUrl =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(parsedStorageData));

        setEarthquakeSourceUrl(dataUrl);
      } else {
        // fetching earthquake geojson from usgs
        const response = await fetch(
          "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-04-01&endtime=2024-04-30&minmagnitude=4",
        );
        const earthquakeJson = await response.json();
        localStorage.setItem("earthquake-data", JSON.stringify(earthquakeJson));
        // struggled to get it to work, but this from stackoverflow did the trick
        const dataUrl =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(earthquakeJson));

        setEarthquakeSourceUrl(dataUrl);
      }
    } catch (error) {
      console.error("An error occured trying to fetch earthquake data.");
    }
  }

  const earthquakeSource = new VectorSource({
    url: earthquakeSourceUrl,
    format: new GeoJSON(),
  });

  const earthquakeLayer = new VectorLayer({
    className: "earthquake",
    source: earthquakeSource,
    style: earthquakeStyle,
  });

  // cluster
  const earthquakeClusterSource = new Cluster({
    distance: 150,
    source: earthquakeSource,
  });

  const earthquakeClusterLayer = new VectorLayer({
    source: earthquakeClusterSource,
    style: clusterStyle,
  });

  function handleClickFeature(e: MapBrowserEvent<MouseEvent>) {
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(
      e.pixel,
      (f) => {
        features.push(f);
      },
      { hitTolerance: 1, layerFilter: (l) => l === earthquakeLayer },
    );
    if (features.length === 1) {
      setActiveFeature(features[0] as EarthquakeFeature);
    } else {
      setActiveFeature(undefined);
    }
  }

  useEffect(() => {
    activeFeature?.setStyle(activeEarthquakeStyle);
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  useEffect(() => {
    if (checked) {
      map.on("click", handleClickFeature);
    }
    return () => map?.un("click", handleClickFeature);
  }, [checked, map]);

  useEffect(() => {
    fetchAndStoreEarthquakeData();
    delayCheckboxWhileFetchingData();
  }, []);

  useLayer([earthquakeLayer, earthquakeClusterLayer], checked);

  // decluster at 500 and below resolution
  useEffect(() => {
    function handleResolutionChange() {
      const resolution = map.getView().getResolution();
      if (resolution! <= 500) {
        earthquakeClusterLayer.setVisible(false);
        earthquakeLayer.setVisible(true);
      } else {
        earthquakeClusterLayer.setVisible(true);
        earthquakeLayer.setVisible(false);
      }
    }

    handleResolutionChange();
    map.getView().on("change:resolution", handleResolutionChange);

    return () => {
      map.getView().un("change:resolution", handleResolutionChange);
    };
  }, [map, checked]);

  return (
    <div style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s" }}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Earthquakes (April 2024, magnitude 5 and above)
      </label>
    </div>
  );
}
