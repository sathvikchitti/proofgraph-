"use client";
/**
 * ChartCard — title, legend, period switcher, loading / empty / error states and a "view data" table
 * toggle (the accessible alternative to the chart). Deps: react, lucide-react, lib/*, hooks/use-controllable-state,
 * ui/card, ui/segmented-control, ui/skeleton, ui/empty-state, ui/error-state.
 */
import { BarChart3, Table2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps } from "../../lib/types";
import { useControllableState } from "../../hooks/use-controllable-state";
import { Card, CardBody } from "../card";
import { EmptyState } from "../empty-state";
import { ErrorState } from "../error-state";
import { SegmentedControl } from "../segmented-control";
import { Skeleton } from "../skeleton";
import { chartCardRecipe } from "./chart-card.recipe";

export interface ChartDataColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

export interface ChartCardProps extends StyleProps {
  title: ReactNode;
  description?: ReactNode;
  /** The chart (or any content). */
  children: ReactNode;
  /** Extra controls next to the period switcher. */
  actions?: ReactNode;
  periods?: { value: string; label: string }[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  /** Legend for charts without their own. */
  legend?: { label: string; color: string }[];
  /** Enables the "view data" toggle and provides the table. */
  data?: { columns: ChartDataColumn[]; rows: Record<string, unknown>[]; caption?: string };
  showTable?: boolean;
  defaultShowTable?: boolean;
  onShowTableChange?: (show: boolean) => void;
  loading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: ReactNode;
  error?: unknown;
  onRetry?: () => void;
  footer?: ReactNode;
  /** Height reserved for the loading placeholder. */
  loadingHeight?: number;
  labels?: { viewData?: string; viewChart?: string; periodLabel?: string; loading?: string };
  classNames?: ClassNames<"root" | "head" | "body" | "table">;
}

export function ChartCard({
  title,
  description,
  children,
  actions,
  periods,
  period,
  defaultPeriod,
  onPeriodChange,
  legend,
  data,
  showTable,
  defaultShowTable = false,
  onShowTableChange,
  loading = false,
  isEmpty = false,
  emptyLabel = "No data for this period.",
  error,
  onRetry,
  footer,
  loadingHeight = 240,
  labels,
  className,
  classNames,
}: ChartCardProps) {
  const r = useRecipe("chartCard", chartCardRecipe);
  const t = { viewData: "View data as table", viewChart: "View chart", periodLabel: "Period", loading: "Loading chart", ...labels };
  const [table, setTable] = useControllableState({ value: showTable, defaultValue: defaultShowTable, onChange: onShowTableChange });
  const [current, setCurrent] = useControllableState<string>({ value: period, defaultValue: defaultPeriod ?? periods?.[0]?.value ?? "", onChange: onPeriodChange });
  const hasError = error !== undefined && error !== null;

  let body: ReactNode;
  if (hasError) body = <ErrorState size="sm" bordered error={error} onRetry={onRetry} title="Could not load this chart" />;
  else if (loading) body = <Skeleton shape="rect" height={loadingHeight} label={t.loading} />;
  else if (isEmpty) body = <EmptyState size="sm" bordered title={emptyLabel} />;
  else if (table && data)
    body = (
      <div className={cn(r.tableWrap(), classNames?.table)} tabIndex={0} role="region" aria-label={data.caption ?? "Chart data"}>
        <table className={r.table()}>
          <caption className={r.caption()}>{data.caption ?? "Chart data"}</caption>
          <thead>
            <tr>
              {data.columns.map((c) => (
                <th key={c.key} scope="col" className={r.th({ align: c.align })}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i}>
                {data.columns.map((c) => (
                  <td key={c.key} className={r.td({ align: c.align })}>
                    {c.format ? c.format(row[c.key], row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  else body = children;

  return (
    <Card className={cn(className, classNames?.root)} aria-busy={loading || undefined}>
      <CardBody>
        <div className={cn(r.head(), classNames?.head)}>
          <div className={r.titleBlock()}>
            <h3 className={r.title()}>{title}</h3>
            {description ? <p className={r.description()}>{description}</p> : null}
          </div>
          <div className={r.tools()}>
            {periods?.length ? <SegmentedControl size="sm" label={t.periodLabel} options={periods} value={current} onValueChange={setCurrent} /> : null}
            {data ? (
              <button type="button" className={r.toolButton()} aria-pressed={table} aria-label={table ? t.viewChart : t.viewData} title={table ? t.viewChart : t.viewData} onClick={() => setTable(!table)}>
                {table ? <BarChart3 className="size-4" aria-hidden /> : <Table2 className="size-4" aria-hidden />}
              </button>
            ) : null}
            {actions}
          </div>
        </div>
        <div className={cn(r.body(), classNames?.body)}>{body}</div>
        {legend?.length && !table && !loading && !hasError ? (
          <ul className={r.legend()} aria-label="Legend">
            {legend.map((l) => (
              <li key={l.label} className={r.legendItem()}>
                <span aria-hidden className={r.swatch()} style={{ background: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        ) : null}
        {footer ? <div className={r.footer()}>{footer}</div> : null}
      </CardBody>
    </Card>
  );
}
