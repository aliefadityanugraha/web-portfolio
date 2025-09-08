import { createSignal, onMount, type Component } from "solid-js";
import { TbBookmarkFilled } from "solid-icons/tb";

export const BookmarkIndicator: Component<{
  postId: string;
  class?: string;
}> = (props) => {
  const [isBookmarked, setIsBookmarked] = createSignal(false);
  const STORAGE_KEY = "portfolio-bookmarks";

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: Array<{ id: string }> = JSON.parse(raw);
      setIsBookmarked(list.some((b) => b.id === props.postId));
      window.addEventListener("bookmarkChanged", (e: any) => {
        if (e?.detail?.postId === props.postId) {
          setIsBookmarked(e.detail.isBookmarked);
        }
      });
    } catch {}
  });

  return (
    <span class={props.class} title={isBookmarked() ? "Bookmarked" : ""}>
      {isBookmarked() && <TbBookmarkFilled class="w-4 h-4 text-yellow-500" />}
    </span>
  );
};
