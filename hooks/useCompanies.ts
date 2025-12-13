"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api-client";
import {
  CompanyFilters,
  CreateCompanyInput,
  CompanyResponse,
  ListResponse,
  CompanyNote,
} from "@/lib/types";

// Query keys for cache management
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters?: CompanyFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
};

export const noteKeys = {
  all: ["company-notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (companyId: number) => [...noteKeys.lists(), companyId] as const,
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

// Hook for fetching notes for a company
export function useCompanyNotes(companyId: number) {
  return useQuery<CompanyNote[]>({
    queryKey: noteKeys.list(companyId),
    queryFn: () => companiesApi.listNotes(companyId),
    enabled: !!companyId,
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

// Hook for toggling a company's starred flag
export function useToggleCompanyStar() {
  const queryClient = useQueryClient();

  return useMutation<
    CompanyResponse,
    Error,
    { id: number; starred: boolean }
  >({
    mutationFn: ({ id, starred }) => companiesApi.toggleStar(id, starred),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) });
    },
  });
}

// Hook for creating a note for a company
export function useCreateCompanyNote(companyId: number) {
  const queryClient = useQueryClient();

  return useMutation<CompanyNote, Error, { content: string }>({
    mutationFn: ({ content }) => companiesApi.createNote(companyId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
  });
}

// Hook for updating a note
export function useUpdateCompanyNote(companyId: number) {
  const queryClient = useQueryClient();

  return useMutation<CompanyNote, Error, { noteId: number; content: string }>({
    mutationFn: ({ noteId, content }) =>
      companiesApi.updateNote(companyId, noteId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
  });
}

// Hook for deleting a note
export function useDeleteCompanyNote(companyId: number) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: number }, Error, { noteId: number }>({
    mutationFn: ({ noteId }) => companiesApi.deleteNote(companyId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
  });
}

