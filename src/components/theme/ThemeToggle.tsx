"use client";

import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

export const THEME_TOGGLE_ID = "cinemergence-theme-toggle";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Même pattern iOS que le burger : label + checkbox native `.native-touch-control`.
 * Aucun handler React — le script du layout écoute le `change` et bascule `html.dark`.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  return (
    <label
      className={cn(
        "theme-icon-toggle relative inline-flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-noir-secondary text-or-light",
        "select-none [-webkit-tap-highlight-color:transparent]",
        "hover:bg-noir-tertiary",
        className,
      )}
    >
      <input
        id={THEME_TOGGLE_ID}
        type="checkbox"
        className="native-touch-control"
        aria-label="Basculer mode jour / nuit"
      />
      <span className="pointer-events-none relative z-0 flex items-center justify-center" aria-hidden>
        <Sun className="theme-icon-sun h-5 w-5" />
        <Moon className="theme-icon-moon h-5 w-5" />
      </span>
    </label>
  );
}

export function setTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("cinemergence-theme", theme);
  } catch {
    // ignore
  }
  const input = document.getElementById(THEME_TOGGLE_ID) as HTMLInputElement | null;
  if (input) input.checked = theme === "dark";
}
