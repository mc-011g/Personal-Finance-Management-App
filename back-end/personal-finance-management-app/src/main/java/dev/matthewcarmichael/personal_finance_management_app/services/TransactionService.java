package dev.matthewcarmichael.personal_finance_management_app.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.TransactionDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Category;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.FinancialAccount;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.Transaction;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.CategoryRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.FinancialAccountRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.TransactionRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.NotFoundException;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FinancialAccountRepository financialAccountRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository,
            FinancialAccountRepository financialAccountRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.financialAccountRepository = financialAccountRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<TransactionDTO> getAllTransactionsForUser(Authentication authentication, LocalDate selectedDate) {
        String userId = authentication.getName();
        List<Transaction> transactions = this.transactionRepository.findAllByUserId(userId);

        List<Transaction> filteredTransactions = new ArrayList<>();

        for (Transaction transaction : transactions) {
            if (transaction.getDate().getYear() == selectedDate.getYear() &&
                    transaction.getDate().getMonth() == selectedDate.getMonth()) {
                filteredTransactions.add(transaction);
            }
        }

        return filteredTransactions.stream().map((transaction) -> this.translateDBtoWeb(transaction)).toList();
    }

    public TransactionDTO getTransactionByNameForUser(String name, Authentication authentication) {
        String userId = authentication.getName();

        Transaction transaction = this.transactionRepository.findByNameAndUserId(name, userId)
                .orElseThrow(() -> new NotFoundException("Transaction not found with specified name and user id."));

        return this.translateDBtoWeb(transaction);
    }

    public TransactionDTO createTransaction(TransactionDTO transactionDTO, Authentication authentication,
            LocalDate selectedDate) {
        Transaction transaction = this.translateWebToDB(transactionDTO, authentication);
        transaction = this.transactionRepository.save(transaction);

        FinancialAccount financialAccount = this.financialAccountRepository
                .findById(transaction.getFinancialAccount().getId())
                .orElseThrow(() -> new NotFoundException("Transaction not found with specified id."));

        financialAccount.setBalance(financialAccount.getBalance().subtract(transaction.getAmount()));
        this.financialAccountRepository.save(financialAccount);

        if (transaction.getDate().getYear() == selectedDate.getYear() &&
                transaction.getDate().getMonth() == selectedDate.getMonth()) {
            return this.translateDBtoWeb(transaction);
        }
        return null;
    }

    public TransactionDTO updateTranscation(TransactionDTO transactionDTO,
            Authentication authentication,
            LocalDate selectedDate) {
        String userId = authentication.getName();

        Transaction transaction = this.translateWebToDB(transactionDTO, authentication);

        if (transaction.getUser().getId().equals(userId)) {
            Transaction originalTransaction = this.transactionRepository.findById(transactionDTO.getId())
                    .orElseThrow(() -> new NotFoundException("Cannot find transaction by id."));

            BigDecimal amountDifference = transaction.getAmount().subtract(originalTransaction.getAmount());

            if ((transaction.getAmount() != originalTransaction.getAmount()) ||
                    (transaction.getFinancialAccount().getId() != originalTransaction.getFinancialAccount().getId())) {

                FinancialAccount financialAccount = this.financialAccountRepository
                        .findById(transaction.getFinancialAccount().getId())
                        .orElseThrow(() -> new NotFoundException("Transaction not found with specified id."));
                financialAccount.setBalance(financialAccount.getBalance().subtract(amountDifference));
                this.financialAccountRepository.save(financialAccount);
            }

            transaction = this.transactionRepository.save(transaction);

            if (transaction.getDate().getYear() == selectedDate.getYear() &&
                    transaction.getDate().getMonth() == selectedDate.getMonth()) {
                return this.translateDBtoWeb(transaction);
            } else {
                return null;
            }
        } else {
            throw new NotFoundException("Transaction does not belong to the user.");
        }
    }

    public void deleteTransaction(long id, Authentication authentication) {
        String userId = authentication.getName();

        Transaction transaction = this.transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found."));

        if (transaction.getUser().getId().equals(userId)) {

            Long financialAccountId = transaction.getFinancialAccount().getId();

            FinancialAccount financialAccount = this.financialAccountRepository
                    .findById(financialAccountId)
                    .orElseThrow(() -> new NotFoundException("Cannot find financial account with this id"));

            financialAccount.setBalance(financialAccount.getBalance().add(transaction.getAmount()));

            this.transactionRepository.deleteById(id);
        } else {
            throw new NotFoundException("Transaction does not belong to the user.");
        }
    }

    public TransactionDTO translateDBtoWeb(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getName(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getFinancialAccount().getId(),
                transaction.getFinancialAccount().getName(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName());
    }

    public Transaction translateWebToDB(TransactionDTO transactionDTO, Authentication authentication) {
        String userId = authentication.getName();

        Transaction transaction = new Transaction();
        transaction.setId(transactionDTO.getId());
        transaction.setName(transactionDTO.getName());
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setDate(transactionDTO.getDate());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        transaction.setUser(user);

        FinancialAccount financialAccount = financialAccountRepository.findById(transactionDTO.getFinancialAccountId())
                .orElseThrow(
                        () -> new NotFoundException(
                                "Transaction not found with id: " + transactionDTO.getFinancialAccountId()));
        transaction.setFinancialAccount(financialAccount);

        Category category = categoryRepository.findById(transactionDTO.getCategoryId()).orElseThrow(
                () -> new NotFoundException(
                        "Category not found with id: " + transactionDTO.getCategoryId()));
        transaction.setCategory(category);

        return transaction;
    }

}
