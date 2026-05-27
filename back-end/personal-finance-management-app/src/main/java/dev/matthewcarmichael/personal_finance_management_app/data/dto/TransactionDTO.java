package dev.matthewcarmichael.personal_finance_management_app.data.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

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
public class TransactionDTO {

    private Long id;

    @NotNull
    private Long financialAccountId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("10000000000.00")
    private BigDecimal amount;

    @NotNull
    private Long categoryId;

    @NotNull
    private LocalDate date;

    @Size(max = 100)
    private String categoryName;

    @Size(max = 100)
    private String financialAccountName;

    public TransactionDTO(Long id, String name, BigDecimal amount, LocalDate date, Long financialAccountId,
            String financialAccountName, Long categoryId, String categoryName) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.financialAccountId = financialAccountId;
        this.financialAccountName = financialAccountName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }
}
