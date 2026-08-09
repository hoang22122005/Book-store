export const PRICE_RANGES = [
  { label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { label: '100.000đ - 500.000đ', min: 100000, max: 500000 },
  { label: 'Trên 500.000đ', min: 500000, max: undefined },
] as const;

export const SORT_OPTIONS = [
  { label: 'Sách mới nhất', value: 'createdAt,desc' },
  { label: 'Sách cũ nhất', value: 'createdAt,asc' },
  { label: 'Giá thấp đến cao', value: 'price,asc' },
  { label: 'Giá cao đến thấp', value: 'price,desc' },
  { label: 'Bán chạy nhất', value: 'buyCount,desc' },
  { label: 'Đánh giá cao nhất', value: 'avgRating,desc' },
] as const;

export const AUTHORS = [
  'Dale Carnegie',
  'Paulo Coelho',
  'Nguyễn Nhật Ánh',
  'Stephen Hawking',
  'Victor Hugo',
] as const;

export const PAGE_SIZE = 12;
