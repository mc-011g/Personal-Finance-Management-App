package dev.matthewcarmichael.personal_finance_management_app.data.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import dev.matthewcarmichael.personal_finance_management_app.data.entities.Budget;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;

public interface CategoryRepository extends CrudRepository<Category, Long> {

    Optional<Category> findByNameAndUserId(String name, String userId);

    List<Category> findAllByUserId(String userId);

    List<Category> findAllByNameInAndUserId(List<String> names, String userId);

    List<Category> findAllByBudgetsContaining(Budget budget);

}
