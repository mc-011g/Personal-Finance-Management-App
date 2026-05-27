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
public class Top5SpendingByCategoryByMonthDTO {

    private Long id;

    private String name;

    private BigDecimal amount;

    public Top5SpendingByCategoryByMonthDTO(
            Long id,
            String name,
            BigDecimal amount) {
        this.id = id;
        this.name = name;
        this.amount = amount;
    }
}