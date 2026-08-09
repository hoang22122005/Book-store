import React from 'react';
import { BookCard } from './BookCard';
import type { Book } from '../services/bookService';

interface BookGridProps {
  books: Book[];
  onAddToCart?: (id: number, e: React.MouseEvent) => void;
  columns?: 2 | 3 | 4;
  showActions?: boolean;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  onAddToCart,
  columns = 4,
  showActions = true,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onAddToCart={onAddToCart}
          showActions={showActions}
        />
      ))}
    </div>
  );
};
