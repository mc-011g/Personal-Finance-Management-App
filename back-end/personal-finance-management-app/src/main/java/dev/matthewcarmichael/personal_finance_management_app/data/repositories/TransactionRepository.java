package dev.matthewcarmichael.personal_finance_management_app.data.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import dev.matthewcarmichael.personal_finance_management_app.data.entities.Transaction;

public interface TransactionRepository extends CrudRepository<Transaction, Long> {

    Optional<Transaction> findByNameAndUserId(String name, String userId);

    List<Transaction> findAllByUserId(String userId);
}
