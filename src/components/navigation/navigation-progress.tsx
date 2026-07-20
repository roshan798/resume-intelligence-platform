"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousRoute = useRef(`${pathname}?${searchParams.toString()}`);
    const currentRoute = `${pathname}?${searchParams.toString()}`;

    useEffect(() => {
        if (previousRoute.current === currentRoute) return;
        previousRoute.current = currentRoute;
        if (!isNavigating) return;

        completionTimer.current = setTimeout(() => {
            setIsNavigating(false);
        }, 180);

        return () => {
            if (completionTimer.current) clearTimeout(completionTimer.current);
        };
    }, [currentRoute, isNavigating]);

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target = event.target;
            if (!(target instanceof Element)) return;

            const anchor = target.closest("a");
            if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

            const destination = new URL(anchor.href, window.location.href);
            if (destination.origin !== window.location.origin) return;

            const current = new URL(window.location.href);
            const isSameDestination =
                destination.pathname === current.pathname &&
                destination.search === current.search;

            if (isSameDestination) return;
            setIsNavigating(true);
        }

        function handleHistoryNavigation() {
            setIsNavigating(true);
        }

        document.addEventListener("click", handleClick, true);
        window.addEventListener("popstate", handleHistoryNavigation);

        return () => {
            document.removeEventListener("click", handleClick, true);
            window.removeEventListener("popstate", handleHistoryNavigation);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className={`navigation-progress ${isNavigating ? "navigation-progress-active" : ""}`}
        >
            <span />
        </div>
    );
}
