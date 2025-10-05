import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../utils/GoogleMaps";

export type AddressSelect = {
  lat: number;
  lon: number;
  address: string;
};

interface GoogleMapsProps {
  onSelect?: (sel: AddressSelect) => void;
}

export default function GoogleMaps({ onSelect }: GoogleMapsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await loadGoogleMaps();
        if (!mounted) return;
        if (!window.google || !inputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["geocode"],
            fields: ["formatted_address", "geometry"],
          }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place || !place.geometry) {
            onSelect?.({
              lat: NaN,
              lon: NaN,
              address: inputRef.current!.value || "",
            });
            return;
          }
          const lat = place.geometry.location.lat();
          const lon = place.geometry.location.lng();
          const address = place.formatted_address ?? inputRef.current!.value;
          onSelect?.({ lat, lon, address });
        });
      } catch (err) {
        console.error("Google Maps init error:", err);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Ingrese una dirección..."
      className="form-control mb-3"
    />
  );
}
