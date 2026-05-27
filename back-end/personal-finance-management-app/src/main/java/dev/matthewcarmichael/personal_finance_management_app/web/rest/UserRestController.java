package dev.matthewcarmichael.personal_finance_management_app.web.rest;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.matthewcarmichael.personal_finance_management_app.data.dto.ProfileUpdateDTO;
import dev.matthewcarmichael.personal_finance_management_app.data.dto.UserDTO;
import dev.matthewcarmichael.personal_finance_management_app.services.UserService;
import dev.matthewcarmichael.personal_finance_management_app.util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("api/users")
public class UserRestController {

    private final UserService userService;
    private final JWTUtil jwtUtil;

    public UserRestController(UserService userService, JWTUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public UserDTO getUser(Authentication authentication) {
        return this.userService.getUserById(authentication);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        String userId = jwtUtil.extractUserId(token);

        UserDTO createdUser = this.userService.createUser(userDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping
    public UserDTO updateUser(@Valid @RequestBody ProfileUpdateDTO profileUpdateDTO, Authentication authentication) {
        return this.userService.updateUser(profileUpdateDTO, authentication);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.RESET_CONTENT)
    public void deleteUser(Authentication authentication) {
        this.userService.deleteUser(authentication);
    }

}