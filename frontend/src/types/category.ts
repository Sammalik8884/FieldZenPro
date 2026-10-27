export interface CategoryDto {
    id: number;
    name: string;
    description?: string;
    categoryType: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    categoryType: string;
}
