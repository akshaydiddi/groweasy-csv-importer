"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

export interface DataTableColumn {
  key: string;
  label: string;
  width?: number;
  render?: (value: string) => React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  rows: Record<string, string>[];
  rowKey?: (row: Record<string, string>, index: number) => string | number;
  maxHeight?: number;
  emptyLabel?: string;
}

const ROW_HEIGHT = 44;
const VIRTUALIZE_THRESHOLD = 60;

export function DataTable({
  columns,
  rows,
  rowKey,
  maxHeight = 480,
  emptyLabel = "No rows to display.",
}: DataTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    enabled: shouldVirtualize,
  });

  const totalWidth = columns.reduce((sum, c) => sum + (c.width ?? 180), 0);

  if (rows.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : null;
  const paddingTop = virtualItems && virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems && virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  const visibleRows = shouldVirtualize
    ? virtualItems!.map((vi) => ({ vi, row: rows[vi.index] }))
    : rows.map((row, index) => ({ vi: { index, key: index }, row }));

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight }}>
        <table style={{ minWidth: totalWidth }} className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--surface-raised)] backdrop-blur">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width ?? 180, minWidth: col.width ?? 180 }}
                  className="border-b-2 border-[var(--border-strong)] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden style={{ height: paddingTop }}>
                <td colSpan={columns.length} />
              </tr>
            )}
            {visibleRows.map(({ vi, row }, i) => (
              <tr
                key={rowKey ? rowKey(row, vi.index) : vi.index}
                className={clsx(
                  "transition-colors duration-150 hover:bg-[var(--accent-soft)]",
                  i % 2 === 1 && "bg-[var(--background)]/50"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ width: col.width ?? 180, minWidth: col.width ?? 180 }}
                    className="truncate border-b border-[var(--border)] px-4 py-2.5 text-[var(--foreground)]"
                    title={row[col.key] ?? ""}
                  >
                    {col.render ? col.render(row[col.key] ?? "") : row[col.key] || (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {paddingBottom > 0 && (
              <tr aria-hidden style={{ height: paddingBottom }}>
                <td colSpan={columns.length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
