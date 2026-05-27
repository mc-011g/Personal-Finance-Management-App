package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.FinancialAccountDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.FinancialAccountService;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.BadRequestException;
import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("api/financial-accounts")
public class FinancialAccountRestController {

    private final FinancialAccountService financialAccountService;

    public FinancialAccountRestController(FinancialAccountService financialAccountService) {
        this.financialAccountService = financialAccountService;
    }

    @GetMapping("/{financialAccountName}")
    public FinancialAccountDTO getFinancialAccountForUser(@PathVariable String financialAccountName,
            Authentication authentication) {
        return this.financialAccountService.getFinancialAccountByNameForUser(financialAccountName, authentication);
    }

    @GetMapping
    public List<FinancialAccountDTO> getAllFinancialAccountsForUser(Authentication authentication) {
        return this.financialAccountService.getAllFinancialAccountsForUser(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinancialAccountDTO createFinancialAccount(@Valid @RequestBody FinancialAccountDTO financialAccountDTO,
            Authentication authentication) {
        return this.financialAccountService.createFinancialAccount(financialAccountDTO, authentication);
    }

    @PutMapping("/{financialAccountId}")
    public FinancialAccountDTO updateFinancialAccount(@PathVariable Long financialAccountId,
            @Valid @RequestBody FinancialAccountDTO financialAccountDTO, Authentication authentication) {
        if (financialAccountId != financialAccountDTO.getId()) {
            throw new BadRequestException("Financial account IDs don't match.");
        }
        return this.financialAccountService.updateFinancialAccount(financialAccountDTO, authentication);
    }

    @DeleteMapping("/{financialAccountId}")  
    public ResponseEntity<?> deleteFinancialAccount(@PathVariable Long financialAccountId,
            Authentication authentication) {    
        try {
            this.financialAccountService.deleteFinancialAccount(financialAccountId, authentication);
            return ResponseEntity.status(HttpStatus.RESET_CONTENT).build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "Cannot delete financial account. It is being used by one or more transactions. Please reassign or delete those transactions first.");
        }
    } 

}