import { cva } from "class-variance-authority";

export const buttonRecipe = {
  button: cva(
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-(--button-radius) font-medium transition-colors duration-(--dur-fast) focus-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    {
      variants: {
        variant: {
          solid: "bg-(--t) text-(color:--t-solid-fg) hover:bg-(--t-hover)",
          soft: "bg-(--t-subtle) text-(color:--t-fg) hover:bg-[color-mix(in_srgb,var(--t)_16%,var(--t-subtle))]",
          outline: "border border-(color:--t-border) bg-bg-raised text-(color:--t-fg) hover:bg-(--t-subtle)",
          ghost: "text-(color:--t-fg) hover:bg-(--t-subtle)",
          link: "text-(color:--t-fg) underline-offset-4 hover:underline",
        },
        size: {
          sm: "h-(--button-height-sm) px-(--button-px-sm) text-sm",
          md: "h-(--button-height-md) px-(--button-px-md) text-sm",
          lg: "h-(--button-height-lg) px-(--button-px-lg) text-base",
        },
        iconOnly: { true: "px-0", false: "" },
        fullWidth: { true: "w-full", false: "" },
      },
      compoundVariants: [
        { iconOnly: true, size: "sm", class: "w-(--button-height-sm)" },
        { iconOnly: true, size: "md", class: "w-(--button-height-md)" },
        { iconOnly: true, size: "lg", class: "w-(--button-height-lg)" },
        { variant: "link", class: "h-auto px-0" },
      ],
      defaultVariants: { variant: "solid", size: "md", iconOnly: false, fullWidth: false },
    },
  ),
  group: cva("inline-flex", {
    variants: {
      orientation: { horizontal: "flex-row", vertical: "flex-col" },
      attached: { true: "", false: "gap-2" },
    },
    compoundVariants: [
      { attached: true, orientation: "horizontal", class: "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:focus-visible]:z-10 [&>*:hover]:z-10" },
      { attached: true, orientation: "vertical", class: "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:focus-visible]:z-10 [&>*:hover]:z-10" },
    ],
    defaultVariants: { orientation: "horizontal", attached: true },
  }),
};
