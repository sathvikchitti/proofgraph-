/**
 * Hex skin: recipe overrides on top of the token layer (tokens/skins/hex). Most of the look is tokens (paper, ink, violet,
 * hairlines, radii, shadows, fonts); recipes here change what tokens cannot: the blush CTA, mono data labels, display type.
 * Every override keeps the default recipe's variant keys and part names. Multi-part recipes spread the default and replace parts.
 */
import { cva } from "class-variance-authority";
import type { Skin } from "../types";
import { buttonRecipe } from "../../ui/button/button.recipe";
import { badgeRecipe } from "../../ui/badge/badge.recipe";
import { cardRecipe } from "../../ui/card/card.recipe";
import { tabsRecipe } from "../../ui/tabs/tabs.recipe";
import { statCardRecipe } from "../../ui/stat-card/stat-card.recipe";
import { chartCardRecipe } from "../../ui/chart-card/chart-card.recipe";
import { segmentedControlRecipe } from "../../ui/segmented-control/segmented-control.recipe";
import { tagRecipe } from "../../ui/tag/tag.recipe";
import { kbdRecipe } from "../../ui/kbd/kbd.recipe";
import { progressRecipe } from "../../ui/progress/progress.recipe";
import { alertRecipe } from "../../ui/alert/alert.recipe";
import { dataTableRecipe } from "../../ui/data-table/data-table.recipe";
import { descriptionListRecipe } from "../../ui/description-list/description-list.recipe";
import { emptyStateRecipe } from "../../ui/empty-state/empty-state.recipe";
import { stepperRecipe } from "../../ui/stepper/stepper.recipe";
import { dialogRecipe } from "../../ui/dialog/dialog.recipe";
import { timelineRecipe } from "../../ui/timeline/timeline.recipe";
import { pageHeaderRecipe } from "../../layout/page-header/page-header.recipe";
import { appShellRecipe } from "../../layout/app-shell/app-shell.recipe";
import { workspaceSwitcherRecipe } from "../../blocks/workspace-switcher/workspace-switcher.recipe";
import { marketingRecipe } from "../../blocks/marketing/marketing.recipe";
import { authCardRecipe } from "../../ui/auth-card/auth-card.recipe";
import { errorPageRecipe } from "../../ui/error-page/error-page.recipe";

/** Small mono caption used for labels and column heads across hex-ui. */
const monoLabel = "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.06em]";

const button = {
  ...buttonRecipe,
  button: cva(
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-(--button-radius) border font-medium transition-colors duration-(--dur-fast) focus-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 data-handles:selection-handles",
    {
      variants: {
        variant: {
          // Accent solid is the blush CTA with an ink hairline; every other tone stays a flat solid.
          solid:
            "border-(color:--t) bg-(--t) text-(color:--t-solid-fg) hover:bg-(--t-hover) data-[tone=accent]:border-(color:--cta-border) data-[tone=accent]:bg-(--cta-bg) data-[tone=accent]:text-(color:--cta-fg) data-[tone=accent]:hover:bg-(--cta-bg-hover)",
          soft: "border-transparent bg-(--t-subtle) text-(color:--t-fg) hover:bg-[color-mix(in_srgb,var(--t)_16%,var(--t-subtle))]",
          // Outline: ink hairline on accent, tone hairline elsewhere.
          outline:
            "border-(color:--t-border) bg-bg-raised text-(color:--t-fg) hover:bg-(--t-subtle) data-[tone=accent]:border-(color:--border-ink) data-[tone=accent]:text-fg data-[tone=accent]:hover:bg-bg-hover",
          ghost: "border-transparent text-(color:--t-fg) hover:bg-bg-hover data-[tone=accent]:text-fg",
          link: "border-transparent text-(color:--t-fg) underline-offset-4 hover:underline",
        },
        size: {
          sm: "h-(--button-height-sm) px-(--button-px-sm) text-[0.8125rem]",
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
};

/** Display type: expanded Archivo for large sizes, and <em> turns into the serif italic accent. */
const headingAccent = "[&_em]:font-(family-name:--font-serif) [&_em]:font-normal [&_em]:italic [&_em]:tracking-normal [&_em]:[font-stretch:100%]";
const headingRecipe = cva(`font-semibold text-fg ${headingAccent}`, {
  variants: {
    size: {
      sm: "text-base leading-snug tracking-tight",
      md: "text-lg leading-snug tracking-tight",
      lg: "font-(family-name:--font-display) text-xl leading-tight tracking-[-0.02em] [font-stretch:112%]",
      xl: "font-(family-name:--font-display) text-2xl leading-[1.08] tracking-[-0.03em] [font-stretch:118%]",
      "2xl": "font-(family-name:--font-display) text-3xl leading-[1.08] tracking-[-0.03em] [font-stretch:118%] sm:text-4xl",
    },
    muted: { true: "text-fg-muted", false: "" },
  },
  defaultVariants: { size: "lg", muted: false },
});

const badge = {
  ...badgeRecipe,
  badge: cva("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--badge-radius) border font-mono font-medium uppercase tracking-[0.04em]", {
    variants: {
      variant: {
        subtle: "border-(color:--t-border) bg-(--t-subtle) text-(color:--t-fg)",
        solid: "border-transparent bg-(--t) text-(color:--t-solid-fg)",
        outline: "border-(color:--t-border) bg-transparent text-(color:--t-fg)",
      },
      size: { sm: "h-5 px-1.5 text-[0.625rem]", md: "h-6 px-2 text-[0.6875rem]", lg: "h-7 px-2.5 text-xs" },
    },
    defaultVariants: { variant: "subtle", size: "md" },
  }),
};

const card = {
  ...cardRecipe,
  card: cva("flex min-w-0 flex-col rounded-(--card-radius) border text-fg", {
    variants: {
      variant: {
        outline: "border-border bg-bg-raised",
        raised: "border-transparent bg-bg-raised shadow-float",
        sunken: "border-transparent bg-bg-subtle",
      },
      interactive: {
        true: "cursor-pointer transition-colors duration-(--dur-fast) hover:border-border-strong hover:bg-bg-hover focus-ring",
        false: "",
      },
    },
    defaultVariants: { variant: "outline", interactive: false },
  }),
  footer: cva("flex items-center justify-end gap-2 border-t border-border px-(--card-padding) py-3"),
};

const tabs = {
  ...tabsRecipe,
  list: cva("flex max-w-full shrink-0 overflow-x-auto", {
    variants: {
      variant: {
        underline: "gap-5 border-b border-border",
        pill: "w-fit gap-0.5",
      },
    },
    defaultVariants: { variant: "underline" },
  }),
  trigger: cva(
    "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-medium text-fg-muted transition-colors duration-(--dur-fast) hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-fg",
    {
      variants: {
        variant: {
          underline: "-mb-px border-b-2 border-transparent px-0.5 data-[state=active]:border-(color:--accent)",
          pill: "rounded-control hover:bg-bg-hover data-[state=active]:bg-accent-subtle data-[state=active]:text-accent-fg",
        },
        size: { sm: "text-xs", md: "text-sm", lg: "text-base" },
      },
      compoundVariants: [
        { variant: "underline", size: "sm", class: "py-1.5" },
        { variant: "underline", size: "md", class: "py-2.5" },
        { variant: "underline", size: "lg", class: "py-3" },
        { variant: "pill", size: "sm", class: "h-6 px-2" },
        { variant: "pill", size: "md", class: "h-8 px-3" },
        { variant: "pill", size: "lg", class: "h-10 px-4" },
      ],
      defaultVariants: { variant: "underline", size: "md" },
    },
  ),
  count: cva("tabular rounded-chip bg-bg-active px-1.5 font-mono text-[0.6875rem] font-medium text-fg-muted"),
};

/** KPI: mono caption, display-weight value. */
const statCard = {
  ...statCardRecipe,
  label: cva(`truncate ${monoLabel}`),
  value: cva("tabular font-(family-name:--font-display) font-bold leading-none tracking-[-0.03em] text-fg [font-stretch:112%]", {
    variants: { size: { sm: "text-xl", md: "text-3xl", lg: "text-4xl" } },
    defaultVariants: { size: "md" },
  }),
  delta: cva("tabular inline-flex items-center gap-1 font-mono text-xs font-medium text-(color:--t-fg)"),
};

const chartCard = {
  ...chartCardRecipe,
  title: cva("text-sm font-semibold leading-snug text-fg"),
  toolButton: cva(
    "inline-flex size-8 items-center justify-center rounded-control border border-border text-fg-muted transition-colors hover:bg-bg-hover hover:text-fg focus-ring aria-pressed:border-(color:--accent-border) aria-pressed:bg-accent-subtle aria-pressed:text-accent-fg",
  ),
  th: cva(`sticky top-0 border-b border-border bg-bg-subtle px-3 py-2 text-left ${monoLabel} text-fg-muted`, {
    variants: { align: { left: "text-left", right: "text-right" } },
    defaultVariants: { align: "left" },
  }),
};

const segmentedControl = {
  ...segmentedControlRecipe,
  root: cva("inline-flex max-w-full items-center gap-0.5 rounded-control border border-border bg-bg-raised p-0.5", {
    variants: { fullWidth: { true: "flex w-full", false: "" } },
    defaultVariants: { fullWidth: false },
  }),
  item: cva(
    "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-chip font-medium text-fg-muted transition-colors duration-(--dur-fast) hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-subtle data-[state=on]:text-accent-fg",
    {
      variants: { size: { sm: "h-6 px-2 text-xs", md: "h-8 px-3 text-sm", lg: "h-10 px-4 text-base" } },
      defaultVariants: { size: "md" },
    },
  ),
};

const tag = {
  ...tagRecipe,
  root: cva("inline-flex max-w-full items-center gap-1 rounded-chip border font-mono font-medium transition-colors duration-(--dur-fast)", {
    variants: {
      variant: {
        subtle: "border-(color:--t-border) bg-(--t-subtle) text-(color:--t-fg)",
        outline: "border-(color:--t-border) bg-transparent text-(color:--t-fg)",
      },
      size: { sm: "h-6 pl-2 pr-2 text-[0.6875rem]", md: "h-7 pl-2.5 pr-2.5 text-xs", lg: "h-8 pl-3 pr-3 text-[0.8125rem]" },
      selected: { true: "border-(color:--t) bg-(--t) text-(color:--t-solid-fg)", false: "" },
      disabled: { true: "pointer-events-none opacity-50", false: "" },
      removable: { true: "pr-1", false: "" },
    },
    defaultVariants: { variant: "subtle", size: "md", selected: false, disabled: false, removable: false },
  }),
};

const kbd = {
  ...kbdRecipe,
  kbd: cva("inline-flex items-center justify-center rounded-chip border border-border-strong bg-bg-raised font-mono font-medium text-fg-muted", {
    variants: { size: { sm: "h-5 min-w-5 px-1 text-[0.6875rem]", md: "h-6 min-w-6 px-1.5 text-xs", lg: "h-7 min-w-7 px-2 text-sm" } },
    defaultVariants: { size: "md" },
  }),
};

const progress = {
  ...progressRecipe,
  track: cva("relative w-full overflow-hidden rounded-chip bg-bg-active", {
    variants: { size: { sm: "h-1", md: "h-1.5", lg: "h-2.5" } },
    defaultVariants: { size: "md" },
  }),
  indicator: cva("h-full w-full rounded-chip bg-(--t) transition-transform duration-(--dur) ease-out", {
    variants: { indeterminate: { true: "origin-left animate-indeterminate motion-reduce:w-1/3 motion-reduce:animate-none motion-reduce:translate-x-0", false: "" } },
    defaultVariants: { indeterminate: false },
  }),
};

/** Callout keeps the 4px tone edge but sits on a raised surface. */
const alert = {
  ...alertRecipe,
  root: cva("relative flex w-full gap-3 rounded-control border p-3 text-sm", {
    variants: {
      variant: {
        subtle: "border-(color:--t-border) bg-(--t-subtle)",
        outline: "border-(color:--t-border) bg-bg-raised",
        callout: "rounded-l-none border-y-0 border-r-0 border-l-4 border-(color:--t) bg-bg-raised",
      },
    },
    defaultVariants: { variant: "subtle" },
  }),
};

/** Hexagon silhouette (the hex-ui icon badge shape), applied by clip-path so any square icon box can wear it. */
const hexagon = "[clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]";

const dataTable = {
  ...dataTableRecipe,
  head: cva(`sticky top-0 z-10 bg-bg-subtle ${monoLabel} text-fg-muted`),
};

const descriptionList = {
  ...descriptionListRecipe,
  term: cva("font-mono text-xs text-fg-muted"),
};

const emptyState = {
  ...emptyStateRecipe,
  root: cva("flex w-full min-w-0 flex-col items-center justify-center text-center", {
    variants: {
      size: { sm: "gap-1.5 px-4 py-6", md: "gap-2 px-6 py-10", lg: "gap-3 px-8 py-16" },
      bordered: { true: "rounded-card border border-dashed border-(color:--guide-dash)", false: "" },
    },
    defaultVariants: { size: "md", bordered: false },
  }),
  icon: cva(`mb-1 flex items-center justify-center bg-(--badge-fill) text-(color:--badge-icon) ${hexagon}`, {
    variants: { size: { sm: "size-9 [&>svg]:size-4", md: "size-12 [&>svg]:size-5", lg: "size-16 [&>svg]:size-7" } },
    defaultVariants: { size: "md" },
  }),
  title: cva("font-(family-name:--font-display) font-semibold tracking-[-0.02em] text-fg [font-stretch:112%]", {
    variants: { size: { sm: "text-sm", md: "text-base", lg: "text-lg" } },
    defaultVariants: { size: "md" },
  }),
};

const stepper = {
  ...stepperRecipe,
  marker: cva(
    "tabular inline-flex shrink-0 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors duration-(--dur-fast) border-border-strong bg-bg-raised text-fg-muted group-data-[status=current]:border-(color:--accent) group-data-[status=current]:bg-accent group-data-[status=current]:text-fg-on-accent group-data-[status=completed]:border-(color:--success) group-data-[status=completed]:bg-success-subtle group-data-[status=completed]:text-success-fg group-data-[status=error]:border-(color:--danger) group-data-[status=error]:bg-danger-subtle group-data-[status=error]:text-danger-fg",
    {
      variants: { size: { sm: "size-6", md: "size-8", lg: "size-10 text-sm" } },
      defaultVariants: { size: "md" },
    },
  ),
  panelTitle: cva("mb-3 font-(family-name:--font-display) text-lg font-semibold tracking-[-0.02em] [font-stretch:112%]"),
};

const dialog = {
  ...dialogRecipe,
  title: cva("font-(family-name:--font-display) text-lg font-semibold leading-snug tracking-[-0.02em] [font-stretch:112%]"),
};

const timeline = {
  ...timelineRecipe,
  time: cva("tabular font-mono text-[0.6875rem] text-fg-subtle"),
};

const pageHeader = {
  ...pageHeaderRecipe,
  title: cva("min-w-0 font-(family-name:--font-display) text-2xl font-semibold leading-[1.08] tracking-[-0.03em] text-fg [font-stretch:118%] [overflow-wrap:anywhere] sm:text-3xl [&_em]:font-(family-name:--font-serif) [&_em]:font-normal [&_em]:italic [&_em]:tracking-normal [&_em]:[font-stretch:100%]"),
};

const appShell = {
  ...appShellRecipe,
  sectionLabel: cva(`px-2 pb-1 ${monoLabel} text-fg-subtle`),
  badge: cva("tabular ml-auto shrink-0 rounded-chip bg-bg-active px-1.5 font-mono text-[0.6875rem] font-medium text-fg-muted group-aria-[current=page]:bg-bg-raised"),
};

const workspaceSwitcher = {
  ...workspaceSwitcherRecipe,
  logo: cva(`flex size-8 shrink-0 items-center justify-center bg-(--badge-fill) text-(color:--badge-icon) [&>svg]:size-4 ${hexagon}`),
  role: cva("block truncate font-mono text-[0.6875rem] text-fg-muted"),
};

const serifAccent = "[&_em]:font-(family-name:--font-serif) [&_em]:font-normal [&_em]:italic [&_em]:tracking-normal [&_em]:[font-stretch:100%]";

const marketing = {
  ...marketingRecipe,
  eyebrow: cva(`${monoLabel} text-(color:--accent)`),
  title: cva(`mt-2 font-(family-name:--font-display) text-4xl font-semibold leading-[1.05] tracking-[-0.03em] [font-stretch:118%] sm:text-6xl ${serifAccent}`),
  card: cva("rounded-card border border-border bg-bg-raised p-5"),
};

const authCard = {
  ...authCardRecipe,
  root: cva("mx-auto w-full max-w-md rounded-card border border-border bg-bg-raised p-6 shadow-float"),
  title: cva(`font-(family-name:--font-display) text-xl font-semibold tracking-[-0.02em] [font-stretch:112%] ${serifAccent}`),
};

const errorPage = {
  ...errorPageRecipe,
  code: cva("font-(family-name:--font-display) text-5xl font-bold tracking-[-0.03em] text-fg-subtle [font-stretch:118%]"),
  title: cva(`mt-2 font-(family-name:--font-display) text-xl font-semibold tracking-[-0.02em] [font-stretch:112%] ${serifAccent}`),
};

export const hexSkin = {
  button,
  heading: headingRecipe,
  badge,
  card,
  tabs,
  statCard,
  chartCard,
  segmentedControl,
  tag,
  kbd,
  progress,
  alert,
  dataTable,
  descriptionList,
  emptyState,
  stepper,
  dialog,
  timeline,
  pageHeader,
  appShell,
  workspaceSwitcher,
  marketing,
  authCard,
  errorPage,
} satisfies Skin;
