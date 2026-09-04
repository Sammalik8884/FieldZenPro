export interface CustomerDto {
    id: number;
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    altPhone?: string;
    address?: string;
}

export interface CreateCustomerDto {
    name: string;
    email: string;
    phone?: string;
    altPhone?: string;
    address?: string;
    taxNumber?: string;
}
