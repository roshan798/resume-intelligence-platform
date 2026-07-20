"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const themes: Array<{
    value: Theme;
    label: string;
    icon: typeof Sun;
}> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
];

function isTheme(value: string | null): value is Theme {
    return value === "light" || value === "dark" || value === "system";
}

function applyTheme(theme: Theme) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && prefersDark),
    );
    document.documentElement.dataset.theme = theme;
}

function getThemeSnapshot(): Theme {
    const savedTheme = localStorage.getItem("theme");
    return isTheme(savedTheme) ? savedTheme : "system";
}

function getServerThemeSnapshot(): Theme {
    return "system";
}

function subscribeToTheme(onStoreChange: () => void) {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("theme-change", onStoreChange);
    return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("theme-change", onStoreChange);
    };
}

export function ThemeSwitcher() {
    const theme = useSyncExternalStore(
        subscribeToTheme,
        getThemeSnapshot,
        getServerThemeSnapshot,
    );

    useEffect(() => {
        applyTheme(theme);

        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = () => {
            if (theme === "system") applyTheme("system");
        };

        systemTheme.addEventListener("change", handleSystemChange);
        return () => systemTheme.removeEventListener("change", handleSystemChange);
    }, [theme]);

    function selectTheme(nextTheme: Theme) {
        localStorage.setItem("theme", nextTheme);
        window.dispatchEvent(new Event("theme-change"));
        applyTheme(nextTheme);
    }

    return (
        <div
            aria-label="Color theme"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full border bg-background/90 p-1 shadow-lg backdrop-blur"
            role="group"
        >
            {themes.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    type="button"
                    aria-label={`Use ${label.toLocaleLowerCase()} theme`}
                    aria-pressed={theme === value}
                    className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                    onClick={() => selectTheme(value)}
                >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                </button>
            ))}
        </div>
    );
}
