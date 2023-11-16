import { sample, shuffle } from "lodash";
import type { DirectionsResponseData } from "@googlemaps/google-maps-services-js";
import { RouteExistsError } from "../errors/RouteExistsError";
import { Route } from "./route/route";

interface IRouteOptions {
  routeId: string;
  startMarkerOptions: google.maps.MarkerOptions;
  endMarkerOptions: google.maps.MarkerOptions;
  carMarkerOptions: google.maps.MarkerOptions;
  directionsResponseData?: DirectionsResponseData & { request: any };
}

export class Map {
  public map: google.maps.Map;
  private routes: { [routeId: string]: Route } = {};

  constructor(element: HTMLElement, options: google.maps.MapOptions) {
    this.map = new google.maps.Map(element, {
      ...options,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
    });
  }

  async addRoute({
    routeId,
    startMarkerOptions,
    endMarkerOptions,
    carMarkerOptions,
    directionsResponseData,
  }: IRouteOptions) {
    if (routeId in this.routes) {
      throw new RouteExistsError();
    }

    const route = new Route({
      startMarkerOptions: { ...startMarkerOptions, map: this.map },
      endMarkerOptions: { ...endMarkerOptions, map: this.map },
      carMarkerOptions: { ...carMarkerOptions, map: this.map },
    });
    this.routes[routeId] = route;

    await route.calculateRoute(directionsResponseData);

    this.fitBounds();
  }
}
