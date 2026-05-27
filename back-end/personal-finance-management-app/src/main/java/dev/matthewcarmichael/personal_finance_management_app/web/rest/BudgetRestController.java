package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.BudgetDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.BudgetService;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.BadRequestException;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("api/budgets")
public class BudgetRestController {

    private final BudgetService budgetService;

    public BudgetRestController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/{budgetName}")
    public BudgetDTO getBudgetForUser(@PathVariable String budgetName, Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.budgetService.getBudgetByNameForUser(budgetName, authentication, selectedDate);
    }

    @GetMapping
    public List<BudgetDTO> getAllBudgetsForUser(Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.budgetService.getAllBudgetsForUser(authentication, selectedDate);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetDTO createBudget(@Valid @RequestBody BudgetDTO budgetDTO, Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.budgetService.createBudget(budgetDTO, authentication, selectedDate);
    }

    @PutMapping("/{budgetId}")
    public BudgetDTO updateBudget(@PathVariable Long budgetId, @Valid @RequestBody BudgetDTO budgetDTO,
            Authentication authentication, @RequestParam LocalDate selectedDate) {
        if (budgetId != budgetDTO.getId()) {
            throw new BadRequestException("Budget IDs don't match.");
        }
        return this.budgetService.updateBudget(budgetDTO, authentication, selectedDate);
    }

    @DeleteMapping("/{budgetId}")
    @ResponseStatus(HttpStatus.RESET_CONTENT)
    public void deleteBudget(@PathVariable Long budgetId, Authentication authentication) {
        this.budgetService.deleteBudget(budgetId, authentication);
    }

}
