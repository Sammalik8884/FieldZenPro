import { CategoryDto } from "./category";

export interface ProductDto {
    id: number;
    name: string;
    description: string;
    price: number;
    priceAED?: number;
    costPrice?: number;
    reorderLevel?: number;
    categoryId: number;
    category?: CategoryDto;
    imageUrl?: string;
    itemCode?: string;
    isTaxable: boolean;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    priceAED?: number;
    costPrice?: number;
    reorderLevel?: number;
    categoryId: number;
    itemCode?: string;
    image?: File;
    isTaxable?: boolean;
}

export interface PagedResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    data: T[];
}
