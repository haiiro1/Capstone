import { useTheme } from "../contexts/ThemeProvider";

export default function ThemeToggleSwitch() {
  const { resolved, toggle } = useTheme();
  const checked = resolved === "dark";
  return (
    <div className="form-check form-switch m-0">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="themeSwitch"
        checked={checked}
        onChange={toggle}
        aria-label="Cambiar tema"
      />
      <label className="form-check-label ms-2 d-none d-sm-inline" htmlFor="themeSwitch">
        {checked ? "Oscuro" : "Claro"}
      </label>
    </div>
  );
}