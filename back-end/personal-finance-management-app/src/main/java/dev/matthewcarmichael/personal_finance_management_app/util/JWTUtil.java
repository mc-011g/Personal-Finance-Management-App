package dev.matthewcarmichael.personal_finance_management_app.util;

import java.net.URL;
import java.text.ParseException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.RemoteKeySourceException;
import com.nimbusds.jose.crypto.Ed25519Verifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKMatcher;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

@Component
public class JWTUtil {

    private final RemoteJWKSet<SecurityContext> jwkSet;

    public JWTUtil(@Value("${neon.jwksUrl}") String jwksUrl) throws Exception {
        this.jwkSet = new RemoteJWKSet<>(new URL(jwksUrl));
    }

    public Boolean validateToken(String token) {

        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            String kid = signedJWT.getHeader().getKeyID();

            List<JWK> keys = jwkSet.get(new JWKSelector(new JWKMatcher.Builder().keyID(kid).build()), null);

            if (keys.isEmpty()) {
                return false;
            }

            OctetKeyPair okp = (OctetKeyPair) keys.get(0);

            JWSVerifier verifier = new Ed25519Verifier(okp);

            return signedJWT.verify(verifier);

        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        } catch (RemoteKeySourceException e) {
            e.printStackTrace();
            return null;
        } catch (JOSEException e) {
            e.printStackTrace();
            return null;
        }

    }

    public String extractUserId(String token) {

        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            String kid = signedJWT.getHeader().getKeyID();
            List<JWK> keys = jwkSet.get(new JWKSelector(new JWKMatcher.Builder().keyID(kid).build()), null);

            if (keys.isEmpty()) {
                return null;
            }

            OctetKeyPair okp = (OctetKeyPair) keys.get(0);
            JWSVerifier verifier = new Ed25519Verifier(okp);

            if (!signedJWT.verify(verifier)) {
                return null;
            }

            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            return claimsSet.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}