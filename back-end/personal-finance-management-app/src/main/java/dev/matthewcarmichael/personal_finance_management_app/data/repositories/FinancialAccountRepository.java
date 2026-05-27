package dev.matthewcarmichael.personal_finance_management_app.data.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import dev.matthewcarmichael.personal_finance_management_app.data.entities.FinancialAccount;

public interface FinancialAccountRepository extends CrudRepository<FinancialAccount, Long> {

    Optional<FinancialAccount> findByNameAndUserId(String name, String userId);

    List<FinancialAccount> findAllByUserId(String userId);
}
