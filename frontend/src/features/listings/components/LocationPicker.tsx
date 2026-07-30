import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { HiMapPin, HiMagnifyingGlass } from "react-icons/hi2";
import "leaflet/dist/leaflet.css";

export interface PickedLocation {
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  value: PickedLocation;
  onChange: (next: PickedLocation) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Center of Tanzania — the map's home position before a place is picked
const DEFAULT_CENTER: [number, number] = [-6.37, 34.89];
const DEFAULT_ZOOM = 5;
const PICKED_ZOOM = 14;

const NOMINATIM = "https://nominatim.openstreetmap.org";

// Red dot pin, as a divIcon so we don't depend on Leaflet's bundled png assets
const redDotIcon = L.divIcon({
  className: "map-red-dot-wrap",
  html: '<span class="map-red-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// "Buza, Temeke Municipal, Dar es Salaam, 15106, Tanzania" -> "Buza, Temeke Municipal, Dar es Salaam"
const shortName = (displayName: string) =>
  displayName.split(",").slice(0, 3).map((p) => p.trim()).join(", ");

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), PICKED_ZOOM));
  }, [map, lat, lng]);

  return null;
}

function ClickToPin({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

// Location combobox backed by OpenStreetMap's free Nominatim search, with a
// Leaflet map underneath: pick a suggestion, tap the map, or use device GPS —
// each drops the red pin and stores name + coordinates.
export default function LocationPicker({ value, onChange }: Props) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const skipNextSearch = useRef(false);

  const hasPin = value.latitude !== null && value.longitude !== null;

  // Debounced forward geocoding while the vendor types
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const term = value.location.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: term,
          format: "json",
          limit: "6",
          countrycodes: "tz",
        });
        const res = await fetch(`${NOMINATIM}/search?${params}`, {
          headers: { Accept: "application/json" },
        });
        setResults(res.ok ? await res.json() : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [value.location]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
      });
      const res = await fetch(`${NOMINATIM}/reverse?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.display_name ? shortName(data.display_name) : null;
    } catch {
      return null;
    }
  }, []);

  function pickResult(result: NominatimResult) {
    skipNextSearch.current = true;
    setResults([]);
    setNotice(null);
    onChange({
      location: shortName(result.display_name),
      latitude: Number(result.lat),
      longitude: Number(result.lon),
    });
  }

  const pinAt = useCallback(
    async (lat: number, lng: number) => {
      const name = await reverseGeocode(lat, lng);
      skipNextSearch.current = true;
      setNotice(null);
      onChange({
        location: name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        latitude: lat,
        longitude: lng,
      });
    },
    [onChange, reverseGeocode]
  );

  function useMyLocation() {
    if (!navigator.geolocation) {
      setNotice("Your browser does not support location access.");
      return;
    }

    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await pinAt(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setNotice("Could not get your location — allow location access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="location-picker">
      <div className="location-picker-row">
        <div className="location-picker-search">
          <HiMagnifyingGlass className="location-picker-search-icon" />
          <input
            className="input-text location-picker-input"
            type="text"
            placeholder="Search a place... e.g. Buza"
            value={value.location}
            autoComplete="off"
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onChange={(e) =>
              // Typing invalidates the previous pin until a place is picked
              onChange({ location: e.target.value, latitude: null, longitude: null })
            }
            required
          />
          {focused && value.location.trim().length >= 2 && (results.length > 0 || searching) && (
            <div className="search-suggestions">
              {searching && results.length === 0 ? (
                <div className="search-suggestion-empty">Searching map...</div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.place_id}
                    type="button"
                    className="search-suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickResult(r)}
                  >
                    <span className="search-suggestion-title">{shortName(r.display_name)}</span>
                    <span className="search-suggestion-meta">{r.display_name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="location-picker-gps-btn"
          onClick={useMyLocation}
          disabled={locating}
        >
          <HiMapPin />
          {locating ? "Locating..." : "Use my location"}
        </button>
      </div>

      {notice && <p className="catalog-picker-note" style={{ color: "#b42318" }}>{notice}</p>}
      <p className="catalog-picker-note">
        {hasPin
          ? "Pinned on the map — tap the map to fine-tune the exact spot."
          : "Pick a suggestion, tap the map, or use your location to drop the red pin."}
      </p>

      <div className="location-picker-map">
        <MapContainer
          center={hasPin ? [value.latitude as number, value.longitude as number] : DEFAULT_CENTER}
          zoom={hasPin ? PICKED_ZOOM : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPin onPick={pinAt} />
          {hasPin && (
            <>
              <FlyTo lat={value.latitude as number} lng={value.longitude as number} />
              <Marker
                position={[value.latitude as number, value.longitude as number]}
                icon={redDotIcon}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
