
package com.brian.digitalbanking.repository;

import com.brian.digitalbanking.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;


public interface BankAccountRepository
        extends JpaRepository<BankAccount, Long> {

    List<BankAccount> findByUserId(Long userId);

    Optional<BankAccount> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);

    Optional<BankAccount> findByAccountNumberAndUserId(
            String accountNumber,
            Long userId
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT a FROM BankAccount a
    WHERE a.accountNumber = :accountNumber
      AND a.user.id = :userId
    """)
    Optional<BankAccount> findByAccountNumberAndUserIdForUpdate(
            @Param("accountNumber") String accountNumber,
            @Param("userId") Long userId
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<BankAccount> findAllByAccountNumberInOrderByAccountNumberAsc(
            Collection<String> accountNumbers
    );

}
