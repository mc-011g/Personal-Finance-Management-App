package dev.matthewcarmichael.personal_finance_management_app.services;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.FinancialAccountDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.FinancialAccount;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.FinancialAccountRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.TransactionRepository;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.NotFoundException;

@Service
public class FinancialAccountService {

    private final UserRepository userRepository;
    private final FinancialAccountRepository financialAccountRepository;

    public FinancialAccountService(FinancialAccountRepository financialAccountRepository, UserRepository userRepository,
            TransactionRepository transactionRepository) {
        this.financialAccountRepository = financialAccountRepository;
        this.userRepository = userRepository;
    }

    public List<FinancialAccountDTO> getAllFinancialAccountsForUser(Authentication authentication) {
        String userId = authentication.getName();
        List<FinancialAccount> financialAccounts = this.financialAccountRepository.findAllByUserId(userId);

        return financialAccounts.stream().map((financialAccount) -> this.translateDBtoWeb(financialAccount)).toList();
    }

    public FinancialAccountDTO getFinancialAccountByNameForUser(String name, Authentication authentication) {
        String userId = authentication.getName();

        FinancialAccount financialAccount = this.financialAccountRepository.findByNameAndUserId(name, userId)
                .orElseThrow(() -> new NotFoundException("Financial account not found with specified name and id."));

        return this.translateDBtoWeb(financialAccount);
    }

    public FinancialAccountDTO createFinancialAccount(FinancialAccountDTO financialAccountDTO,
            Authentication authentication) {

        FinancialAccount financialAccount = this.translateWebToDB(financialAccountDTO, authentication);
        financialAccount = this.financialAccountRepository.save(financialAccount);

        return this.translateDBtoWeb(financialAccount);
    }

    public FinancialAccountDTO updateFinancialAccount(FinancialAccountDTO financialAccountDTO,
            Authentication authentication) {
        String userId = authentication.getName();

        FinancialAccount financialAccount = this.financialAccountRepository.findById(financialAccountDTO.getId())
                .orElseThrow(() -> new NotFoundException("Financial account not found."));

        if (financialAccount.getUser().getId().equals(userId)) {

            financialAccount.setName(financialAccountDTO.getName());
            financialAccount.setBalance(financialAccountDTO.getBalance());

            financialAccount = this.financialAccountRepository.save(financialAccount);
            return this.translateDBtoWeb(financialAccount);
        } else {
            throw new NotFoundException("Financial account does not belong to user.");
        }
    }

    public void deleteFinancialAccount(long id, Authentication authentication) {
        String userId = authentication.getName();

        FinancialAccount financialAccount = this.financialAccountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Financial account not found"));

        if (financialAccount.getUser().getId().equals(userId)) {
            this.financialAccountRepository.deleteById(id);
        } else {
            throw new NotFoundException("Transaction does not belong to the user.");
        }

        this.financialAccountRepository.deleteById(id);
    }

    public FinancialAccountDTO translateDBtoWeb(FinancialAccount financialAccount) {
        return new FinancialAccountDTO(
                financialAccount.getId(),
                financialAccount.getName(),
                financialAccount.getBalance());
    }

    public FinancialAccount translateWebToDB(FinancialAccountDTO financialAccountDTO, Authentication authentication) {
        String userId = authentication.getName();

        FinancialAccount financialAccount = new FinancialAccount();
        financialAccount.setId(financialAccountDTO.getId());
        financialAccount.setName(financialAccountDTO.getName());
        financialAccount.setBalance(financialAccountDTO.getBalance());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(
                        "Financial account not found with id: " + userId));
        financialAccount.setUser(user);

        return financialAccount;
    }

}
