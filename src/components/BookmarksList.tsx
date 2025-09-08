import {
  createSignal,
  onMount,
  onCleanup,
  For,
  Show,
  type Component,
} from "solid-js";
import { FiTrash2, FiDownload, FiUpload, FiExternalLink } from "solid-icons/fi";
import { TbBookmark } from "solid-icons/tb";
import {
  getBookmarks,
  clearAllBookmarks,
  exportBookmarks,
  importBookmarks,
} from "./BookmarkButton";

type BookmarkedPost = {
  id: string;
  title: string;
  url: string;
  bookmarkedAt: string;
};

export const BookmarksList: Component = () => {
  const [bookmarks, setBookmarks] = createSignal<BookmarkedPost[]>([]);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [sortBy, setSortBy] = createSignal<"date" | "title">("date");

  // Load bookmarks on mount
  onMount(() => {
    loadBookmarks();

    // Listen for bookmark changes
    const handleBookmarkChange = () => {
      loadBookmarks();
    };

    window.addEventListener("bookmarkChanged", handleBookmarkChange);
    window.addEventListener("bookmarksCleared", handleBookmarkChange);
    window.addEventListener("bookmarksImported", handleBookmarkChange);

    onCleanup(() => {
      window.removeEventListener("bookmarkChanged", handleBookmarkChange);
      window.removeEventListener("bookmarksCleared", handleBookmarkChange);
      window.removeEventListener("bookmarksImported", handleBookmarkChange);
    });
  });

  const loadBookmarks = () => {
    const savedBookmarks = getBookmarks();
    setBookmarks(savedBookmarks);
  };

  const filteredAndSortedBookmarks = () => {
    let filtered = bookmarks();

    // Filter by search term
    if (searchTerm()) {
      filtered = filtered.filter((bookmark) =>
        bookmark.title.toLowerCase().includes(searchTerm().toLowerCase()),
      );
    }

    // Sort bookmarks
    filtered.sort((a, b) => {
      if (sortBy() === "date") {
        return (
          new Date(b.bookmarkedAt).getTime() -
          new Date(a.bookmarkedAt).getTime()
        );
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear all bookmarks? This action cannot be undone.",
      )
    ) {
      clearAllBookmarks();
    }
  };

  const handleExport = () => {
    const bookmarksJson = exportBookmarks();
    const blob = new Blob([bookmarksJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importBookmarks(content)) {
            alert("Bookmarks imported successfully!");
          } else {
            alert("Error importing bookmarks. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div class="space-y-6">
      {/* Controls */}
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* Sort */}
          <select
            value={sortBy()}
            onChange={(e) =>
              setSortBy(e.currentTarget.value as "date" | "title")
            }
            class="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {/* Actions */}
        <div class="flex gap-2">
          <button
            onClick={handleExport}
            disabled={bookmarks().length === 0}
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export bookmarks"
          >
            <FiDownload class="w-4 h-4" />
            <span class="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleImport}
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Import bookmarks"
          >
            <FiUpload class="w-4 h-4" />
            <span class="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={bookmarks().length === 0}
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear all bookmarks"
          >
            <FiTrash2 class="w-4 h-4" />
            <span class="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* Bookmarks count */}
      <div class="text-sm text-muted-foreground">
        {filteredAndSortedBookmarks().length} bookmark
        {filteredAndSortedBookmarks().length !== 1 ? "s" : ""}
        {searchTerm() && ` matching "${searchTerm()}"`}
      </div>

      {/* Bookmarks list */}
      <Show
        when={filteredAndSortedBookmarks().length > 0}
        fallback={
          <div class="text-center py-12">
            <TbBookmark class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 class="text-lg font-semibold mb-2">
              {searchTerm() ? "No bookmarks found" : "No bookmarks yet"}
            </h4>
            <p class="text-muted-foreground">
              {searchTerm()
                ? "Try adjusting your search terms"
                : "Start bookmarking blog posts to see them here"}
            </p>
          </div>
        }
      >
        <div class="grid gap-4">
          <For each={filteredAndSortedBookmarks()}>
            {(bookmark) => (
              <div class="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-card-foreground mb-2 line-clamp-2">
                      {bookmark.title}
                    </h4>
                    <div class="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Bookmarked {formatDate(bookmark.bookmarkedAt)}
                      </span>
                    </div>
                  </div>
                  <a
                    href={bookmark.url}
                    class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex-shrink-0"
                    title="Read post"
                  >
                    <FiExternalLink class="w-4 h-4" />
                    <span class="hidden sm:inline">Read</span>
                  </a>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
