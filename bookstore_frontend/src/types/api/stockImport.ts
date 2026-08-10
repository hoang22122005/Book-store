export interface StockImportDetailResponse {
  importDetailId: number;
  bookId: number;
  bookName: string;
  quantity: number;
}

export interface StockImportResponse {
  importId: number;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED';
  note: string;
  createdByName: string;
  createdAt: string;
  postedAt: string | null;
  details: StockImportDetailResponse[];
}

export interface CreateStockImportRequest {
  note?: string;
  details?: AddStockImportDetailRequest[];
}

export interface AddStockImportDetailRequest {
  bookId: number;
  quantity: number;
}
