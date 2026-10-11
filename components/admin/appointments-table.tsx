"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDownIcon,
  CalendarCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  MoreHorizontalIcon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUSES, doctorByName } from "@/constants";
import { formatDateTime, initials } from "@/lib/utils";
import type { BookedSlot } from "@/lib/availability";
import type { AppointmentDTO, Status } from "@/types";

import { CancelDialog, ScheduleDialog } from "./appointment-dialogs";
import { StatusBadge, statusMeta } from "./status-badge";

type Filter = Status | "all";
type Action = { type: "schedule" | "cancel"; appointment: AppointmentDTO } | null;

function SortButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="-ml-2 text-muted-foreground">
      {label} <ArrowUpDownIcon data-icon="inline-end" />
    </Button>
  );
}

export function AppointmentsTable({
  data,
  booked,
}: {
  data: AppointmentDTO[];
  booked: BookedSlot[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [action, setAction] = useState<Action>(null);

  const counts = useMemo(() => {
    const c = { all: data.length, scheduled: 0, pending: 0, cancelled: 0 };
    for (const a of data) c[a.status]++;
    return c;
  }, [data]);

  const rows = useMemo(
    () => (filter === "all" ? data : data.filter((a) => a.status === filter)),
    [data, filter]
  );

  const columns = useMemo<ColumnDef<AppointmentDTO>[]>(
    () => [
      {
        accessorKey: "patientName",
        header: ({ column }) => (
          <SortButton label="Patient" onClick={() => column.toggleSorting()} />
        ),
        cell: ({ row }) => (
          <div className="min-w-36">
            <p className="font-medium">{row.original.patientName}</p>
            <p
              className="max-w-56 truncate text-xs text-muted-foreground"
              title={row.original.reason}
            >
              {row.original.reason}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "schedule",
        sortingFn: "datetime",
        accessorFn: (a) => new Date(a.schedule),
        header: ({ column }) => (
          <SortButton label="Appointment" onClick={() => column.toggleSorting()} />
        ),
        cell: ({ row }) => {
          const when = formatDateTime(row.original.schedule);
          return (
            <div className="whitespace-nowrap tabular-nums">
              <p>{when.dateOnly.replace(/^\w+, /, "")}</p>
              <p className="text-xs text-muted-foreground">{when.timeOnly}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "primaryPhysician",
        header: "Optometrist",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => {
          const name = row.original.primaryPhysician;
          return (
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              <Avatar className="size-7">
                <AvatarImage src={doctorByName(name)?.image} alt="" />
                <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
              </Avatar>
              {name}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex justify-end gap-1">
              {a.status === "pending" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="hidden sm:inline-flex"
                  onClick={() => setAction({ type: "schedule", appointment: a })}
                >
                  Confirm
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${a.patientName}`}
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => setAction({ type: "schedule", appointment: a })}
                  >
                    <CalendarCheckIcon />{" "}
                    {a.status === "scheduled" ? "Reschedule" : "Confirm / schedule"}
                  </DropdownMenuItem>
                  {a.status !== "cancelled" && (
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setAction({ type: "cancel", appointment: a })}
                    >
                      <XCircleIcon /> Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is safe here
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter: query },
    onSortingChange: setSorting,
    onGlobalFilterChange: setQuery,
    globalFilterFn: (row, _id, value: string) => {
      const q = value.toLowerCase();
      const a = row.original;
      return [a.patientName, a.primaryPhysician, a.reason].some((s) =>
        s?.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <section aria-labelledby="appointments-heading" className="rounded-2xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 id="appointments-heading" className="sr-only">
          Appointments
        </h2>
        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(v as Filter);
            table.setPageIndex(0);
          }}
        >
          <TabsList className="h-9 max-w-full overflow-x-auto">
            {(["all", ...STATUSES] as const).map((s) => (
              <TabsTrigger key={s} value={s} className="gap-1.5 px-3">
                {s === "all" ? "All" : statusMeta[s].label}
                <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                  {counts[s]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="h-9 lg:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search patient, optometrist, reason…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              table.setPageIndex(0);
            }}
            aria-label="Search appointments"
          />
        </InputGroup>
      </div>

      {filteredCount === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>No appointments found</EmptyTitle>
            <EmptyDescription>
              {query || filter !== "all"
                ? "Try a different search or filter."
                : "New booking requests will appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      (header.column.columnDef.meta as { className?: string } | undefined)
                        ?.className ?? "first:pl-4 last:pr-4"
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      (cell.column.columnDef.meta as { className?: string } | undefined)
                        ?.className ?? "py-3 first:pl-4 last:pr-4"
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
        <p className="tabular-nums">
          {filteredCount === 0
            ? "0 results"
            : `${pageIndex * 10 + 1}–${Math.min((pageIndex + 1) * 10, filteredCount)} of ${filteredCount}`}
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {action?.type === "schedule" && (
        <ScheduleDialog
          booked={booked}
          key={action.appointment.id}
          appointment={action.appointment}
          open
          onOpenChange={(o) => !o && setAction(null)}
        />
      )}
      {action?.type === "cancel" && (
        <CancelDialog
          key={action.appointment.id}
          appointment={action.appointment}
          open
          onOpenChange={(o) => !o && setAction(null)}
        />
      )}
    </section>
  );
}
