import { Feature } from "ol";
import { Layer } from "ol/layer";
import { useContext, useEffect, useMemo, useState } from "react";
import { MapContext } from "./mapContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

// custom hook, heavily inspired by the one from lecture 5
export function useVectorFeatures<FEATURE extends Feature>(
  layerSelector: (l: Layer) => boolean,
): {
  layer?: VectorLayer<VectorSource>;
  visibleFeatures: FEATURE[];
  features: FEATURE[];
} {
  const { map, vectorLayers } = useContext(MapContext);
  const [features, setFeatures] = useState<FEATURE[]>([]);
  const [viewExtent, setViewExtent] = useState(
    map.getView().calculateExtent(map.getSize()),
  );

  const layer = useMemo(
    () => vectorLayers.find(layerSelector),
    [vectorLayers, layerSelector],
  ) as VectorLayer<VectorSource>;

  useEffect(() => {
    if (layer) {
      layer.getSource()?.on("change", handleSourceChange);
      return () => {
        layer.getSource()?.un("change", handleSourceChange);
        setFeatures([]);
      };
    }
  }, [layer]);

  useEffect(() => {
    const handleViewChange = () => {
      setViewExtent(map.getView().calculateExtent(map.getSize()));
    };
    map.on("moveend", handleViewChange);
    return () => {
      map.un("moveend", handleViewChange);
    };
  }, [map]);

  useEffect(() => {
    if (layer) {
      setFeatures(layer?.getSource()?.getFeatures() as FEATURE[]);
    }
  }, [layer]);

  const visibleFeatures = useMemo(() => {
    return features.filter((f) =>
      f.getGeometry()?.intersectsExtent(viewExtent),
    );
  }, [features, viewExtent]);

  function handleSourceChange() {
    setFeatures(layer?.getSource()?.getFeatures() as FEATURE[]);
  }

  return { layer, features, visibleFeatures };
}
