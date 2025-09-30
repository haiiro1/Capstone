import { createContext, useContext, useState, ReactNode } from "react";

interface LocationContextType {
  lat: string;
  lon: string;
  setLat: (lat: string) => void;
  setLon: (lon: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [lat, setLat] = useState("-33.45");
  const [lon, setLon] = useState("-70.66");

  return (
    <LocationContext.Provider value={{ lat, lon, setLat, setLon }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
};
