import { Button } from "@/components/ui/button";
import { cn } from "@/libs/cn";
import { FiMoon, FiSun } from "solid-icons/fi";
import { createEffect, createSignal, onMount } from "solid-js";

export const DarkModeToggle = () => {
  const [isDark, setIsDark] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

  // Check current theme state
  onMount(() => {
    if (
      typeof window === "undefined" ||
      typeof localStorage === "undefined" ||
      typeof document === "undefined"
    )
      return;

    const currentTheme = localStorage.getItem("theme") || "light";
    const isDarkMode = currentTheme === "dark";
    setIsDark(isDarkMode);
    setMounted(true);

    // Listen for Astro page transitions to maintain state
    const handlePageLoad = () => {
      const theme = localStorage.getItem("theme") || "light";
      setIsDark(theme === "dark");
    };

    document.addEventListener("astro:page-load", handlePageLoad);

    // Cleanup
    return () => {
      document.removeEventListener("astro:page-load", handlePageLoad);
    };
  });

  const applyTheme = (dark: boolean) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-kb-theme", "dark");
    } else {
      root.removeAttribute("data-kb-theme");
    }
  };

  createEffect(() => {
    if (
      mounted() &&
      typeof window !== "undefined" &&
      typeof localStorage !== "undefined"
    ) {
      const newTheme = isDark() ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      applyTheme(isDark());

      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "theme",
          newValue: newTheme,
          storageArea: localStorage,
        }),
      );
    }
  });

  const toggleTheme = () => {
    setIsDark(!isDark());
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      class={cn(
        "h-8 w-8 rounded-full transition-all duration-300",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label={isDark() ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted() ? (
        isDark() ? (
          <FiSun class="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <FiMoon class="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
        )
      ) : (
        <div class="h-4 w-4" /> // Placeholder to prevent layout shift
      )}
    </Button>
  );
};
