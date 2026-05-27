package dev.matthewcarmichael.personal_finance_management_app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class EnvLogger {

    private static final Logger logger = LoggerFactory.getLogger(EnvLogger.class);

    @Value("${DB_URL:NOT_SET}")
    private String dbUrl;

    @Value("${DB_USERNAME:NOT_SET}")
    private String dbUsername;

    @Value("${DB_PASSWORD:NOT_SET}")
    private String dbPassword;

    @Value("${JWKS_URL:NOT_SET}")
    private String jwksURL;

    @Value("${FRONT_END_URL:NOT_SET}")
    private String frontendURL;

    @PostConstruct
    public void logEnv() {
        logger.info("DB_URL: {}", dbUrl);
        logger.info("DB_USERNAME: {}", dbUsername);
        logger.info("DB_PASSWORD: {}", dbPassword);
        logger.info("JWKS_URL: {}", jwksURL);
        logger.info("FRONT_END_URL: {}", frontendURL);
    }

}
