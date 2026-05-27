package dev.matthewcarmichael.personal_finance_management_app.services;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.ProfileUpdateDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.UserDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;
import dev.matthewcarmichael.personal_finance_management_app.data.repositories.UserRepository;
import dev.matthewcarmichael.personal_finance_management_app.web.errors.NotFoundException;
import jakarta.validation.Valid;

@Service
@Validated
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO getUserById(Authentication authentication) {
        String userId = authentication.getName();

        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with specified id."));

        return this.translateDBtoWeb(user);
    }

    public UserDTO createUser(@Valid @RequestBody UserDTO userDTO, String userId) {

        if (this.userRepository.existsById(userId)) {
            throw new IllegalStateException("User already exists with this ID.");
        }
        if (this.userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalStateException("User already exists with this email.");
        }
        userDTO.setOnboardingComplete(false);

        User user = this.translateWebToDB(userDTO);
        user.setId(userId);
        user = this.userRepository.save(user);

        return this.translateDBtoWeb(user);
    }

    public UserDTO updateUser(@Valid @RequestBody ProfileUpdateDTO profileUpdateDTO, Authentication authentication) {
        String userId = authentication.getName();

        User user = this.userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found."));
 
        if (user.getId().equals(userId)) {
            user.setFirstName(profileUpdateDTO.getFirstName());
            user.setLastName(profileUpdateDTO.getLastName());

            user = this.userRepository.save(user);
            return this.translateDBtoWeb(user);
        } else {
            throw new NotFoundException("User id does not match user.");
        }
    }

    public void deleteUser(Authentication authentication) {
        String userId = authentication.getName();

        this.userRepository.findById(userId).orElseThrow(() -> new NotFoundException("Cannot find user."));

        this.userRepository.deleteById(userId);
    }

    public UserDTO translateDBtoWeb(User user) {
        return new UserDTO(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isOnboardingComplete());
    }

    public User translateWebToDB(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setOnboardingComplete(userDTO.getOnboardingComplete());

        return user;
    }

}
