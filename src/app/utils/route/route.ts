import type { DirectionsResponseData } from "@googlemaps/google-maps-services-js";
import { IContructorProps } from "./route.interfaces";

export class Route {
  public startMarker: google.maps.Marker;
  public endMarker: google.maps.Marker;
  public carMarker: google.maps.Marker;

  public directionsRenderer: google.maps.DirectionsRenderer;

  constructor({
    startMarkerOptions,
    endMarkerOptions,
    carMarkerOptions,
  }: IContructorProps) {
    this.startMarker = new google.maps.Marker(startMarkerOptions);
    this.endMarker = new google.maps.Marker(endMarkerOptions);
    this.carMarker = new google.maps.Marker(carMarkerOptions);

    const { strokeColor } = this.startMarker.getIcon() as google.maps.Symbol;

    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor,
        strokeOpacity: 0.5,
        strokeWeight: 5,
      },
    });
    this.directionsRenderer.setMap(
      this.startMarker.getMap() as google.maps.Map
    );
  }

  async calculateRoute(
    directionsResponseData?: DirectionsResponseData & { request: any }
  ) {
    if (directionsResponseData) {
      const directionsResult = this.convertDirectionsResponseToDirectionsResult(
        directionsResponseData
      );

      this.directionsRenderer.setDirections(directionsResult);
      return;
    }

    const startPosition = this.startMarker.getPosition() as google.maps.LatLng;
    const endPosition = this.endMarker.getPosition() as google.maps.LatLng;

    const result = await new google.maps.DirectionsService().route({
      origin: startPosition,
      destination: endPosition,
      travelMode: google.maps.TravelMode.DRIVING,
    });
  }

  private convertDirectionsResponseToDirectionsResult(
    directionsResponseData?: DirectionsResponseData & { request: any }
  ): google.maps.DirectionsResult {
    const copy = { ...directionsResponseData };

    return {
      available_travel_modes:
        copy.available_travel_modes as google.maps.TravelMode[],
      geocoded_waypoints: copy.geocoded_waypoints,
      request: copy.request,
      //@ts-expect-error
      routes: copy.routes.map((r) => {
        const bounds = new google.maps.LatLngBounds(
          r.bounds.southwest,
          r.bounds.northeast
        );
        return {
          bounds,
          overview_path: google.maps.geometry.encoding.decodePath(
            r.overview_polyline.points
          ),
          overview_polyline: r.overview_polyline,
          warnings: r.warnings,
          copyrights: r.copyrights,
          summary: r.summary,
          waypoint_order: r.waypoint_order,
          fare: r.fare,
          legs: r.legs.map((l) => ({
            ...l,
            start_location: new google.maps.LatLng(
              l.start_location.lat,
              l.start_location.lng
            ),
            end_location: new google.maps.LatLng(
              l.end_location.lat,
              l.end_location.lng
            ),
            steps: l.steps.map((s) => ({
              path: google.maps.geometry.encoding.decodePath(s.polyline.points),
              start_location: new google.maps.LatLng(
                s.start_location.lat,
                s.start_location.lng
              ),
            })),
          })),
        };
      }),
    };
  }
}
