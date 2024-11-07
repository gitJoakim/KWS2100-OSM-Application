import { Feature } from "ol";
import { useContext, useEffect, useState } from "react";
import React from "react";
import { useVectorFeatures } from "../map/useVectorFeatures";
import { MapContext } from "../map/mapContext";

interface EarthquakeProperties {
  code: string;
  title: string;
}

type EarthquakeFeature = {
  getProperties(): EarthquakeProperties;
  getGeometry(): any;
} & Feature;

export function EarthquakeAside() {
  const { map, vectorLayers } = useContext(MapContext);
  const { visibleFeatures } = useVectorFeatures<EarthquakeFeature>(
    (l) => l.getClassName() === "earthquake",
  );
  const [displayedFeatures, setDisplayedFeatures] = useState<
    EarthquakeFeature[]
  >([]);
  const [zoomedToFeature, setZoomedToFeature] = useState(false);

  useEffect(() => {
    setDisplayedFeatures(visibleFeatures);
  }, [visibleFeatures]);

  useEffect(() => {
    setDisplayedFeatures(visibleFeatures);
  }, [vectorLayers]);

  // when clicking on a featurename in the aside
  function handleFeatureClick(feature: EarthquakeFeature) {
    const geometry = feature.getGeometry();
    if (geometry) {
      getAndSaveView();
      const minimumResolution = 50;
      map.getView().fit(geometry, {
        duration: 1500,
        minResolution: minimumResolution,
      });
      setZoomedToFeature(true);
    }
  }

  // get current view and save to localStorage before zooming in
  function getAndSaveView() {
    const zoom = map.getView().getZoom();
    const center = map.getView().getCenter();
    const previousView = { center: center, zoom: zoom };

    const viewString = JSON.stringify(previousView);
    localStorage.setItem("previous-view", viewString);
  }

  // grabs the stored view from localStorage and sets it as the new view
  function handleGoBackToPreviousView() {
    const viewString = localStorage.getItem("previous-view");
    const previousView = JSON.parse(viewString!);

    if (viewString) {
      map.getView().animate({
        center: previousView.center,
        zoom: previousView.zoom,
        duration: 1500,
      });
      setZoomedToFeature(false);
    } else {
      // backup to all the way out if previousview didn't save or failed
      map.getView().animate({
        center: [10, 25],
        zoom: 2.5,
        duration: 1500,
      });
      setZoomedToFeature(false);
    }
  }

  useEffect(() => {
    setDisplayedFeatures(visibleFeatures);
  }, [vectorLayers]);

  return (
    <aside
      className={`${displayedFeatures?.length ? "visible" : "hidden"} earthquake-aside`}
      style={{ margin: "12px" }}
    >
      <div>
        <div className="aside-top">
          {" "}
          <button
            className={`${zoomedToFeature ? "visible" : "hidden"} volc-aside-back-btn`}
            onClick={handleGoBackToPreviousView}
          >
            Go back
          </button>
          <h2
            style={{
              paddingBottom: "8px",
              paddingLeft: "12px",
              textAlign: "center",
            }}
          >
            Earthquakes
          </h2>
        </div>
        <ul>
          {displayedFeatures?.map((v) => (
            <li
              key={v.getProperties().code}
              onClick={() => handleFeatureClick(v)}
            >
              {v.getProperties().title.split("-")[1].trim()}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
