import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { map, MapContext } from "../map/mapContext";
import "./application.css";
import "ol/ol.css";
import { Layer } from "ol/layer";
import { View } from "ol";
import { BaseLayerSelector } from "../baseLayer/baseLayerSelector";
import { TectonicPlatesBordersLayer } from "../tectonicPlates/tectonicPlateBordersLayer";
import { TectonicPlatesNamesLayer } from "../tectonicPlates/tectonicPlateNamesLayer";
import { EarthquakeLayerCheckbox } from "../earthquakes/earthquakeLayerCheckbox";
import { Sidebar } from "../../components/sidebar";
import { EarthquakeInfo } from "../earthquakes/displayEarthquakeData";
import { VolcanoLayerCheckbox } from "../volcanos/volcanoLayerCheckbox";
import PointColorInfo from "../../components/pointColorInfo";
import { VolcanoInfo } from "../volcanos/displayVolcanoData";
import { VolcanoAside } from "../volcanos/volcanoAside";
import { EarthquakeAside } from "../earthquakes/earthquakeAside";
import { UserDrawing } from "../drawing/userDrawing";

export function Application() {
  const [baseLayer, setBaseLayer] = useState<Layer>(
    () => new TileLayer({ source: new OSM() }),
  );
  const [view] = useState(new View({ center: [10, 25], zoom: 2.5 }));
  useEffect(() => map.setView(view), [view]);

  const [vectorLayers, setVectorLayers] = useState<Layer[]>([]);
  const layers = useMemo(
    () => [baseLayer, ...vectorLayers],
    [baseLayer, vectorLayers],
  );
  useEffect(() => map.setLayers(layers), [layers]);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  useEffect(() => map.setTarget(mapRef.current), []);

  // color info
  const earthquakeColorInfo = [
    { color: "#0047ab", label: "> 6.5" },
    { color: "#288df7", label: "5.5 - 6.5" },
    { color: "#6EB5FF", label: "< 5.5" },
  ];
  const volcanoColorInfo = [
    { color: "red", label: "> 3" },
    { color: "orange", label: "> 2" },
    { color: "yellow", label: "2 <" },
  ];

  return (
    <MapContext.Provider
      value={{
        map,
        vectorLayers,
        setVectorLayers,
        setBaseLayer,
      }}
    >
      <header>
        <h1>Environmental Events Map</h1>
        <nav>
          <BaseLayerSelector />
          <TectonicPlatesBordersLayer />
          <TectonicPlatesNamesLayer />
          <EarthquakeLayerCheckbox />
          <VolcanoLayerCheckbox />
        </nav>
      </header>
      <main>
        <Sidebar>
          <PointColorInfo
            title={"Earthquake Magnitude Scale"}
            scale={earthquakeColorInfo}
          />
          <PointColorInfo
            title={"Volcanic Explosivity Index Scale"}
            scale={volcanoColorInfo}
          />
          <EarthquakeInfo />
          <VolcanoInfo />
        </Sidebar>
        <div ref={mapRef} className="map">
          <VolcanoAside />
          <EarthquakeAside />
          <UserDrawing />
        </div>
      </main>
    </MapContext.Provider>
  );
}
