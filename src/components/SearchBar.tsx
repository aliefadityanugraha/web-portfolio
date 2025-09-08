import { Button } from "@/components/ui/button";
import { cn } from "@/libs/cn";
import { FiSearch, FiX } from "solid-icons/fi";
import { createSignal, type Component } from "solid-js";

export type SearchBarProps = {
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  class?: string;
};

export const SearchBar: Component<SearchBarProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isFocused, setIsFocused] = createSignal(false);

  const handleSearch = (e: Event) => {
    e.preventDefault();
    props.onSearch(searchQuery());
  };

  const handleClear = () => {
    setSearchQuery("");
    props.onClear?.();
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
    // Real-time search
    props.onSearch(target.value);
  };

  return (
    <form
      onSubmit={handleSearch}
      class={cn("relative flex items-center w-full max-w-md", props.class)}
    >
      <div
        class={cn(
          "relative flex items-center w-full rounded-md border border-input bg-background transition-colors",
          isFocused() && "ring-2 ring-ring ring-offset-2",
        )}
      >
        <FiSearch class="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={props.placeholder || "Search blogs..."}
          value={searchQuery()}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          class="flex h-10 w-full rounded-md bg-transparent pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {searchQuery() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            class="absolute right-1 h-8 w-8 hover:bg-accent hover:text-accent-foreground"
            aria-label="Clear search"
          >
            <FiX class="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
};
