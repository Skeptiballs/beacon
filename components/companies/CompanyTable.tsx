"use client";

import { useState } from "react";
import Link from "next/link";
import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { CompanyResponse, CompanySortOption } from "@/lib/types";
import { useDeleteCompany, useToggleCompanyStar } from "@/hooks/useCompanies";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, ExternalLink, Eye, Linkedin, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { EditCompanyDialog } from "./EditCompanyDialog";

interface CompanyTableProps {
  data: CompanyResponse[];
  isLoading?: boolean;
  sortBy?: CompanySortOption;
}

const columnHelper = createColumnHelper<CompanyResponse>();

// Actions cell component with edit and delete functionality
function ActionsCell({ company }: { company: CompanyResponse }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const deleteCompany = useDeleteCompany();

  const handleDelete = () => {
    deleteCompany.mutate(company.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/companies/${company.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCompanyDialog
        company={company}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete company?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{company.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StarCell({ company }: { company: CompanyResponse }) {
  const toggleStar = useToggleCompanyStar();
  const isUpdating =
    toggleStar.isPending && toggleStar.variables?.id === company.id;

  const handleToggle = () => {
    toggleStar.mutate({ id: company.id, starred: !company.starred });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      aria-pressed={company.starred}
      onClick={handleToggle}
      disabled={isUpdating}
    >
      <Star
        className={`h-4 w-4 ${
          company.starred ? "fill-amber-400 text-amber-500" : "text-muted-foreground"
        }`}
      />
      <span className="sr-only">
        {company.starred ? "Unstar company" : "Star company"}
      </span>
    </Button>
  );
}

const columns: ColumnDef<CompanyResponse, unknown>[] = [
  columnHelper.display({
    id: "starred",
    header: "",
    cell: ({ row }) => <StarCell company={row.original} />,
    size: 40,
  }),
  columnHelper.display({
    id: "logo",
    header: "",
    cell: ({ row }) => {
      const logoUrl = row.original.logo_url;
      return (
        <div className="flex items-center justify-center w-10 h-10">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${row.original.name} logo`}
              className="w-8 h-8 object-contain rounded"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div className={`flex items-center justify-center w-8 h-8 bg-muted rounded ${logoUrl ? "hidden" : ""}`}>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <Link
        href={`/companies/${info.row.original.id}`}
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("website", {
    header: "Website",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-muted-foreground">—</span>;
      const displayUrl = value.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1"
        >
          {displayUrl}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    },
  }),
  columnHelper.accessor("linkedin_url", {
    header: "LinkedIn",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-muted-foreground">—</span>;
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      );
    },
  }),
  columnHelper.accessor((row) => ({ country: row.hq_country, city: row.hq_city }), {
    id: "location",
    header: "HQ",
    cell: (info) => {
      const { country, city } = info.getValue();
      if (!country && !city) return <span className="text-muted-foreground">—</span>;
      return (
        <span>
          {country && <span className="font-medium">{country}</span>}
          {city && <span className="text-muted-foreground ml-1">· {city}</span>}
        </span>
      );
    },
  }),
  columnHelper.accessor("regions", {
    header: "Regions",
    cell: (info) => {
      const regions = info.getValue();
      if (!regions || regions.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {regions.map((region) => (
            <Badge key={region} variant="secondary" className="text-xs">
              {region}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("categories", {
    header: "Categories",
    cell: (info) => {
      const categories = info.getValue();
      if (!categories || categories.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Badge key={category} variant="outline" className="text-xs font-mono">
              {category}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("employees", {
    header: "Employees",
    cell: (info) => {
      const employees = info.getValue();
      return employees ? (
        <span className="font-mono text-xs">{employees}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    size: 120,
  }),
  // Actions column with kebab menu
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell company={row.original} />,
  }),
];

export function CompanyTable({ data, isLoading, sortBy = "name-asc" }: CompanyTableProps) {
  // Sort data based on sortBy option
  const sortedData = useMemo(() => {
    const sorted = [...data];
    
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return sorted.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      default:
        return sorted;
    }
  }, [data, sortBy]);

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          Loading companies...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          No companies found. Add your first company to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
