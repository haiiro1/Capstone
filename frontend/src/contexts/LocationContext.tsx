import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

type LocationState = {
  address: string | null;
  lat: number | null;
  lon: number | null;
};

type LocationContextType = LocationState & {
  setAddress: (addr: string | null) => void;
  setCoords: (lat: number | null, lon: number | null) => void;
  setLocation: (partial: Partial<LocationState>) => void;
  clearLocation: () => void;
};

const LS_KEY = "plantguard:location:v1";
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>(() => {
    if (typeof window === "undefined")
      return { address: null, lat: null, lon: null };
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return { address: null, lat: null, lon: null };
      const parsed = JSON.parse(raw);
      return {
        address: parsed?.address ?? null,
        lat: typeof parsed?.lat === "number" ? parsed.lat : null,
        lon: typeof parsed?.lon === "number" ? parsed.lon : null,
      };
    } catch (err) {
      console.error("parsing_location_error:", err);
      return { address: null, lat: null, lon: null };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("failed_ls_loc_save", err);
    }
  }, [state]);

  const setAddress = useCallback((address: string | null) => {
    setState((s) => ({ ...s, address }));
  }, []);

  const setCoords = useCallback((lat: number | null, lon: number | null) => {
    setState((s) => ({ ...s, lat, lon }));
  }, []);

  const setLocation = useCallback((partial: Partial<LocationState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  const clearLocation = useCallback(() => {
    setState({ address: null, lat: null, lon: null });
  }, []);

  return (
    <LocationContext.Provider
      value={{ ...state, setAddress, setCoords, setLocation, clearLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation not inside LocationProvider");
  }
  return ctx;
}
