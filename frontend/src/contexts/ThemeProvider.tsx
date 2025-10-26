import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";
type Ctx = {
  theme: Theme;
  resolved: Resolved;
  setAndPersist: (t: Theme) => Promise<void>;
  toggle: () => void; // alterna light/dark (ignora 'system')
};

const ThemeContext = createContext<Ctx | null>(null);

function resolveTheme(t: Theme): Resolved {
  if (t === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "system");
  const [resolved, setResolved] = useState<Resolved>(resolveTheme(theme));
  const fetching = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", resolved);
  }, [resolved]);

  // Reacciona a cambios del sistema si theme === system
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") setResolved(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Carga preferencia del servidor si hay sesión
  useEffect(() => {
    const token = localStorage.getItem("pg_token");
    if (!token || fetching.current) return;
    fetching.current = true;
    api.get("/auth/me")
      .then((r) => {
        const serverTheme = (r.data?.theme as Theme | undefined) ?? null;
        if (serverTheme) {
          localStorage.setItem("theme", serverTheme);
          setTheme(serverTheme);
          setResolved(resolveTheme(serverTheme));
        }
      })
      .catch(() => {})
      .finally(() => (fetching.current = false));
  }, []);

  const setAndPersist = async (t: Theme) => {
    localStorage.setItem("theme", t);
    setTheme(t);
    setResolved(resolveTheme(t));
    try {
      await api.patch("/users/me/theme", { theme: t });
    } catch {
      // opcional: notificar el cambio
    }
  };

  const toggle = () => setAndPersist(resolved === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, resolved, setAndPersist, toggle }), [theme, resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
};