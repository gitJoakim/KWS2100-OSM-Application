import { useContext, useEffect } from "react";
import { MapContext } from "./mapContext";
import { Layer } from "ol/layer";

/* Inspired by lectures */
export function useLayer(layers: Layer[], checked: boolean = true) {
  const { setVectorLayers } = useContext(MapContext);

  useEffect(() => {
    if (checked) {
      setVectorLayers((old) => [...old, ...layers]);
    } else {
      setVectorLayers((old) => {
        // Filter out all layers that are in the current array of layers
        const filteredLayers = old.filter((l) => !layers.includes(l));
        return filteredLayers;
      });
    }

    // Cleanup function
    return () => {
      setVectorLayers((old) => {
        // Filter out all layers that are in the current array of layers
        const filteredLayers = old.filter((l) => !layers.includes(l));
        return filteredLayers;
      });
    };
  }, [checked]);
}
