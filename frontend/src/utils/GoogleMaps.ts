let googleMapsScriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    return Promise.reject(new Error("GOOGLE_API_KEY_MISSING"));
  }

  if (typeof window !== "undefined" && window.google && window.google.maps) {
    return Promise.resolve();
  }

  if (!googleMapsScriptLoadingPromise) {
    googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptLoadingPromise;
}
