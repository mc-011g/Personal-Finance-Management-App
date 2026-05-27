package dev.matthewcarmichael.personal_finance_management_app.data.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Top5SpendingByBudgetByMonthDTO {

    private Long id;

    private String name;

    private BigDecimal amount;

    private BigDecimal percentReached;

    public Top5SpendingByBudgetByMonthDTO(
            Long id,
            String name,
            BigDecimal amount,
            BigDecimal percentReached) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.percentReached = percentReached;
    }
}