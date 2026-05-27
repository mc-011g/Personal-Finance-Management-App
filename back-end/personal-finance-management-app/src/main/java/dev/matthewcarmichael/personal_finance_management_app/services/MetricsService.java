package dev.matthewcarmichael.personal_finance_management_app.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.FinancialAccountBalanceDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.Top5SpendingByBudgetByMonthDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.Top5SpendingByCategoryByMonthDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.TransactionDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Budget;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.FinancialAccount;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Transaction;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.BudgetRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.CategoryRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.FinancialAccountRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.TransactionRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;

@Service
public class MetricsService {

    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final TransactionRepository transactionRepository;
    private final FinancialAccountRepository financialAccountRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    public MetricsService(BudgetRepository budgetRepository, UserRepository userRepository,
            CategoryRepository categoryRepository, FinancialAccountRepository financialAccountRepository,
            TransactionRepository transactionRepository, BudgetService budgetService,
            TransactionService transactionService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.financialAccountRepository = financialAccountRepository;
        this.transactionRepository = transactionRepository;
        this.budgetService = budgetService;
        this.transactionService = transactionService;
    }

    public BigDecimal getCurrentBalanceTotal(Authentication authentication) {
        String userId = authentication.getName();
        BigDecimal currentBalanceTotal = BigDecimal.ZERO;

        List<FinancialAccount> financialAccounts = this.financialAccountRepository.findAllByUserId(userId);

        for (FinancialAccount financialAccount : financialAccounts) {
            currentBalanceTotal = currentBalanceTotal.add(financialAccount.getBalance());
        }

        return currentBalanceTotal;
    }

    public BigDecimal getTotalMonthlySpending(Authentication authentication, LocalDate selectedDate) {
        String userId = authentication.getName();
        BigDecimal totalSpending = BigDecimal.ZERO;
   
        List<Transaction> transactions = this.transactionRepository.findAllByUserId(userId);
     
        for (Transaction transaction : transactions) {
            if (transaction.getDate().getMonth() == selectedDate.getMonth() &&
                    transaction.getDate().getYear() == selectedDate.getYear()) {

                totalSpending = totalSpending.add(transaction.getAmount());
            }
        }

        return totalSpending;
    }

    public List<Top5SpendingByCategoryByMonthDTO> top5SpendingByCategoryByMonth(Authentication authentication,
            LocalDate selectedDate) {
        String userId = authentication.getName();

        List<Category> categories = this.categoryRepository.findAllByUserId(userId);
        List<Top5SpendingByCategoryByMonthDTO> top5SpendingByCategoryByMonthDTOs = new ArrayList<>();

        Map<Long, BigDecimal> categorySums = new HashMap<>();
        Map<Long, String> categoryNames = new HashMap<>();

        for (Category category : categories) {
            categoryNames.put(category.getId(), category.getName());
        }

        for (Category category : categories) {
            for (Transaction transaction : category.getTransactions()) {           
                if (transaction.getDate().getMonth() == selectedDate.getMonth() &&
                        transaction.getDate().getYear() == selectedDate.getYear()) {                

                    Long categoryId = category.getId();
                    BigDecimal currentSum = categorySums.getOrDefault(categoryId, BigDecimal.ZERO);
                    categorySums.put(categoryId, currentSum.add(transaction.getAmount()));
                }
            }
        }

        for (Map.Entry<Long, BigDecimal> entry : categorySums.entrySet()) {
            Top5SpendingByCategoryByMonthDTO dto = new Top5SpendingByCategoryByMonthDTO();
            dto.setId(entry.getKey());
            dto.setAmount(entry.getValue());
            dto.setName(categoryNames.get(entry.getKey()));
            top5SpendingByCategoryByMonthDTOs.add(dto);
        }
  
        top5SpendingByCategoryByMonthDTOs.sort(
                (a, b) -> b.getAmount().compareTo(a.getAmount()));
   
        return top5SpendingByCategoryByMonthDTOs.subList(0, Math.min(5, top5SpendingByCategoryByMonthDTOs.size()));
    }

    public List<TransactionDTO> recentTransactionsByMonth(Authentication authentication, LocalDate selectedDate) {
        String userId = authentication.getName();

        List<Transaction> transactions = transactionRepository.findAllByUserId(userId);
        List<TransactionDTO> filteredTransactions = new ArrayList<>();

        for (Transaction transaction : transactions) {
            if (transaction.getDate().getMonth() == selectedDate.getMonth() &&
                    transaction.getDate().getYear() == selectedDate.getYear()) {
                filteredTransactions.add(transactionService.translateDBtoWeb(transaction));
            }
        }

        filteredTransactions.sort(
                (a, b) -> b.getDate().compareTo(a.getDate()));

        return filteredTransactions.subList(0, Math.min(5, filteredTransactions.size()));
    }

    public List<Top5SpendingByBudgetByMonthDTO> top5HighestSpendingBudgetsByMonth(Authentication authentication,
            LocalDate selectedDate) {        String userId = authentication.getName();  

        List<Budget> budgets = this.budgetRepository.findAllByUserId(userId);
        List<Top5SpendingByBudgetByMonthDTO> top5SpendingByBudgetByMonthDTOs = new ArrayList<>();

        Map<Long, BigDecimal> budgetSums = new HashMap<>();
        Map<Long, String> budgetNames = new HashMap<>(); 
        Map<Long, BigDecimal> budgetsPercentReached = new HashMap<>();    

        for (Budget budget : budgets) {
            budgetNames.put(budget.getId(), budget.getName());
            budgetsPercentReached.put(budget.getId(), budgetService.calculatePercentReached(budget, selectedDate));
        }

        for (Budget budget : budgets) {      
            for (Category category : budget.getCategories()) {          
                for (Transaction transaction : category.getTransactions()) {
                    if (transaction.getDate().getMonth() == selectedDate.getMonth() &&
                            transaction.getDate().getYear() == selectedDate.getYear()) {

                        Long budgetId = budget.getId();
                        BigDecimal currentSum = budgetSums.getOrDefault(budgetId, BigDecimal.ZERO);
                        budgetSums.put(budgetId, currentSum.add(transaction.getAmount()));
                    }
                }
            }
        }

        for (Map.Entry<Long, BigDecimal> entry : budgetSums.entrySet()) {
            Top5SpendingByBudgetByMonthDTO dto = new Top5SpendingByBudgetByMonthDTO();
            dto.setId(entry.getKey());
            dto.setAmount(entry.getValue());
            dto.setName(budgetNames.get(entry.getKey()));
            dto.setPercentReached(budgetsPercentReached.get(entry.getKey()));
            top5SpendingByBudgetByMonthDTOs.add(dto);
        }

        top5SpendingByBudgetByMonthDTOs.sort(
                (a, b) -> b.getAmount().compareTo(a.getAmount()));

        return top5SpendingByBudgetByMonthDTOs.subList(0, Math.min(5, top5SpendingByBudgetByMonthDTOs.size()));
    }

    public List<FinancialAccountBalanceDTO> getAccountBalances(Authentication authentication) {
        String userId = authentication.getName();

        List<FinancialAccount> financialAccounts = financialAccountRepository.findAllByUserId(userId);
        List<FinancialAccountBalanceDTO> financialAccountBalanceDTOs = new ArrayList<>();

        for (FinancialAccount financialAccount : financialAccounts) {
            FinancialAccountBalanceDTO financialAccountBalanceDTO = new FinancialAccountBalanceDTO();
            financialAccountBalanceDTO.setId(financialAccount.getId());
            financialAccountBalanceDTO.setName(financialAccount.getName());
            financialAccountBalanceDTO.setBalance(financialAccount.getBalance());
            financialAccountBalanceDTOs.add(financialAccountBalanceDTO);
        }

        return financialAccountBalanceDTOs;
    }
}
