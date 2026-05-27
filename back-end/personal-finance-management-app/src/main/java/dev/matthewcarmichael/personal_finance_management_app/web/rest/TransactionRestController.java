package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.TransactionDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.TransactionService;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.BadRequestException;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("api/transactions")
public class TransactionRestController {

    private final TransactionService transactionService;

    public TransactionRestController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/{transactionName}")
    public TransactionDTO getTransactionForUser(@PathVariable String transactionName, Authentication authentication) {
        return this.transactionService.getTransactionByNameForUser(transactionName, authentication);
    }

    @GetMapping
    public List<TransactionDTO> getAllTransactionsForUser(Authentication authentication,
            @RequestParam LocalDate selectedDate) {
        return this.transactionService.getAllTransactionsForUser(authentication, selectedDate);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDTO createTransaction(@Valid @RequestBody TransactionDTO transactionDTO,
            Authentication authentication, @RequestParam LocalDate selectedDate) {
        return this.transactionService.createTransaction(transactionDTO, authentication, selectedDate);
    }

    @PutMapping("/{transactionId}")
    public TransactionDTO updateTransaction(@PathVariable Long transactionId,
            @Valid @RequestBody TransactionDTO transactionDTO,
            Authentication authentication,
            @RequestParam LocalDate selectedDate) {

        if (transactionId != transactionDTO.getId()) {
            throw new BadRequestException("Transactions IDs don't match.");
        }

        return this.transactionService.updateTranscation(transactionDTO, authentication, selectedDate);
    }

    @DeleteMapping("/{transactionId}")
    @ResponseStatus(HttpStatus.RESET_CONTENT)
    public void deleteTransaction(@PathVariable Long transactionId, Authentication authentication) {
        this.transactionService.deleteTransaction(transactionId, authentication);
    }

}
