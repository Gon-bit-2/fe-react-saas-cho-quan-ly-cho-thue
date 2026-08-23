import { apiClient } from '@/shared/api/axios-client';
import type {
  PaymentListResponse,
  Payment,
  ManualConfirmationDto,
  ApprovePaymentDto,
  RejectPaymentDto,
  PaymentQrCode,
  PaymentListParams,
} from '../types';

export const getPayments = async (params?: PaymentListParams): Promise<PaymentListResponse> => {
  const response = await apiClient.get<PaymentListResponse>('/payments', { params });
  return response.data;
};

export const getPaymentDetail = async (id: number | string): Promise<Payment> => {
  const response = await apiClient.get<Payment>(`/payments/${id}`);
  return response.data;
};

export const approvePayment = async (id: number | string, data?: ApprovePaymentDto): Promise<Payment> => {
  const response = await apiClient.patch<Payment>(`/payments/${id}/approve`, data);
  return response.data;
};

export const rejectPayment = async (id: number | string, data?: RejectPaymentDto): Promise<Payment> => {
  const response = await apiClient.patch<Payment>(`/payments/${id}/reject`, data);
  return response.data;
};

// Renter APIs
export const getMyInvoicePaymentQr = async (invoiceId: number | string): Promise<PaymentQrCode> => {
  const response = await apiClient.get<PaymentQrCode>(`/invoices/me/${invoiceId}/payment-qr`);
  return response.data;
};

export const createMyInvoicePaymentQr = async (invoiceId: number | string): Promise<PaymentQrCode> => {
  const response = await apiClient.post<PaymentQrCode>(`/invoices/me/${invoiceId}/payment-qr`, {});
  return response.data;
};

export const submitManualConfirmation = async (
  invoiceId: number | string,
  data: ManualConfirmationDto
): Promise<Payment> => {
  const response = await apiClient.post<Payment>(`/invoices/me/${invoiceId}/payment-confirmations`, data);
  return response.data;
};
