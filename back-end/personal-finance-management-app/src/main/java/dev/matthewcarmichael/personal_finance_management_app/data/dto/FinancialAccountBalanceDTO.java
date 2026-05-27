package dev.matthewcarmichael.personal_finance_management_app.data.dto;

import java.math.BigDecimal;

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
public class FinancialAccountBalanceDTO {

    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("10000000000.00")
    private BigDecimal balance;

    public FinancialAccountBalanceDTO(
            Long id,
            String name,
            BigDecimal balance) {
        this.id = id;
        this.name = name;
        this.balance = balance;
    }
}