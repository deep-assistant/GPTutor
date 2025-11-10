import { API_BASE_URL } from "./config";

export interface CreatePaymentRequest {
  amount: number;
  description?: string;
  returnUrl?: string;
}

export interface Payment {
  id: string;
  yookassaId: string;
  amount: number;
  status: string;
  confirmationUrl?: string;
  createdAt: string;
}

export interface CreatePaymentResponse {
  message: string;
  payment: Payment;
}

export interface GetPaymentsResponse {
  message: string;
  payments: Payment[];
}

class PaymentApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${window.location}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    return this.makeRequest<CreatePaymentResponse>("/payments/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserPayments(): Promise<GetPaymentsResponse> {
    return this.makeRequest<GetPaymentsResponse>("/payments");
  }

  async getPaymentInfo(yookassaId: string): Promise<any> {
    return this.makeRequest<any>(`/payments/${yookassaId}`);
  }
}

export const paymentApi = new PaymentApiService();

