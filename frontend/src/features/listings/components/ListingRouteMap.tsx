import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { MdMyLocation } from "react-icons/md";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import type { Listing } from "../../../types/api.types";
import "leaflet/dist/leaflet.css";

interface Props {
  listing: Listing;
  /** Reuse coordinates the parent already has (e.g. from "Near Me") */
  initialUserCoords?: { lat: number; lng: number } | null;
}

interface RouteInfo {
  points: [number, number][];
  distanceKm: number;
  durationMin: number;
  /** true when OSRM failed and we drew a straight line instead */
  straightLine: boolean;
}

const OSRM = "https://router.project-osrm.org/route/v1/driving";

const redDotIcon = L.divIcon({
  className: "map-red-dot-wrap",
  html: '<span class="map-red-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const blueDotIcon = L.divIcon({
  className: "map-blue-dot-wrap",
  html: '<span class="map-blue-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const formatDuration = (min: number) => {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${Math.round(min % 60)} min`;
};

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, points]);

  return null;
}

// Map showing the vendor's spot (blue dot) and, once the viewer shares their
// location, their own position (red dot) with the driving route between them.
export default function ListingRouteMap({ listing, initialUserCoords = null }: Props) {
  const [userCoords, setUserCoords] = useState(initialUserCoords);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const vendorPos: [number, number] | null =
    listing.latitude !== null && listing.longitude !== null
      ? [listing.latitude, listing.longitude]
      : null;

  const loadRoute = useCallback(
    async (from: { lat: number; lng: number }) => {
      if (!vendorPos) return;
      const [vLat, vLng] = vendorPos;

      try {
        const res = await fetch(
          `${OSRM}/${from.lng},${from.lat};${vLng},${vLat}?overview=full&geometries=geojson`
        );
        const data = res.ok ? await res.json() : null;

        if (data?.code === "Ok" && data.routes?.[0]) {
          const r = data.routes[0];
          setRoute({
            points: r.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            ),
            distanceKm: Math.round((r.distance / 1000) * 10) / 10,
            durationMin: r.duration / 60,
            straightLine: false,
          });
          return;
        }
      } catch {
        // fall through to straight line
      }

      setRoute({
        points: [
          [from.lat, from.lng],
          [vLat, vLng],
        ],
        distanceKm: Math.round(haversineKm(from, { lat: vLat, lng: vLng }) * 10) / 10,
        durationMin: 0,
        straightLine: true,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listing.latitude, listing.longitude]
  );

  // If the parent already knows where the user is, draw the route immediately
  useEffect(() => {
    if (initialUserCoords) {
      setUserCoords(initialUserCoords);
      loadRoute(initialUserCoords);
    }
  }, [initialUserCoords, loadRoute]);

  function locateMe() {
    if (!navigator.geolocation) {
      setNotice("Your browser does not support location access.");
      return;
    }

    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        await loadRoute(coords);
        setLocating(false);
      },
      () => {
        setNotice("Could not get your location — allow location access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (!vendorPos) {
    return (
      <p className="catalog-picker-note">
        This listing has no map location yet — the vendor hasn't pinned it.
      </p>
    );
  }

  const boundsPoints: [number, number][] = route
    ? route.points
    : userCoords
      ? [[userCoords.lat, userCoords.lng], vendorPos]
      : [vendorPos];

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vendorPos[0]},${vendorPos[1]}`;

  return (
    <div className="route-map">
      <div className="route-map-toolbar">
        {!userCoords ? (
          <button type="button" className="nearby-btn" onClick={locateMe} disabled={locating}>
            <MdMyLocation />
            {locating ? "Locating..." : "Show route from my location"}
          </button>
        ) : route ? (
          <span className="route-map-summary">
            {route.straightLine
              ? `${route.distanceKm} km away (direct line — road route unavailable)`
              : `${route.distanceKm} km by road · about ${formatDuration(route.durationMin)} drive`}
          </span>
        ) : (
          <span className="route-map-summary">Calculating route...</span>
        )}
        <a className="route-map-gmaps" href={gmapsUrl} target="_blank" rel="noopener noreferrer">
          <HiArrowTopRightOnSquare /> Open in Google Maps
        </a>
      </div>

      {notice && <p className="catalog-picker-note" style={{ color: "#b42318" }}>{notice}</p>}

      <div className="route-map-legend">
        <span><span className="map-blue-dot route-legend-dot" /> Vendor</span>
        {userCoords && <span><span className="map-red-dot route-legend-dot" /> You</span>}
      </div>

      <div className="route-map-canvas">
        <MapContainer center={vendorPos} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={boundsPoints} />

          <Marker position={vendorPos} icon={blueDotIcon}>
            <Tooltip direction="top" offset={[0, -10]}>
              <strong>{listing.title}</strong>
              <br />
              {listing.location}
              <br />
              TZS {listing.price.toLocaleString()}
            </Tooltip>
          </Marker>

          {userCoords && (
            <Marker position={[userCoords.lat, userCoords.lng]} icon={redDotIcon}>
              <Tooltip direction="top" offset={[0, -10]}>
                <strong>You are here</strong>
              </Tooltip>
            </Marker>
          )}

          {route && (
            <Polyline
              positions={route.points}
              pathOptions={{
                color: "#2563eb",
                weight: 4,
                opacity: 0.8,
                dashArray: route.straightLine ? "8 8" : undefined,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
