package dev.matthewcarmichael.personal_finance_management_app.data.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BudgetDTO {

    private Long id;

    private List<CategoryDTO> categoryDTOs;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("10000000000.00")
    private BigDecimal amount;

    private LocalDate budgetPeriod;

    private BigDecimal percentReached;

    private BigDecimal totalSpent;

    @NotNull
    @Size(min = 1)
    private List<String> categoryIds;

    private List<String> categoryNames;

    public BudgetDTO(
            Long id,
            String name,
            BigDecimal amount,
            LocalDate budgetPeriod,
            List<String> categoryIds,
            List<CategoryDTO> categoryDTOs,
            BigDecimal percentReached,
            BigDecimal totalSpent,
            List<String> categoryNames) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.budgetPeriod = budgetPeriod;
        this.categoryIds = categoryIds;
        this.categoryDTOs = categoryDTOs;
        this.percentReached = percentReached;
        this.totalSpent = totalSpent;
        this.categoryNames = categoryNames;
    }
}