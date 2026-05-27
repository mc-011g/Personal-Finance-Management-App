package dev.matthewcarmichael.personal_finance_management_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PersonalFinanceManagementAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(PersonalFinanceManagementAppApplication.class, args);
	}

}
