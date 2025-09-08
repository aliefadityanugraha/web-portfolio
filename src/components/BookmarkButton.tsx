import { createSignal, onMount, type Component } from "solid-js";
import { FiBookmark } from "solid-icons/fi";
import { TbBookmark, TbBookmarkFilled } from "solid-icons/tb";
import { cn } from "@/libs/cn";
import { useToast } from "@/components/ToastProvider";

export type BookmarkButtonProps = {
  postId: string;
  postTitle: string;
  postUrl: string;
  class?: string;
  hideLabel?: boolean;
};

type BookmarkedPost = {
  id: string;
  title: string;
  url: string;
  bookmarkedAt: string;
};

export const BookmarkButton: Component<BookmarkButtonProps> = (props) => {
  const [isBookmarked, setIsBookmarked] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const { addToast } = useToast();

  const STORAGE_KEY = 'portfolio-bookmarks';

  // Load bookmark status from localStorage
  onMount(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    try {
      const bookmarks = localStorage.getItem(STORAGE_KEY);
      if (bookmarks) {
        const parsedBookmarks: BookmarkedPost[] = JSON.parse(bookmarks);
        const isCurrentPostBookmarked = parsedBookmarks.some(
          (bookmark) => bookmark.id === props.postId
        );
        setIsBookmarked(isCurrentPostBookmarked);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  });

  const toggleBookmark = async () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    setIsLoading(true);
    
    try {
      const bookmarks = localStorage.getItem(STORAGE_KEY);
      let parsedBookmarks: BookmarkedPost[] = bookmarks ? JSON.parse(bookmarks) : [];
      
      if (isBookmarked()) {
        // Remove bookmark
        parsedBookmarks = parsedBookmarks.filter(
          (bookmark) => bookmark.id !== props.postId
        );
        setIsBookmarked(false);
        
        addToast({
          type: "info",
          title: "Bookmark Removed",
          description: `"${props.postTitle}" has been removed from bookmarks`,
          duration: 3000
        });
      } else {
        // Add bookmark
        const newBookmark: BookmarkedPost = {
          id: props.postId,
          title: props.postTitle,
          url: props.postUrl,
          bookmarkedAt: new Date().toISOString(),
        };
        parsedBookmarks.push(newBookmark);
        setIsBookmarked(true);
        
        addToast({
          type: "success",
          title: "Bookmark Added",
          description: `"${props.postTitle}" has been added to bookmarks`,
          duration: 3000
        });
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedBookmarks));
      
      // Dispatch custom event for bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChanged', {
        detail: { postId: props.postId, isBookmarked: !isBookmarked() }
      }));
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading()}
      class={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        isBookmarked() && "bg-accent text-accent-foreground",
        props.class
      )}
      title={isBookmarked() ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked() ? (
        <TbBookmarkFilled class="w-4 h-4 text-yellow-500" />
      ) : (
        <TbBookmark class="w-4 h-4" />
      )}
      {!props.hideLabel && (
        <span class="hidden sm:inline">
          {isBookmarked() ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </button>
  );
};

// Utility functions for bookmark management
export const getBookmarks = (): BookmarkedPost[] => {
  try {
    const bookmarks = localStorage.getItem('portfolio-bookmarks');
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const clearAllBookmarks = (): void => {
  try {
    localStorage.removeItem('portfolio-bookmarks');
    window.dispatchEvent(new CustomEvent('bookmarksCleared'));
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
  }
};

export const exportBookmarks = (): string => {
  const bookmarks = getBookmarks();
  return JSON.stringify(bookmarks, null, 2);
};

export const importBookmarks = (bookmarksJson: string): boolean => {
  try {
    const bookmarks = JSON.parse(bookmarksJson);
    localStorage.setItem('portfolio-bookmarks', JSON.stringify(bookmarks));
    window.dispatchEvent(new CustomEvent('bookmarksImported'));
    return true;
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    return false;
  }
};