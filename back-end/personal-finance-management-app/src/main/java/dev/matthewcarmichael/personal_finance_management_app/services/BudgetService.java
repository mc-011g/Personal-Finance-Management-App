package dev.matthewcarmichael.personal_finance_management_app.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.BudgetDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.CategoryDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Budget;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Transaction;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.BudgetRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.CategoryRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.NotFoundException;

@Service
public class BudgetService {

    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<BudgetDTO> getAllBudgetsForUser(Authentication authentication, LocalDate selectedDate) {
        String userId = authentication.getName();

        List<Budget> budgets = this.budgetRepository.findAllByUserId(userId);
        List<Budget> filteredBudgets = new ArrayList<>();

        for (Budget budget : budgets) {
            if (budget.getBudgetPeriod().getYear() == selectedDate.getYear() &&
                    budget.getBudgetPeriod().getMonth() == selectedDate.getMonth()) {
                filteredBudgets.add(budget);
            }
        }

        return filteredBudgets.stream().map((budget) -> this.translateDBtoWeb(budget, selectedDate)).toList();
    }

    public BudgetDTO getBudgetByNameForUser(String name, Authentication authentication, LocalDate selectedDate) {
        String userId = authentication.getName();

        Budget budget = this.budgetRepository.findByNameAndUserId(name, userId)
                .orElseThrow(() -> new NotFoundException("Budget not found with specified name and id."));

        return this.translateDBtoWeb(budget, selectedDate);
    }

    public BudgetDTO createBudget(BudgetDTO budgetDTO, Authentication authentication, LocalDate selectedDate) {
        Budget budget = this.translateWebToDB(budgetDTO, authentication);
        budget.setBudgetPeriod(LocalDate.now().withDayOfMonth(1));
        budget = this.budgetRepository.save(budget);

        if (budget.getBudgetPeriod().getYear() == selectedDate.getYear() &&
                budget.getBudgetPeriod().getMonth() == selectedDate.getMonth()) {
            return this.translateDBtoWeb(budget, selectedDate);
        } else {
            return null;
        }
    }

    public BudgetDTO updateBudget(BudgetDTO budgetDTO, Authentication authentication, LocalDate selectedDate) {
        String userId = authentication.getName();

        Budget budget = this.budgetRepository.findById(budgetDTO.getId())
                .orElseThrow(() -> new NotFoundException("Cannot find budget."));
        if (budgetDTO.getCategoryIds().isEmpty()) {
            throw new NotFoundException("No categories found for this budget.");
        }

        if (budget.getUser().getId().equals(userId)) {
            budget.setName(budgetDTO.getName());
            budget.setAmount(budgetDTO.getAmount());

            List<Long> categoryIds = budgetDTO.getCategoryIds().stream().map(id -> Long.parseLong(id)).toList();
            List<Category> categories = (List<Category>) categoryRepository.findAllById(categoryIds);
            if (categories.isEmpty()) {
                throw new NotFoundException("No categories found for this budget.");
            }
            budget.setCategories(categories);
            budget = this.budgetRepository.save(budget);

            if (budget.getBudgetPeriod().getYear() == selectedDate.getYear() &&
                    budget.getBudgetPeriod().getMonth() == selectedDate.getMonth()) {
                return this.translateDBtoWeb(budget, selectedDate);
            } else {
                return null;
            }
        } else {
            throw new NotFoundException("Budget does not belong to user.");
        }
    }

    public void deleteBudget(long id, Authentication authentication) {
        String userId = authentication.getName();

        Budget budget = this.budgetRepository.findById(id).orElseThrow(() -> new NotFoundException("Budget not found"));

        if (budget.getUser().getId().equals(userId)) {
            List<Category> categories = categoryRepository.findAllByBudgetsContaining(budget);
            for (Category category : categories) {
                category.getBudgets().remove(budget);
                categoryRepository.save(category);
            }

            this.budgetRepository.deleteById(id);
        } else {
            throw new NotFoundException("This budget does not belong to the user.");
        }
    }

    public CategoryDTO convertCategoryToCategoryDTO(Category category) {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(category.getId());
        categoryDTO.setName(category.getName());
        return categoryDTO;
    }

    public BigDecimal calculatePercentReached(Budget budget, LocalDate selectedDate) {

        BigDecimal percentReached = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        List<Transaction> transactions = new ArrayList<>();

        for (Category category : budget.getCategories()) {
            for (Transaction transaction : category.getTransactions()) {
                if (transaction.getDate().getMonth() == selectedDate.getMonth() &&
                        transaction.getDate().getYear() == selectedDate.getYear()) {
                    transactions.add(transaction);
                }
            }
        }

        for (Transaction transaction : transactions) {
            totalSpent = totalSpent.add(transaction.getAmount());
        }

        percentReached = totalSpent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return percentReached;
    }

    public BudgetDTO translateDBtoWeb(Budget budget, LocalDate selectedDate) {

        List<Category> categories = budget.getCategories();
        List<CategoryDTO> categoryDTOs = categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName())).toList();

        BigDecimal percentReached = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        List<Transaction> transactions = new ArrayList<>();

        for (Category category : categories) {
            for (Transaction transaction : category.getTransactions()) {
                if (transaction.getDate().getMonth() == selectedDate.getMonth() &&
                        transaction.getDate().getYear() == selectedDate.getYear()) {
                    transactions.add(transaction);
                }
            }
        }

        for (Transaction transaction : transactions) {
            totalSpent = totalSpent.add(transaction.getAmount());
        }

        percentReached = totalSpent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return new BudgetDTO(
                budget.getId(),
                budget.getName(),
                budget.getAmount(),
                budget.getBudgetPeriod(),
                null,
                categoryDTOs,
                percentReached,
                totalSpent,
                null);
    }

    // used for create only
    public Budget translateWebToDB(BudgetDTO budgetDTO, Authentication authentication) {
        if (budgetDTO.getCategoryIds().isEmpty()) {
            throw new NotFoundException("No categories found for this budget.");
        }

        String userId = authentication.getName();

        Budget budget = new Budget();
        budget.setId(budgetDTO.getId());
        budget.setAmount(budgetDTO.getAmount());
        budget.setName(budgetDTO.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        budget.setUser(user);

        List<Long> categoryIds = budgetDTO.getCategoryIds().stream().map(id -> Long.parseLong(id)).toList();

        List<Category> categories = (List<Category>) categoryRepository.findAllById(categoryIds);
        if (categories.isEmpty()) {
            throw new NotFoundException("No categories found for this budget.");
        }

        budget.setCategories(categories);

        return budget;
    }

}
