"use client";

import type { FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef } from "react";
import { useMap } from "../hooks/maps/useMap";

export function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  async function handleSearchPlaces(e: FormEvent) {
    e.preventDefault();

    const source = (document.getElementById("source") as HTMLInputElement)
      .value;

    const destination = (
      document.getElementById("destination") as HTMLInputElement
    ).value;

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${source}`),
      fetch(`http://localhost:3000/places?text=${destination}`),
    ]);

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
      await Promise.all([sourceResponse.json(), destinationResponse.json()]);

    if (sourcePlace.status !== "OK") {
      console.error(sourcePlace);
      alert("Não foi possível encontrar a origem");
      return;
    }

    if (destinationPlace.status !== "OK") {
      console.error(destinationPlace);
      alert("Não foi possível encontrar o destino");
      return;
    }

    const placeSourceId = sourcePlace.candidates[0].place_id;
    const destinationSourceId = destinationPlace.candidates[0].place_id;

    const directionsResponse = await fetch(
      `http://localhost:3000/directions?origin_id=${placeSourceId}&destination_id=${destinationSourceId}`
    );

    const directionsData = await directionsResponse.json();

    console.log(directionsData);
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
      }}
    >
      <div>
        <h1>Nova rota</h1>
        <form
          style={{ display: "flex", flexDirection: "column" }}
          onSubmit={handleSearchPlaces}
        >
          <div>
            <input id="source" type="text" placeholder="Origem" />
          </div>
          <div>
            <input id="destination" type="text" placeholder="Destino" />
          </div>
          <button type="submit">Pesquisar</button>
        </form>
      </div>
      <div
        id="map"
        style={{
          height: "100%",
          width: "100%",
        }}
        ref={mapContainerRef}
      ></div>
    </div>
  );
}

export default NewRoutePage;
