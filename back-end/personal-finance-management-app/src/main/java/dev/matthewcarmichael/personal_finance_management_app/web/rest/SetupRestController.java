package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.SetupDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.SetupService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("api/setup")
public class SetupRestController {

    private final SetupService setupService;

    public SetupRestController(SetupService setupService) {
        this.setupService = setupService;
    }

    @GetMapping("/complete-status")
    public boolean getCompleteStatus(Authentication authentication) {
        return this.setupService.getCompleteStatus(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void finishSetup(@Valid @RequestBody SetupDTO setupDTO, Authentication authentication) {
        this.setupService.finishSetup(setupDTO, authentication);
    }

}
