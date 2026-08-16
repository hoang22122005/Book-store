export interface StockImportDetailResponse {
  importDetailId: number;
  bookId: number;
  bookName: string;
  quantity: number;
  importPrice: number;
  sellingPriceAtImport: number | null;
}

export interface StockImportResponse {
  importId: number;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED';
  note: string;
  supplierName: string | null;
  totalCost: number;
  createdByName: string;
  createdAt: string;
  postedAt: string | null;
  details: StockImportDetailResponse[];
}

export interface CreateStockImportRequest {
  note?: string;
  supplierName?: string;
  details?: AddStockImportDetailRequest[];
}

export interface AddStockImportDetailRequest {
  bookId: number;
  quantity: number;
  importPrice: number;
}
