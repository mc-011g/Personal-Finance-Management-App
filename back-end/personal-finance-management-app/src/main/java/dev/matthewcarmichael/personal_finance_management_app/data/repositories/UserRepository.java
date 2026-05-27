package dev.matthewcarmichael.personal_finance_management_app.data.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import dev.matthewcarmichael.personal_finance_management_app.data.entities.User;

public interface UserRepository extends CrudRepository<User, String> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

}
