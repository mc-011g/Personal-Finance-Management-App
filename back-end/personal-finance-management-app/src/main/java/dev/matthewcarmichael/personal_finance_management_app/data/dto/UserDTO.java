package dev.matthewcarmichael.personal_finance_management_app.data.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDTO {

    private String id;

    @NotBlank
    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    private Boolean onboardingComplete = false;

    public UserDTO(String id, String email, String firstName, String lastName, Boolean onboardingComplete) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.onboardingComplete = onboardingComplete;
    }

    public UserDTO(String email, String firstName, String lastName, Boolean onboardingComplete) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.onboardingComplete = onboardingComplete;
    }

}