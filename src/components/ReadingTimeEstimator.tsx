import { type Component } from "solid-js";

export type ReadingTimeEstimatorProps = {
  content: string;
  wordsPerMinute?: number;
  class?: string;
};

export const ReadingTimeEstimator: Component<ReadingTimeEstimatorProps> = (
  props,
) => {
  const wordsPerMinute = () => props.wordsPerMinute || 200; // Average reading speed

  const calculateReadingTime = () => {
    // Remove HTML tags and extra whitespace
    const cleanText = props.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // Count words
    const wordCount = cleanText
      .split(" ")
      .filter((word) => word.length > 0).length;

    // Calculate reading time in minutes
    const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute());

    return readingTimeMinutes;
  };

  const formatReadingTime = () => {
    const minutes = calculateReadingTime();

    if (minutes < 1) {
      return "< 1 min read";
    } else if (minutes === 1) {
      return "1 min read";
    } else {
      return `${minutes} min read`;
    }
  };

  return (
    <span class={`text-sm text-muted-foreground ${props.class || ""}`}>
      <svg
        class="inline-block w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>
      {formatReadingTime()}
    </span>
  );
};

// Utility function to calculate reading time from raw content
export const calculateReadingTime = (
  content: string,
  wordsPerMinute: number = 200,
): number => {
  const cleanText = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = cleanText
    .split(" ")
    .filter((word) => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Utility function to format reading time
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) {
    return "< 1 min read";
  } else if (minutes === 1) {
    return "1 min read";
  } else {
    return `${minutes} min read`;
  }
};
