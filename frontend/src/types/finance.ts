export interface InvoiceItemDto {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CreateInvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    itemCategory?: number;
}

export interface CreateInvoiceDto {
    customerId: number;
    quotationId?: number | null;
    workOrderId?: number | null;
    issueDate: string;
    dueDate: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    status: number;
    technicianNotes?: string;
    items: CreateInvoiceItemDto[];
}

export interface InvoiceDto {
    id: number;
    invoiceNumber: string;
    customerId: number;
    customerName?: string;
    quotationId?: number | null;
    workOrderId?: number | null;
    issueDate: string;
    dueDate: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    amountPaid: number;
    status: number; // Enum: 0=Draft, 1=Issued, 2=Paid, 3=Overdue, 4=Void
    statusString?: string;
    items?: InvoiceItemDto[];
    paymentReference?: string;
}

export interface PaymentRequestDto {
    invoiceId: number;
    amount: number;
    customerEmail: string;
    description: string;
}

export interface PaymentResponseDto {
    isSuccess: boolean;
    checkoutUrl?: string;
    gatewayTransactionId?: string;
    errorMessage?: string;
}
