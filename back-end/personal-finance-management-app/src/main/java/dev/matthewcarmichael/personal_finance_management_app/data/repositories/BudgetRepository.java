package dev.matthewcarmichael.personal_finance_management_app.data.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import dev.matthewcarmichael.personal_finance_management_app.data.entities.Budget;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;

public interface BudgetRepository extends CrudRepository<Budget, Long> {

    Optional<Budget> findByNameAndUserId(String name, String userId);

    @Query("SELECT DISTINCT b FROM Budget b LEFT JOIN FETCH b.categories WHERE b.user.id = :userId")
    List<Budget> findAllByUserIdWithCategorires(@Param("userId") String userId);

    List<Budget> findAllByUserId(String userId);

    List<Budget> findAllByCategoriesContaining(Category category);

}
