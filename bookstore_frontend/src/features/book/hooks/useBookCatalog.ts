import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooksQuery } from './useBooksQuery';
import { useCategories } from '../../catalog/hooks/useCategories';
import { PAGE_SIZE } from '../constants/bookFilters';

export interface BookFilters {
  categories: number[];
  authors: string[];
  priceRange: { min?: number; max?: number } | null;
  inStockOnly: boolean;
  sort: string;
  keyword: string;
  page: number;
}

export const useBookCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<number[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      setCategories([Number(categoryId)]);
    }

    const query = searchParams.get('query');
    if (query) {
      setKeyword(query);
    }

    const filter = searchParams.get('filter');
    if (filter === 'new') {
      setSort('createdAt,desc');
    } else if (filter === 'bestseller') {
      setSort('buyCount,desc');
    } else if (filter === 'discount') {
      setSort('price,asc');
    }
  }, [searchParams]);

  const { data, isLoading, isError, isFetching, refetch } = useBooksQuery({
    page,
    size: PAGE_SIZE,
    sort,
    keyword: keyword || undefined,
    author: authors[0] || undefined,
    categoryId: categories.length === 1 ? categories[0] : undefined,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    inStock: inStockOnly || undefined,
  });

  const { data: genres = [] } = useCategories();

  const books = useMemo(() => data?.content || [], [data]);
  const totalPages = useMemo(() => data?.totalPages || 0, [data]);

  const toggleCategory = useCallback((genreId: number) => {
    setCategories((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
    setPage(0);
  }, []);

  const toggleAuthor = useCallback((author: string) => {
    setAuthors((prev) => (prev.includes(author) ? [] : [author]));
    setPage(0);
  }, []);

  const togglePriceRange = useCallback((range: { min?: number; max?: number } | null) => {
    setPriceRange((prev) =>
      prev?.min === range?.min && prev?.max === range?.max ? null : range
    );
    setPage(0);
  }, []);

  const toggleInStock = useCallback((checked: boolean) => {
    setInStockOnly(checked);
    setPage(0);
  }, []);

  const changeSort = useCallback((value: string) => {
    setSort(value);
    setPage(0);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const clearFilters = useCallback(() => {
    setCategories([]);
    setAuthors([]);
    setPriceRange(null);
    setInStockOnly(false);
    setPage(0);
    setKeyword('');
    setSearchParams({});
  }, [setSearchParams]);

  const hasActiveFilters = categories.length > 0 || authors.length > 0 || priceRange !== null || inStockOnly;

  return {
    books,
    genres,
    totalPages,
    totalElements: data?.totalElements || 0,
    isLoading,
    isError,
    isFetching,
    refetch,
    filters: { categories, authors, priceRange, inStockOnly, sort, keyword, page },
    toggleCategory,
    toggleAuthor,
    togglePriceRange,
    toggleInStock,
    changeSort,
    goToPage,
    clearFilters,
    hasActiveFilters,
  };
};
