package dev.matthewcarmichael.personal_finance_management_app.data.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SetupDTO {

    @NotEmpty
    @Size(max = 10000)
    private List<FinancialAccountDTO> financialAccountDTOs;

    @Size(max = 10000)
    private List<BudgetDTO> budgetDTOs;

    @NotEmpty
    @Size(max = 10000)
    private List<CategoryDTO> categoryDTOs;

    @Size(max = 100000)
    private List<TransactionDTO> transactionDTOs;

    public SetupDTO(
            List<FinancialAccountDTO> financialAccountDTOs,
            List<BudgetDTO> budgetDTOs,
            List<CategoryDTO> categoryDTOs,
            List<TransactionDTO> transactionDTOs) {
        this.financialAccountDTOs = financialAccountDTOs;
        this.budgetDTOs = budgetDTOs;
        this.categoryDTOs = categoryDTOs;
        this.transactionDTOs = transactionDTOs;
    }
}