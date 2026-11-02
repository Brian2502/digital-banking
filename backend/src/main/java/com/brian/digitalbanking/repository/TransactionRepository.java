
package com.brian.digitalbanking.repository;

import com.brian.digitalbanking.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.brian.digitalbanking.entity.TransactionType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Collection;
import java.math.BigDecimal;


public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccount_User_Id(
            Long userId,
            Pageable pageable
    );

    Page<Transaction> findByAccount_User_IdAndType(
            Long userId,
            TransactionType type,
            Pageable pageable
    );

    @Query("""
    SELECT t FROM Transaction t
    WHERE t.account.user.id = :userId
      AND (:type IS NULL OR t.type = :type)
      AND (CAST(:fromDate AS LocalDateTime) IS NULL
           OR t.createdAt >= :fromDate)
      AND (CAST(:toDateExclusive AS LocalDateTime) IS NULL
           OR t.createdAt < :toDateExclusive)
    """)
    Page<Transaction> searchTransactions(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDateExclusive") LocalDateTime toDateExclusive,
            Pageable pageable
    );

    Optional<Transaction> findByIdAndAccount_User_Id(
            Long id,
            Long userId
    );

    Page<Transaction> findByAccount_User_IdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    @Query("""
    SELECT COALESCE(SUM(t.amount), 0)
    FROM Transaction t
    WHERE t.account.user.id = :userId
      AND t.type IN :types
      AND t.createdAt >= :fromDate
      AND t.createdAt < :toDate
    """)
    BigDecimal sumAmountByUserAndTypes(
            @Param("userId") Long userId,
            @Param("types") Collection<TransactionType> types,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

}
