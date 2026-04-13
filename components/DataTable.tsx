import React from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {onSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
              <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center align-middle text-muted-foreground"
                  >
                    No results.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 data-[state=selected]:bg-muted"
                  >
                    {columns.map((column, colIdx) => (
                      <td key={colIdx} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {column.cell
                          ? column.cell(item)
                          : (item[column.accessorKey as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent p-0 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent p-0 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
