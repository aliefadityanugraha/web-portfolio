import { createSignal, type Component } from "solid-js";

export type CopyLinkButtonProps = {
  url?: string;
  text?: string;
  class?: string;
};

export const CopyLinkButton: Component<CopyLinkButtonProps> = (props) => {
  const [copied, setCopied] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  const copyToClipboard = async () => {
    if (isLoading()) return;
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      typeof document === "undefined"
    )
      return;

    setIsLoading(true);

    try {
      const urlToCopy = props.url || window.location.href;

      if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        await navigator.clipboard.writeText(urlToCopy);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = urlToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopied(true);

      // Reset copied state after 2 seconds
      if (typeof window !== "undefined") {
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      disabled={isLoading()}
      class={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${props.class || ""}`}
      title={copied() ? "Link copied!" : "Copy link"}
    >
      {copied() ? (
        <>
          <svg
            class="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          <span class="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <svg
            class={`w-4 h-4 ${isLoading() ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isLoading() ? (
              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            ) : (
              <>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </>
            )}
          </svg>
          <span>{props.text || "Copy Link"}</span>
        </>
      )}
    </button>
  );
};

// Utility function to copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};
