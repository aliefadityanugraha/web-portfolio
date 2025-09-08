import { createSignal, onMount, onCleanup, type Component } from "solid-js";
import { cn } from "@/libs/cn";

type ReadingProgressBarProps = {
  class?: string;
};

export const ReadingProgressBar: Component<ReadingProgressBarProps> = (
  props,
) => {
  const [progress, setProgress] = createSignal(0);
  const [isVisible, setIsVisible] = createSignal(false);

  const updateProgress = () => {
    if (typeof window === "undefined") return;

    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    setProgress(Math.min(Math.max(scrollPercent, 0), 100));

    // Show progress bar after scrolling 100px
    setIsVisible(scrollTop > 100);
  };

  onMount(() => {
    if (typeof window === "undefined") return;

    // Initial calculation
    updateProgress();

    // Add scroll listener
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    // Support for View Transitions
    document.addEventListener("astro:page-load", updateProgress);
  });

  onCleanup(() => {
    if (typeof window === "undefined") return;

    window.removeEventListener("scroll", updateProgress);
    window.removeEventListener("resize", updateProgress);
    document.removeEventListener("astro:page-load", updateProgress);
  });

  return (
    <div
      class={cn(
        "fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out",
        isVisible()
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full",
        props.class,
      )}
      style={{
        width: `${progress()}%`,
        "transform-origin": "left center",
      }}
    >
      {/* Glow effect */}
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-sm opacity-50" />

      {/* Progress indicator dot */}
      <div
        class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-purple-500 transition-all duration-300"
        style={{
          opacity: isVisible() ? 1 : 0,
          transform: `translateY(-50%) scale(${isVisible() ? 1 : 0.5})`,
        }}
      />
    </div>
  );
};

// Alternative minimal version without glow effects
export const ReadingProgressBarMinimal: Component<ReadingProgressBarProps> = (
  props,
) => {
  const [progress, setProgress] = createSignal(0);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    setProgress(Math.min(Math.max(scrollPercent, 0), 100));
  };

  onMount(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    document.addEventListener("astro:page-load", updateProgress);
  });

  onCleanup(() => {
    window.removeEventListener("scroll", updateProgress);
    window.removeEventListener("resize", updateProgress);
    document.removeEventListener("astro:page-load", updateProgress);
  });

  return (
    <div
      class={cn(
        "fixed top-0 left-0 z-40 h-0.5 bg-primary transition-all duration-150 ease-out",
        props.class,
      )}
      style={{
        width: `${progress()}%`,
      }}
    />
  );
};
