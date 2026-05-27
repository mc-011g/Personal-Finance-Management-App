package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.FinancialAccountBalanceDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.Top5SpendingByBudgetByMonthDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.Top5SpendingByCategoryByMonthDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.TransactionDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.FinancialAccountService;
import dev.matthewcarmichael.personal_finance_management_app.services.MetricsService;
import dev.matthewcarmichael.personal_finance_management_app.services.SetupService;
import dev.matthewcarmichael.personal_finance_management_app.services.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("api/metrics")
public class MetricsRestController {

    private final MetricsService metricsService;

    public MetricsRestController(UserService userService, SetupService setupService,
            FinancialAccountService financialAccountService, MetricsService metricsService) {     
        this.metricsService = metricsService;   
    }

    @GetMapping("/current-balance-total")
    public BigDecimal getCurrentBalanceTotal(Authentication authentication) {
        return this.metricsService.getCurrentBalanceTotal(authentication);
    }

    @GetMapping("/total-monthly-spending")
    public BigDecimal getTotalMonthlySpending(Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.metricsService.getTotalMonthlySpending(authentication, selectedDate);
    }

    @GetMapping("/top-5-spending-by-category-by-month")
    public List<Top5SpendingByCategoryByMonthDTO> top5SpendingByCategoryByMonth(Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.metricsService.top5SpendingByCategoryByMonth(authentication, selectedDate);
    }

    @GetMapping("/recent-transactions-by-month")
    public List<TransactionDTO> recentTransactionsByMonth(Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.metricsService.recentTransactionsByMonth(authentication, selectedDate);
    }

    @GetMapping("/top-5-highest-spending-budgets-by-month")
    public List<Top5SpendingByBudgetByMonthDTO> top5HighestSpendingBudgetsByMonth(Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.metricsService.top5HighestSpendingBudgetsByMonth(authentication, selectedDate);
    }   

    @GetMapping("/account-balances")
    public List<FinancialAccountBalanceDTO> getAccountBalances(Authentication authentication) {
        return this.metricsService.getAccountBalances(authentication);
    }
    
}