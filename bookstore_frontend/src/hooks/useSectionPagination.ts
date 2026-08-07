import { useCallback, useState } from 'react';

/** Shared page state for small, independently paginated homepage sections. */
export const useSectionPagination = (initialPage = 0) => {
  const [page, setPage] = useState(initialPage);

  const goToPage = useCallback((nextPage: number) => {
    setPage(Math.max(0, nextPage));
  }, []);

  return { page, goToPage };
};
