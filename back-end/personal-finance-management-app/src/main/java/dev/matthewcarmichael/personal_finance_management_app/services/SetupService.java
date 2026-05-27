package dev.matthewcarmichael.personal_finance_management_app.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.BudgetDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.CategoryDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.FinancialAccountDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.SetupDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.TransactionDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Budget;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.FinancialAccount;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Transaction;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.BudgetRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.CategoryRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.FinancialAccountRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.TransactionRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.NotFoundException;

@Service
public class SetupService {

    private final TransactionRepository transactionRepository;
    private final FinancialAccountRepository financialAccountRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public SetupService(BudgetRepository budgetRepository, UserRepository userRepository,
            CategoryRepository categoryRepository, FinancialAccountRepository financialAccountRepository,
            TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.financialAccountRepository = financialAccountRepository;
        this.transactionRepository = transactionRepository;
    }

    public boolean getCompleteStatus(Authentication authentication) {
        String userId = authentication.getName();

        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with specified id"));

        return user.isOnboardingComplete();
    }

    public void finishSetup(SetupDTO setupDTO, Authentication authentication) {
        String userId = authentication.getName();

        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with specified id"));

        List<FinancialAccount> financialAccounts = new ArrayList<>();
        for (FinancialAccountDTO financialAccountDTO : setupDTO.getFinancialAccountDTOs()) {
            FinancialAccount financialAccount = new FinancialAccount();
            financialAccount.setName(financialAccountDTO.getName());
            financialAccount.setBalance(financialAccountDTO.getBalance());
            financialAccount.setUser(user);
            financialAccounts.add(financialAccount);
        }
        financialAccounts = (List<FinancialAccount>) this.financialAccountRepository.saveAll(financialAccounts);

        List<Category> categories = new ArrayList<>();
        for (CategoryDTO categoryDTO : setupDTO.getCategoryDTOs()) {
            Category category = new Category();
            category.setName(categoryDTO.getName());
            category.setUser(user);
            categories.add(category);
        }
        categories = (List<Category>) this.categoryRepository.saveAll(categories);

        if (setupDTO.getBudgetDTOs() != null) {
            List<Budget> budgets = new ArrayList<>();
            for (BudgetDTO budgetDTO : setupDTO.getBudgetDTOs()) {
                Budget budget = new Budget();
                budget.setBudgetPeriod(LocalDate.now().withDayOfMonth(1));
                budget.setAmount(budgetDTO.getAmount());
                budget.setName(budgetDTO.getName());
                budget.setUser(user);

                List<String> budgetCategoryNames = budgetDTO.getCategoryNames();
                Iterable<Category> budgetCategories = categoryRepository.findAllByNameInAndUserId(budgetCategoryNames,
                        userId);

                budget.setCategories((List<Category>) budgetCategories);
                budgets.add(budget);
            }
            budgets = (List<Budget>) this.budgetRepository.saveAll(budgets);
        }

        if (setupDTO.getTransactionDTOs() != null) {
            List<Transaction> transactions = new ArrayList<>();
            for (TransactionDTO transactionDTO : setupDTO.getTransactionDTOs()) {
                Transaction transaction = new Transaction();
                transaction.setName(transactionDTO.getName());
                transaction.setAmount(transactionDTO.getAmount());
                transaction.setDate(transactionDTO.getDate());
                transaction.setUser(user);

                FinancialAccount transactionFinancialAccount = this.financialAccountRepository
                        .findByNameAndUserId(transactionDTO.getFinancialAccountName(), userId).orElseThrow(
                                () -> new NotFoundException(
                                        "Category not found with id: " + transactionDTO.getCategoryId()));
                transaction.setFinancialAccount(transactionFinancialAccount);

                Category transactionCategory = categoryRepository
                        .findByNameAndUserId(transactionDTO.getCategoryName(), userId).orElseThrow(
                                () -> new NotFoundException(
                                        "Category not found with id: " + transactionDTO.getCategoryId()));
                transaction.setCategory(transactionCategory);
                transactions.add(transaction);
            }
            transactions = (List<Transaction>) this.transactionRepository.saveAll(transactions);

            Set<FinancialAccount> updatedAccounts = new HashSet<>();
            for (Transaction transaction : transactions) {
                FinancialAccount transactionAccount = transaction.getFinancialAccount();
                transactionAccount.setBalance(transactionAccount.getBalance().subtract(transaction.getAmount()));
            }
            financialAccountRepository.saveAll(updatedAccounts);
        }

        user.setOnboardingComplete(true);
        this.userRepository.save(user);
    }
}