import { createSignal, onMount, onCleanup, type Component } from "solid-js";
import { FiArrowUp } from "solid-icons/fi";
import { cn } from "@/libs/cn";

export const ScrollToTopButton: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);

  const toggleVisibility = () => {
    if (typeof window === "undefined") return;

    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    if (typeof window === "undefined") return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  onMount(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("scroll", toggleVisibility);
    document.addEventListener("astro:page-load", toggleVisibility);

    onCleanup(() => {
      window.removeEventListener("scroll", toggleVisibility);
      document.removeEventListener("astro:page-load", toggleVisibility);
    });
  });

  return (
    <button
      onClick={scrollToTop}
      class={cn(
        "fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
        isVisible()
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
      aria-label="Scroll to top"
    >
      <FiArrowUp class="w-5 h-5" />
    </button>
  );
};
