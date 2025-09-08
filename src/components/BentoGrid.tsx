import { cn } from "@/libs/cn";
import type { Component, ComponentProps, JSX } from "solid-js";
import { Skeleton } from "./ui/skeleton";

export const BentoGrid: Component<ComponentProps<"div">> = (props) => {
  return (
    <div
      class={cn(
        "grid sm:auto-rows-[18rem] grid-cols-1 sm:grid-cols-3 gap-4 max-w-7xl mx-auto",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
};

export type BentoGridItemProps = {
  class?: string;
  isPlaceHolder?: boolean;
  icon?: JSX.Element;
  title?: string | JSX.Element;
  description?: string | JSX.Element;
  header?: JSX.Element;
  footer?: JSX.Element;
};

export const BentoGridItem: Component<BentoGridItemProps> = (props) => {
  return (
    <div
      class={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        props.isPlaceHolder && "hidden sm:flex",
        props.class,
      )}
    >
      {props.header}
      <div class="group-hover/bento:translate-x-2 transition duration-200">
        <div class="font-sans font-bold text-foreground mb-2 mt-2 flex items-center gap-2">
          {props.title}
          {props.icon}
        </div>
        <div class="font-sans font-normal text-muted-foreground text-xs">
          {props.description}
        </div>
        {props.footer}
      </div>
    </div>
  );
};

export const BentoSkeleton: BentoGridItemProps = {
  isPlaceHolder: true,
  header: <Skeleton class="w-full h-full m-auto bg-muted" />,
  title: <Skeleton class="w-24 h-4 bg-muted" />,
  description: <Skeleton class="w-full h-4 bg-muted" />,
  class: "bg-card",
};

export const BentoSkeletonWide: BentoGridItemProps = {
  isPlaceHolder: true,
  header: <Skeleton class="w-full h-full m-auto bg-muted" />,
  title: <Skeleton class="w-24 h-4 bg-muted" />,
  description: <Skeleton class="w-full h-4 bg-muted" />,
  class: "bg-card sm:col-span-2",
};
