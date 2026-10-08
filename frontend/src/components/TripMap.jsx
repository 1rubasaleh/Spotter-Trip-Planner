import { useEffect } from "react";
import { divIcon } from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./TripMap.css";

const previewCenter = [0, 0];
const markerColors = {
  current: "#c84b45",
  pickup: "#4f865a",
  dropoff: "#c84b45",
  fuel: "#b87932",
  rest: "#526b83",
};
const markerSvgContent = {
  current:
    '<circle cx="12" cy="12" r="6.5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>',
  pickup:
    '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/>',
  dropoff:
    '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/>',
  fuel: '<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h7A1.5 1.5 0 0 1 16 4.5V21M4 21h14M8.5 7h5v4h-5zM16 7h1.2a2 2 0 0 1 2 2v7a1.5 1.5 0 0 0 3 0v-5l-2-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  rest: '<path d="M3 18v-7m0 4h18v3M6 15v-4a2 2 0 0 1 2-2h3a3 3 0 0 1 3 3v3m0-2h4a3 3 0 0 1 3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
};

function FitRouteBounds({ geometry }) {
  const map = useMap();

  useEffect(() => {
    if (geometry?.type !== "LineString" || geometry.coordinates.length < 2)
      return;

    const routeCoordinates = geometry.coordinates.map(
      ([longitude, latitude]) => [latitude, longitude],
    );
    map.fitBounds(routeCoordinates, { padding: [32, 32] });
  }, [geometry, map]);

  return null;
}

function MarkerGlyph({ kind }) {
  return (
    <span
      className="trip-map-marker-glyph"
      style={{ "--marker-color": markerColors[kind] }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="size-[18px]"
      >
        {kind === "fuel" ? (
          <>
            <path
              d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h7A1.5 1.5 0 0 1 16 4.5V21M4 21h14M8.5 7h5v4h-5zM16 7h1.2a2 2 0 0 1 2 2v7a1.5 1.5 0 0 0 3 0v-5l-2-2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : kind === "rest" ? (
          <path
            d="M3 18v-7m0 4h18v3M6 15v-4a2 2 0 0 1 2-2h3a3 3 0 0 1 3 3v3m0-2h4a3 3 0 0 1 3 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : kind === "current" ? (
          <>
            <circle
              cx="12"
              cy="12"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          </>
        ) : (
          <>
            <path
              d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="2.2" fill="currentColor" />
          </>
        )}
      </svg>
    </span>
  );
}

function createMarkerIcon(kind) {
  return divIcon({
    className: "trip-map-marker",
    html: `<span class="trip-map-marker-glyph" style="--marker-color:${markerColors[kind]}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none">${markerSvgContent[kind]}</svg></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function toLatLng(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

  const [latitude, longitude] = coordinates.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    return null;

  return [latitude, longitude];
}

function getRouteEndpoints(geometry) {
  if (geometry?.type !== "LineString" || geometry.coordinates.length < 2)
    return null;

  const first = geometry.coordinates[0];
  const last = geometry.coordinates.at(-1);

  return {
    current: toLatLng([first[1], first[0]]),
    dropoff: toLatLng([last[1], last[0]]),
  };
}

function TripMap({
  routeGeometry,
  pickupCoordinate,
  fuelStopCoordinates = [],
  restStopCoordinates = [],
}) {
  const endpoints = getRouteEndpoints(routeGeometry);

  return (
    <section
      className="relative min-h-[390px] overflow-hidden rounded-lg border border-[#dce4da] bg-[#e8ede7] lg:min-h-0"
      aria-label="Interactive map preview"
    >
      <MapContainer
        key={routeGeometry ? "trip-route" : "map-preview"}
        center={previewCenter}
        zoom={routeGeometry ? 5 : 2}
        scrollWheelZoom
        className="map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routeGeometry && (
          <GeoJSON
            data={routeGeometry}
            style={{ color: "#315f43", weight: 5, opacity: 0.9 }}
          />
        )}
        {routeGeometry && <FitRouteBounds geometry={routeGeometry} />}
        {endpoints?.current && (
          <Marker
            position={endpoints.current}
            icon={createMarkerIcon("current")}
          >
            <Tooltip>Current location</Tooltip>
          </Marker>
        )}
        {toLatLng(pickupCoordinate) && (
          <Marker
            position={toLatLng(pickupCoordinate)}
            icon={createMarkerIcon("pickup")}
          >
            <Tooltip>Pickup</Tooltip>
          </Marker>
        )}
        {endpoints?.dropoff && (
          <Marker
            position={endpoints.dropoff}
            icon={createMarkerIcon("dropoff")}
          >
            <Tooltip>Dropoff</Tooltip>
          </Marker>
        )}
        {fuelStopCoordinates.map((coordinates, index) => {
          const position = toLatLng(coordinates);
          return position ? (
            <Marker
              key={`fuel-${index}`}
              position={position}
              icon={createMarkerIcon("fuel")}
            >
              <Tooltip>Fuel stop</Tooltip>
            </Marker>
          ) : null;
        })}
        {restStopCoordinates.map((coordinates, index) => {
          const position = toLatLng(coordinates);
          return position ? (
            <Marker
              key={`rest-${index}`}
              position={position}
              icon={createMarkerIcon("rest")}
            >
              <Tooltip>Rest / break stop</Tooltip>
            </Marker>
          ) : null;
        })}
      </MapContainer>
      <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-md border border-[#e4e9e1] bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
        <span className="size-2 rounded-full bg-[#6d9b69]" />
        <span className="text-xs font-medium text-[#435147]">
          {routeGeometry ? "Trip route" : "Map preview"}
        </span>
      </div>
      <div
        className="map-legend absolute bottom-4 left-4 z-[500] grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-[#e4e9e1] bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-sm"
        aria-label="Map legend"
      >
        {[
          ["current", "Current location"],
          ["pickup", "Pickup"],
          ["dropoff", "Dropoff"],
          ["fuel", "Fuel stop"],
          ["rest", "Rest / break"],
        ].map(([kind, label]) => (
          <span
            key={kind}
            className="flex items-center gap-2 text-[11px] font-medium text-[#435147]"
          >
            <MarkerGlyph kind={kind} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

export default TripMap;
