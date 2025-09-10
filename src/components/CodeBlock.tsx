import { type Component, type JSX } from "solid-js";
import { cn } from "@/libs/cn";

export type CodeBlockProps = {
  children: JSX.Element;
  class?: string;
  language?: string;
};

// Simple Code component for displaying code blocks
export const Code: Component<CodeBlockProps> = (props) => {
  return (
    <pre
      class={cn(
        "relative rounded-lg bg-gray-100 dark:bg-gray-800 p-4 overflow-x-auto text-sm",
        props.class
      )}
    >
      <code class="text-gray-800 dark:text-gray-200">
        {props.children}
      </code>
    </pre>
  );
};

// Default export for backward compatibility
export default Code;