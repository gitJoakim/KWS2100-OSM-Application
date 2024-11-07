import { Feature } from "ol";
import { useContext, useEffect, useState } from "react";
import React from "react";
import { useVectorFeatures } from "../map/useVectorFeatures";
import { MapContext } from "../map/mapContext";

interface VolcanoProperties {
  Activity_ID: number;
  VolcanoName: string;
}

type VolcanoFeature = {
  getProperties(): VolcanoProperties;
  getGeometry(): any;
} & Feature;

export function VolcanoAside() {
  const { map, vectorLayers } = useContext(MapContext);
  const { visibleFeatures } = useVectorFeatures<VolcanoFeature>(
    (l) => l.getClassName() === "volcano",
  );
  const [displayedFeatures, setDisplayedFeatures] = useState<VolcanoFeature[]>(
    [],
  );
  const [zoomedToFeature, setZoomedToFeature] = useState(false);

  // when clicking on a featurename in the aside
  function handleFeatureClick(feature: VolcanoFeature) {
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

  // get view and save to localStorage before zooming in
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
  }, [visibleFeatures, vectorLayers]);

  return (
    <aside
      className={`${displayedFeatures?.length ? "visible" : "hidden"} volcano-aside`}
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
            Volcanos
          </h2>
        </div>
        <ul>
          {displayedFeatures?.map((v) => (
            <li
              key={v.getProperties().Activity_ID}
              onClick={() => handleFeatureClick(v)}
            >
              {v.getProperties().VolcanoName}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
