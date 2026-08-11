import { apiClient } from '@/shared/api/axios-client';
import type {
  InvoiceListResponse,
  DebtListResponse,
  Invoice,
  InvoiceListParams,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from '../types';

export const getInvoices = async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
  const response = await apiClient.get<InvoiceListResponse>('/invoices', { params });
  return response.data;
};

export const getMyInvoices = async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
  const response = await apiClient.get<InvoiceListResponse>('/invoices/me', { params });
  return response.data;
};

export const getDebts = async (params?: Record<string, unknown>): Promise<DebtListResponse> => {
  const response = await apiClient.get<DebtListResponse>('/invoices/debts', { params });
  return response.data;
};

export const getInvoiceDetail = async (id: number | string): Promise<Invoice> => {
  const response = await apiClient.get<Invoice>(`/invoices/${id}`);
  return response.data;
};

export const getMyInvoiceDetail = async (id: number | string): Promise<Invoice> => {
  const response = await apiClient.get<Invoice>(`/invoices/me/${id}`);
  return response.data;
};

export const createInvoice = async (data: CreateInvoiceDto): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>('/invoices', data);
  return response.data;
};

export const updateDraftInvoice = async (id: number | string, data: UpdateInvoiceDto): Promise<Invoice> => {
  const response = await apiClient.patch<Invoice>(`/invoices/${id}`, data);
  return response.data;
};

export const issueInvoice = async (id: number | string): Promise<void> => {
  await apiClient.patch(`/invoices/${id}/issue`);
};

export const cancelInvoice = async (id: number | string): Promise<void> => {
  await apiClient.patch(`/invoices/${id}/cancel`);
};

export const markInvoiceOverdue = async (id: number | string): Promise<void> => {
  await apiClient.patch(`/invoices/${id}/overdue`);
};
