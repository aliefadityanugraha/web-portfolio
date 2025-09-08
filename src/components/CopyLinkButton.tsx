import { createSignal, type Component } from "solid-js";
import { useToast } from "@/components/ToastProvider";

export type CopyLinkButtonProps = {
  url?: string;
  text?: string;
  class?: string;
};

export const CopyLinkButton: Component<CopyLinkButtonProps> = (props) => {
  const [copied, setCopied] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const { addToast } = useToast();

  // Check if clipboard API is available
  const isClipboardAvailable = () => {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      (navigator.clipboard || document.execCommand)
    );
  };

  const copyToClipboard = async () => {
    if (isLoading()) return;
    
    if (!isClipboardAvailable()) {
      addToast({
        type: "error",
        title: "Copy Not Supported",
        description: "Your browser doesn't support copying to clipboard.",
        duration: 4000
      });
      return;
    }

    setIsLoading(true);

    try {
      const urlToCopy = props.url || (typeof window !== "undefined" ? window.location.href : "");
      
      if (!urlToCopy) {
        throw new Error("No URL to copy");
      }

      let copySuccess = false;

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(urlToCopy);
          copySuccess = true;
        } catch (clipboardError) {
          console.warn("Clipboard API failed, trying fallback:", clipboardError);
        }
      }

      // Fallback for older browsers or when clipboard API fails
      if (!copySuccess) {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = urlToCopy;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          textArea.style.opacity = "0";
          textArea.setAttribute("readonly", "");
          textArea.setAttribute("aria-hidden", "true");
          
          document.body.appendChild(textArea);
          
          // Select the text
          textArea.focus();
          textArea.select();
          textArea.setSelectionRange(0, 99999); // For mobile devices
          
          // Try to copy
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);
          
          if (!successful) {
            throw new Error("execCommand failed");
          }
          
          copySuccess = true;
        } catch (fallbackError) {
          console.error("Fallback copy method failed:", fallbackError);
        }
      }

      if (copySuccess) {
        setCopied(true);
        
        addToast({
          type: "success",
          title: "Link Copied!",
          description: "Link has been copied to clipboard",
          duration: 2000
        });

        // Reset copied state after 2 seconds
        if (typeof window !== "undefined") {
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        }
      } else {
        throw new Error("All copy methods failed");
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
      addToast({
        type: "error",
        title: "Copy Failed",
        description: "Could not copy link to clipboard. Please try again.",
        duration: 4000
      });
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
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided for copying');
      return false;
    }

    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      typeof document === "undefined"
    ) {
      console.warn('Browser environment not available for copying');
      return false;
    }

    let copySuccess = false;

    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copySuccess = true;
      } catch (clipboardError) {
        console.warn('Clipboard API failed, trying fallback:', clipboardError);
      }
    }

    // Fallback for older browsers or when clipboard API fails
    if (!copySuccess) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.setAttribute("readonly", "");
        textArea.setAttribute("aria-hidden", "true");
        
        document.body.appendChild(textArea);
        
        // Select the text
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        // Try to copy
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        
        if (successful) {
          copySuccess = true;
        }
      } catch (fallbackError) {
        console.error('Fallback copy method failed:', fallbackError);
      }
    }

    return copySuccess;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};
