import { useEffect, useState } from "react";
import { HiMagnifyingGlass, HiCheckCircle, HiPaperAirplane } from "react-icons/hi2";
import { useCatalog } from "../../../hooks/useCatalog";
import type { CatalogImage } from "../../../types/api.types";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

// Vendors don't upload photos — they pick one from the app's curated catalog.
// Searches that find nothing are logged for the admin, and the vendor can
// explicitly ask for the product to be added.
export default function CatalogImagePicker({ value, onChange }: Props) {
  const { searchImages, requestImage, loading, error } = useCatalog();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [images, setImages] = useState<CatalogImage[]>([]);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setRequestSent(false);
    searchImages(debounced).then(setImages);
  }, [debounced, searchImages]);

  async function handleRequest() {
    if (!debounced) return;
    const ok = await requestImage(debounced);
    if (ok) setRequestSent(true);
  }

  return (
    <div className="catalog-picker">
      <div className="catalog-picker-search">
        <HiMagnifyingGlass className="catalog-picker-search-icon" />
        <input
          className="input-text catalog-picker-input"
          type="text"
          placeholder="Search a picture... e.g. maharage, kuku, trekta"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="catalog-picker-note" style={{ color: "#b42318" }}>{error}</p>}

      {loading ? (
        <p className="catalog-picker-note">Loading pictures...</p>
      ) : images.length > 0 ? (
        <div className="catalog-picker-grid">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              className={`catalog-picker-item${value === img.url ? " catalog-picker-item-selected" : ""}`}
              onClick={() => onChange(value === img.url ? "" : img.url)}
              title={img.name}
            >
              <img src={img.url} alt={img.name} className="catalog-picker-img" loading="lazy" />
              <span className="catalog-picker-name">{img.name}</span>
              {value === img.url && <HiCheckCircle className="catalog-picker-check" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="catalog-picker-empty">
          <p className="catalog-picker-note">
            No picture found for "{debounced}". You can still create the listing without one.
          </p>
          {requestSent ? (
            <p className="catalog-picker-note" style={{ color: "#15803d" }}>
              Request sent — the app owner will add this product soon.
            </p>
          ) : (
            <button type="button" className="catalog-picker-request-btn" onClick={handleRequest}>
              <HiPaperAirplane />
              Ask the app owner to add "{debounced}"
            </button>
          )}
        </div>
      )}

      {value && (
        <p className="catalog-picker-note">
          Selected picture: <strong>{images.find((i) => i.url === value)?.name || value}</strong>
          {" — "}
          <button type="button" className="catalog-picker-clear" onClick={() => onChange("")}>
            remove
          </button>
        </p>
      )}
    </div>
  );
}
