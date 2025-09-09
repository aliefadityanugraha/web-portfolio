import { type Component } from "solid-js";
import { FiShare2, FiTwitter, FiLinkedin, FiFacebook } from "solid-icons/fi";
import { SiWhatsapp } from "solid-icons/si";
import { cn } from "@/libs/cn";
import { useToast, ToastProvider } from "@/components/ToastProvider";

type SocialShareButtonsProps = {
  url: string;
  title: string;
  description?: string;
  class?: string;
  variant?: "default" | "compact" | "floating";
};

const SocialShareButtonsInner: Component<SocialShareButtonsProps> = (props) => {
  const { addToast } = useToast();

  const shareUrl = () => encodeURIComponent(props.url);
  const shareTitle = () => encodeURIComponent(props.title);

  const shareLinks = {
    twitter: () =>
      `https://twitter.com/intent/tweet?url=${shareUrl()}&text=${shareTitle()}`,
    linkedin: () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl()}`,
    facebook: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl()}`,
    whatsapp: () => `https://wa.me/?text=${shareTitle()}%20${shareUrl()}`,
  };

  const handleShare = (platform: string, url: string) => {
    window.open(
      url,
      "_blank",
      "width=600,height=400,scrollbars=yes,resizable=yes",
    );
    addToast({
      type: "success",
      title: "Shared!",
      description: `Content shared to ${platform}`,
      duration: 2000,
    });
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      addToast({
        type: "error",
        title: "Failed to copy",
        description: "Clipboard not available",
        duration: 3000,
      });
      return;
    }
    
    if (!props.url) {
      addToast({
        type: "error",
        title: "Failed to copy",
        description: "No URL provided to copy",
        duration: 3000,
      });
      return;
    }
    
    try {
      let copySuccess = false;
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(props.url);
          copySuccess = true;
        } catch (clipboardError) {
          console.warn('Clipboard API failed, trying fallback:', clipboardError);
        }
      }
      
      // Fallback for older browsers or when clipboard API fails
      if (!copySuccess && typeof document !== "undefined") {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = props.url;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          textArea.style.opacity = "0";
          textArea.setAttribute("readonly", "");
          textArea.setAttribute("aria-hidden", "true");
          
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          textArea.setSelectionRange(0, 99999);
          
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);
          
          if (successful) {
            copySuccess = true;
          }
        } catch (fallbackError) {
          console.error('Fallback copy method failed:', fallbackError);
        }
      }
      
      if (copySuccess) {
        addToast({
          type: "success",
          title: "Link Copied!",
          description: "Link has been copied to clipboard",
          duration: 2000,
        });
      } else {
        throw new Error('All copy methods failed');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      addToast({
        type: "error",
        title: "Failed to copy",
        description: "Could not copy link to clipboard. Please try again.",
        duration: 3000,
      });
    }
  };

  const isCompact = () => props.variant === "compact";
  const isFloating = () => props.variant === "floating";

  const buttonClass = () =>
    cn(
      "inline-flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-2 text-sm font-medium rounded-md transition-all duration-200 hover:scale-105",
      "min-w-[2.5rem] sm:min-w-auto", // Ensure minimum width on mobile for touch targets
      isCompact() && "px-2 py-1.5 text-xs",
      isFloating() && "shadow-lg hover:shadow-xl",
    );

  const iconClass = () => cn("w-4 h-4", isCompact() && "w-3.5 h-3.5");

  return (
    <div
      class={cn(
        "flex items-center gap-2",
        "flex-wrap sm:flex-nowrap", // Allow wrapping on small screens
        isFloating() && "flex-col",
        props.class,
      )}
    >
      {!isCompact() && (
        <span class="text-sm font-medium text-muted-foreground mr-2 hidden sm:block">
          Share:
        </span>
      )}
      <button
        onClick={() => handleShare("Twitter", shareLinks.twitter())}
        class={cn(buttonClass(), "bg-blue-500 hover:bg-blue-600 text-white")}
        title="Share on Twitter"
      >
        <FiTwitter class={iconClass()} />
        {!isCompact() && <span class="hidden sm:inline">Twitter</span>}
      </button>
      <button
        onClick={() => handleShare("LinkedIn", shareLinks.linkedin())}
        class={cn(buttonClass(), "bg-blue-700 hover:bg-blue-800 text-white")}
        title="Share on LinkedIn"
      >
        <FiLinkedin class={iconClass()} />
        {!isCompact() && <span class="hidden sm:inline">LinkedIn</span>}
      </button>
      <button
        onClick={() => handleShare("Facebook", shareLinks.facebook())}
        class={cn(buttonClass(), "bg-blue-600 hover:bg-blue-700 text-white")}
        title="Share on Facebook"
      >
        <FiFacebook class={iconClass()} />
        {!isCompact() && <span class="hidden sm:inline">Facebook</span>}
      </button>
      <button
        onClick={() => handleShare("WhatsApp", shareLinks.whatsapp())}
        class={cn(buttonClass(), "bg-green-500 hover:bg-green-600 text-white")}
        title="Share on WhatsApp"
      >
        <SiWhatsapp class={iconClass()} />
        {!isCompact() && <span class="hidden sm:inline">WhatsApp</span>}
      </button>
      <button
        onClick={handleCopyLink}
        class={cn(
          buttonClass(),
          "bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700",
        )}
        title="Copy link"
      >
        <FiShare2 class={iconClass()} />
        {!isCompact() && <span class="hidden sm:inline">Copy</span>}
      </button>
    </div>
  );
};

export const SocialShareButtons: Component<SocialShareButtonsProps> = (
  props,
) => {
  return (
    <ToastProvider>
      <SocialShareButtonsInner {...props} />
    </ToastProvider>
  );
};

// Floating Share Button (for blog posts)
export const FloatingSocialShare: Component<{
  url: string;
  title: string;
  description?: string;
}> = (props) => {
  return (
    <div class="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
      <ToastProvider>
        <SocialShareButtonsInner
          url={props.url}
          title={props.title}
          description={props.description}
          variant="floating"
          class="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 sm:p-3 shadow-lg"
        />
      </ToastProvider>
    </div>
  );
};
