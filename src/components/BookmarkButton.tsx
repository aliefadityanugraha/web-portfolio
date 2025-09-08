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

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      if (typeof window === 'undefined' || typeof Storage === 'undefined') {
        return false;
      }
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Load bookmark status from localStorage
  onMount(() => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Bookmarks will not persist.');
      return;
    }
    
    try {
      const bookmarks = localStorage.getItem(STORAGE_KEY);
      if (bookmarks) {
        const parsedBookmarks: BookmarkedPost[] = JSON.parse(bookmarks);
        if (Array.isArray(parsedBookmarks)) {
          const isCurrentPostBookmarked = parsedBookmarks.some(
            (bookmark) => bookmark && bookmark.id === props.postId
          );
          setIsBookmarked(isCurrentPostBookmarked);
        }
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      addToast({
        type: "error",
        title: "Error Loading Bookmarks",
        description: "Failed to load saved bookmarks. Please try refreshing the page.",
        duration: 4000
      });
    }
  });

  const toggleBookmark = async () => {
    if (!isLocalStorageAvailable()) {
      addToast({
        type: "error",
        title: "Storage Not Available",
        description: "Bookmarks cannot be saved. Please check your browser settings.",
        duration: 4000
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const bookmarks = localStorage.getItem(STORAGE_KEY);
      let parsedBookmarks: BookmarkedPost[] = [];
      
      // Safely parse existing bookmarks
      if (bookmarks) {
        try {
          const parsed = JSON.parse(bookmarks);
          if (Array.isArray(parsed)) {
            parsedBookmarks = parsed.filter(bookmark => 
              bookmark && 
              typeof bookmark.id === 'string' && 
              typeof bookmark.title === 'string' && 
              typeof bookmark.url === 'string'
            );
          }
        } catch (parseError) {
          console.warn('Invalid bookmark data found, resetting bookmarks:', parseError);
          parsedBookmarks = [];
        }
      }
      
      const wasBookmarked = isBookmarked();
      
      if (wasBookmarked) {
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
        
        // Check for duplicates before adding
        const existingIndex = parsedBookmarks.findIndex(b => b.id === props.postId);
        if (existingIndex === -1) {
          parsedBookmarks.push(newBookmark);
        } else {
          parsedBookmarks[existingIndex] = newBookmark;
        }
        
        setIsBookmarked(true);
        
        addToast({
          type: "success",
          title: "Bookmark Added",
          description: `"${props.postTitle}" has been added to bookmarks`,
          duration: 3000
        });
      }
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedBookmarks));
      } catch (storageError) {
        console.error('Failed to save to localStorage:', storageError);
        // Revert the state change
        setIsBookmarked(wasBookmarked);
        addToast({
          type: "error",
          title: "Storage Error",
          description: "Failed to save bookmark. Storage may be full.",
          duration: 4000
        });
        return;
      }
      
      // Dispatch custom event for bookmark changes
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('bookmarkChanged', {
            detail: { postId: props.postId, isBookmarked: !wasBookmarked }
          }));
        } catch (eventError) {
          console.warn('Failed to dispatch bookmark event:', eventError);
        }
      }
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      addToast({
        type: "error",
        title: "Unexpected Error",
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
    if (typeof window === 'undefined' || typeof Storage === 'undefined') {
      return [];
    }
    
    const bookmarks = localStorage.getItem('portfolio-bookmarks');
    if (!bookmarks) return [];
    
    const parsed = JSON.parse(bookmarks);
    if (!Array.isArray(parsed)) return [];
    
    // Filter out invalid bookmarks
    return parsed.filter(bookmark => 
      bookmark && 
      typeof bookmark.id === 'string' && 
      typeof bookmark.title === 'string' && 
      typeof bookmark.url === 'string' &&
      typeof bookmark.bookmarkedAt === 'string'
    );
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const clearAllBookmarks = (): boolean => {
  try {
    if (typeof window === 'undefined' || typeof Storage === 'undefined') {
      console.warn('localStorage is not available');
      return false;
    }
    
    localStorage.removeItem('portfolio-bookmarks');
    
    try {
      window.dispatchEvent(new CustomEvent('bookmarksCleared'));
    } catch (eventError) {
      console.warn('Failed to dispatch bookmarksCleared event:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
};

export const exportBookmarks = (): string => {
  try {
    const bookmarks = getBookmarks();
    return JSON.stringify(bookmarks, null, 2);
  } catch (error) {
    console.error('Error exporting bookmarks:', error);
    return '[]';
  }
};

export const importBookmarks = (bookmarksJson: string): boolean => {
  try {
    if (typeof window === 'undefined' || typeof Storage === 'undefined') {
      console.warn('localStorage is not available');
      return false;
    }
    
    if (!bookmarksJson || typeof bookmarksJson !== 'string') {
      console.error('Invalid bookmarks data provided');
      return false;
    }
    
    const bookmarks = JSON.parse(bookmarksJson);
    
    if (!Array.isArray(bookmarks)) {
      console.error('Bookmarks data must be an array');
      return false;
    }
    
    // Validate and filter bookmarks
    const validBookmarks = bookmarks.filter(bookmark => 
      bookmark && 
      typeof bookmark.id === 'string' && 
      typeof bookmark.title === 'string' && 
      typeof bookmark.url === 'string' &&
      typeof bookmark.bookmarkedAt === 'string'
    );
    
    if (validBookmarks.length !== bookmarks.length) {
      console.warn(`Filtered out ${bookmarks.length - validBookmarks.length} invalid bookmarks`);
    }
    
    localStorage.setItem('portfolio-bookmarks', JSON.stringify(validBookmarks));
    
    try {
      window.dispatchEvent(new CustomEvent('bookmarksImported'));
    } catch (eventError) {
      console.warn('Failed to dispatch bookmarksImported event:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    return false;
  }
};