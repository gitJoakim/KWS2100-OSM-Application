import Feature from "ol/Feature";
import { Coordinate } from "ol/coordinate";
import { Point, Polygon } from "ol/geom";

/* Moved interfaces here in an attempt to clean up the drawingfile */

/* Forest Fires */
export interface ForestFireProperties {
  TimeReported: string;
  AuthoritiesNotified: boolean;
  ExtraInformation: string;
}

export type ForestFireFeature = {
  getProperties(): ForestFireProperties;
} & Feature<Polygon>;

/* Meteorite */
export interface MeteoriteProperties {
  TimeReported: string;
  EstimatedSize: number;
  ExtraInformation: string;
  ImpactPoint: Coordinate;
}

export type MeteoriteFeature = {
  getProperties(): MeteoriteProperties;
} & Feature<Point>;
