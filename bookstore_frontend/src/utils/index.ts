export * from './validation';
export * from './user';
export * from './token';
export * from './error';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateInput: string | Date | number): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
