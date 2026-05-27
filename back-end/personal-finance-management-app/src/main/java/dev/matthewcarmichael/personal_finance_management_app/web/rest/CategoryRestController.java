package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.CategoryDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.CategoryService;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.BadRequestException;
import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("api/categories")
public class CategoryRestController {

    private final CategoryService categoryService;

    public CategoryRestController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/{categoryName}")
    public CategoryDTO getCategoryForUser(@PathVariable String categoryName, Authentication authentication) {
        return this.categoryService.getCategoryByNameForUser(categoryName, authentication);
    }

    @GetMapping
    public List<CategoryDTO> getAllCategoriesForUser(Authentication authentication) {
        return this.categoryService.getAllCategoriesForUser(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDTO createCategory(@Valid @RequestBody CategoryDTO categoryDTO, Authentication authentication) {
        return this.categoryService.createCategory(categoryDTO, authentication);
    }

    @PutMapping("/{categoryId}")
    public CategoryDTO updateCategory(@PathVariable Long categoryId, @Valid @RequestBody CategoryDTO categoryDTO,
            Authentication authentication) {
        if (categoryId != categoryDTO.getId()) {
            throw new BadRequestException("Category IDs don't match.");
        }
        return this.categoryService.updateCategory(categoryDTO, authentication);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId, Authentication authentication) {
        try {
            this.categoryService.deleteCategory(categoryId, authentication);
            return ResponseEntity.status(HttpStatus.RESET_CONTENT).build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "Cannot delete category. It is being used by one or more transactions. Please reassign or delete those transactions first.");
        }
    }
}