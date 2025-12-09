"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api-client";
import {
  CompanyFilters,
  CreateCompanyInput,
  CompanyResponse,
  ListResponse,
} from "@/lib/types";

// Query keys for cache management
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters?: CompanyFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
};

// Hook for fetching list of companies with optional filters
export function useCompanies(filters?: CompanyFilters) {
  return useQuery<ListResponse<CompanyResponse>>({
    queryKey: companyKeys.list(filters),
    queryFn: () => companiesApi.list(filters),
  });
}

// Hook for fetching a single company by ID
export function useCompany(id: number) {
  return useQuery<CompanyResponse>({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.get(id),
    enabled: !!id,
  });
}

// Hook for creating a new company
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, CreateCompanyInput>({
    mutationFn: (data) => companiesApi.create(data),
    onSuccess: () => {
      // Invalidate all company lists to refresh data
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

// Hook for updating a company
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<
    CompanyResponse,
    Error,
    { id: number; data: CreateCompanyInput }
  >({
    mutationFn: ({ id, data }) => companiesApi.update(id, data),
    onSuccess: (data) => {
      // Invalidate all company lists and the specific company detail
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
    },
  });
}

// Hook for deleting a company
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: number }, Error, number>({
    mutationFn: (id) => companiesApi.delete(id),
    onSuccess: () => {
      // Invalidate all company lists to refresh data
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

