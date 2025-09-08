import { createSignal, createEffect, onMount, For } from "solid-js";
import { TbList } from "solid-icons/tb";

interface TOCItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface TableOfContentsProps {
  contentSelector?: string;
  minHeadings?: number;
  maxLevel?: number;
  className?: string;
}

export function TableOfContents(props: TableOfContentsProps) {
  const [tocItems, setTocItems] = createSignal<TOCItem[]>([]);
  const [activeId, setActiveId] = createSignal<string>("");
  const [isVisible, setIsVisible] = createSignal(false);
  const [isCollapsed, setIsCollapsed] = createSignal(false);

  const contentSelector = () =>
    props.contentSelector || ".content, .prose, article";
  const minHeadings = () => props.minHeadings || 3;
  const maxLevel = () => props.maxLevel || 4;

  // Generate TOC items from headings
  const generateTOC = () => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const contentElement = document.querySelector(contentSelector());
    if (!contentElement) return;

    const headings = contentElement.querySelectorAll(
      `h1, h2, h3${maxLevel() >= 4 ? ", h4" : ""}${maxLevel() >= 5 ? ", h5" : ""}${maxLevel() >= 6 ? ", h6" : ""}`,
    ) as NodeListOf<HTMLElement>;

    if (headings.length < minHeadings()) {
      setIsVisible(false);
      return;
    }

    const items: TOCItem[] = [];

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || "";

      // Generate or use existing ID
      let id = heading.id;
      if (!id) {
        id = `heading-${index}-${text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}`;
        heading.id = id;
      }

      items.push({
        id,
        text,
        level,
        element: heading,
      });
    });

    setTocItems(items);
    setIsVisible(items.length >= minHeadings());
  };

  // Scroll spy functionality
  const handleScroll = () => {
    const headings = tocItems().map((item) => item.element);
    const scrollPosition = window.scrollY + 100; // Offset for better UX

    let currentActiveId = "";

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading.offsetTop <= scrollPosition) {
        currentActiveId = heading.id;
        break;
      }
    }

    setActiveId(currentActiveId);
  };

  // Smooth scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Offset for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  // Initialize on mount
  onMount(() => {
    // Wait for content to be rendered
    setTimeout(() => {
      generateTOC();
    }, 500);

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // Re-generate TOC when content changes
  createEffect(() => {
    const observer = new MutationObserver(() => {
      generateTOC();
    });

    const contentElement = document.querySelector(contentSelector());
    if (contentElement) {
      observer.observe(contentElement, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  });

  // Get indentation class based on heading level
  const getIndentClass = (level: number) => {
    const baseLevel = Math.min(...tocItems().map((item) => item.level));
    const relativeLevel = level - baseLevel;

    switch (relativeLevel) {
      case 0:
        return "pl-0";
      case 1:
        return "pl-4";
      case 2:
        return "pl-8";
      case 3:
        return "pl-12";
      default:
        return "pl-16";
    }
  };

  return (
    <div
      class={`table-of-contents ${props.className || ""} ${!isVisible() ? "hidden" : ""}`}
    >
      <div class="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm max-h-96 overflow-y-auto">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TbList class="w-4 h-4" />
            Table of Contents
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed())}
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            title={isCollapsed() ? "Expand" : "Collapse"}
          >
            {isCollapsed() ? "▼" : "▲"}
          </button>
        </div>

        <nav class={`toc-nav ${isCollapsed() ? "hidden" : ""}`}>
          <ul class="space-y-1 text-sm">
            <For each={tocItems()}>
              {(item) => (
                <li class={getIndentClass(item.level)}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    class={`block w-full text-left py-1 px-2 rounded transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      activeId() === item.id
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    title={item.text}
                  >
                    <span class="line-clamp-2">{item.text}</span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </nav>

        {tocItems().length === 0 && (
          <p class="text-xs text-gray-500 dark:text-gray-400 italic">
            No headings found or content too short for TOC
          </p>
        )}
      </div>
    </div>
  );
}

// Utility component for floating TOC
export function FloatingTOC(props: TableOfContentsProps) {
  return (
    <div class="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden xl:block max-w-xs">
      <TableOfContents {...props} />
    </div>
  );
}

// Utility component for inline TOC (at the beginning of content)
export function InlineTOC(props: TableOfContentsProps) {
  return (
    <div class="mb-8 not-prose">
      <TableOfContents
        {...props}
        className="relative bg-gray-50 dark:bg-gray-800"
      />
    </div>
  );
}
