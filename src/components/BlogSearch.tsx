import { SearchBar } from "@/components/SearchBar";
import { ReadingTimeEstimator } from "@/components/ReadingTimeEstimator";
import type { CollectionEntry } from "astro:content";
import { createSignal, createMemo, For, type Component } from "solid-js";

// BlogItem component to display individual blog entries
const BlogItem: Component<{ entry: CollectionEntry<"blog"> }> = (props) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <article class="group relative flex flex-col space-y-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {props.entry.data.categories?.[0] || "Blog"}
          </span>
          <time class="text-sm text-muted-foreground">
            {formatDate(props.entry.data.pubDate)}
          </time>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          <a
            href={`/blog/${props.entry.id}`}
            class="after:absolute after:inset-0"
            data-astro-prefetch="hover"
          >
            {props.entry.data.title}
          </a>
        </h3>

        {props.entry.data.description && (
          <p class="text-sm text-muted-foreground line-clamp-2">
            {props.entry.data.description}
          </p>
        )}

        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <div class="flex items-center space-x-4">
            {props.entry.data.categories &&
              props.entry.data.categories.length > 0 && (
                <div class="flex space-x-1">
                  {props.entry.data.categories.slice(0, 3).map((category) => (
                    <span class="rounded bg-secondary px-1.5 py-0.5">
                      {category}
                    </span>
                  ))}
                </div>
              )}
          </div>
          <ReadingTimeEstimator
            content={props.entry.body || ""}
            class="text-xs"
          />
        </div>
      </div>
    </article>
  );
};

export type BlogSearchProps = {
  blogEntries: CollectionEntry<"blog">[];
  class?: string;
};

export const BlogSearch: Component<BlogSearchProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal("");

  // Get all unique categories
  const categories = createMemo(() => {
    const allCategories = props.blogEntries
      .flatMap((entry) => entry.data.categories || [])
      .filter(Boolean);
    return [...new Set(allCategories)].sort();
  });

  // Filter blog entries based on search query and category
  const filteredEntries = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    const category = selectedCategory();

    return props.blogEntries.filter((entry) => {
      // Search filter
      const matchesSearch =
        !query ||
        entry.data.title.toLowerCase().includes(query) ||
        (entry.data.description || "").toLowerCase().includes(query) ||
        (entry.data.preview || "").toLowerCase().includes(query) ||
        (entry.data.categories || []).some((cat) =>
          cat.toLowerCase().includes(query),
        );

      // Category filter
      const matchesCategory =
        !category || (entry.data.categories || []).includes(category);

      return matchesSearch && matchesCategory;
    });
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory("");
  };

  const handleCategoryChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setSelectedCategory(target.value);
  };

  return (
    <div class={props.class}>
      {/* Search Controls */}
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClear}
          placeholder="Search blogs by title, description, or category..."
          class="flex-1"
        />

        {/* Category Filter */}
        <select
          value={selectedCategory()}
          onChange={handleCategoryChange}
          class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All Categories</option>
          <For each={categories()}>
            {(category) => <option value={category}>{category}</option>}
          </For>
        </select>
      </div>

      {/* Search Results */}
      <div class="space-y-4">
        {/* Results Count */}
        <div class="text-sm text-muted-foreground">
          {filteredEntries().length === props.blogEntries.length
            ? `Showing all ${filteredEntries().length} blogs`
            : `Found ${filteredEntries().length} of ${props.blogEntries.length} blogs`}
        </div>

        {/* Blog Entries */}
        {filteredEntries().length > 0 ? (
          <div class="flex flex-col gap-3">
            <For each={filteredEntries()}>
              {(entry) => <BlogItem entry={entry} />}
            </For>
          </div>
        ) : (
          <div class="text-center py-12">
            <div class="text-muted-foreground mb-2">
              {searchQuery() || selectedCategory()
                ? "No blogs found matching your search criteria"
                : "No blogs available"}
            </div>
            {(searchQuery() || selectedCategory()) && (
              <button
                onClick={handleClear}
                class="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
