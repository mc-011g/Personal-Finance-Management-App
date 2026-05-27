package dev.matthewcarmichael.personal_finance_management_app.services;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.CategoryDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Budget;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.BudgetRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.CategoryRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.NotFoundException;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository,
            BudgetRepository budgetRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
    }

    public List<CategoryDTO> getAllCategoriesForUser(Authentication authentication) {
        String userId = authentication.getName();
        List<Category> categories = this.categoryRepository.findAllByUserId(userId);

        return categories.stream().map((category) -> this.translateDBtoWeb(category)).toList();
    }

    public CategoryDTO getCategoryByNameForUser(String name, Authentication authentication) {
        String userId = authentication.getName();
        Category category = this.categoryRepository.findByNameAndUserId(name, userId)
                .orElseThrow(() -> new NotFoundException("Category not found with specified name and id."));

        return this.translateDBtoWeb(category);
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO, Authentication authentication) {
        Category category = this.translateWebToDB(categoryDTO, authentication);
        category = this.categoryRepository.save(category);

        return this.translateDBtoWeb(category);
    }

    public CategoryDTO updateCategory(CategoryDTO categoryDTO, Authentication authentication) {
        String userId = authentication.getName();

        Category category = this.categoryRepository.findById(categoryDTO.getId())
                .orElseThrow(() -> new NotFoundException("Could not find category."));
        category.setName(categoryDTO.getName());

        if (category.getUser().getId().equals(userId)) {
            category = this.categoryRepository.save(category);
            return this.translateDBtoWeb(category);
        } else {
            throw new NotFoundException("Category does not belong to the user.");
        }
    }

    public void deleteCategory(long id, Authentication authentication) {
        String userId = authentication.getName();

        Category category = this.categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found."));

        if (category.getUser().getId().equals(userId)) {
            List<Budget> budgets = budgetRepository.findAllByCategoriesContaining(category);

            for (Budget budget : budgets) {
                budget.getCategories().remove(category);
                budgetRepository.save(budget);
            }

            this.categoryRepository.deleteById(id);
        } else {
            throw new NotFoundException("The category does not belong to this user.");
        }

        this.categoryRepository.deleteById(id);
    }

    public CategoryDTO translateDBtoWeb(Category category) {
        return new CategoryDTO(
                category.getId(),
                category.getName());
    }

    public Category translateWebToDB(CategoryDTO categoryDTO, Authentication authentication) {
        String userId = authentication.getName();

        Category category = new Category();
        category.setId(categoryDTO.getId());
        category.setName(categoryDTO.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        category.setUser(user);

        return category;
    }

}