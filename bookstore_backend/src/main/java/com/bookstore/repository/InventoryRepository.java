package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.Inventory;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    @Query("""
            select i.quantityInStock - i.reservedQuantity
            from Inventory i
            where i.bookId = :bookId
            """)
    Integer findAvailableQuantity(@Param("bookId") int bookId);

    @Modifying
    @Query(value = """
            update inventory
               set reserved_quantity = reserved_quantity + :quantity,
                   updated_at = now()
             where book_id = :bookId
               and quantity_in_stock - reserved_quantity >= :quantity
            """, nativeQuery = true)
    int reserve(@Param("bookId") int bookId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
            update inventory
               set quantity_in_stock = quantity_in_stock - :quantity,
                   reserved_quantity = reserved_quantity - :quantity,
                   updated_at = now()
             where book_id = :bookId
               and quantity_in_stock >= :quantity
               and reserved_quantity >= :quantity
            """, nativeQuery = true)
    int deductReservation(@Param("bookId") int bookId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
            update inventory
               set reserved_quantity = reserved_quantity - :quantity,
                   updated_at = now()
             where book_id = :bookId
               and reserved_quantity >= :quantity
            """, nativeQuery = true)
    int releaseReservation(@Param("bookId") int bookId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
            update inventory
               set quantity_in_stock = quantity_in_stock + :quantity,
                   updated_at = now()
             where book_id = :bookId
            """, nativeQuery = true)
    int restock(@Param("bookId") int bookId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
            update inventory
               set quantity_in_stock = quantity_in_stock + :quantity,
                   updated_at = now()
             where book_id = :bookId
            """, nativeQuery = true)
    int increaseStock(@Param("bookId") int bookId, @Param("quantity") int quantity);
}
