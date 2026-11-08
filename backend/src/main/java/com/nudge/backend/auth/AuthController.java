
package com.nudge.backend.auth;

import com.nudge.backend.security.JwtService;
import com.nudge.backend.user.User;
import com.nudge.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String DEMO_EMAIL = "demo@nudge.local";
    private static final String SECOND_DEMO_EMAIL = "demo2@nudge.local";

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/demo")
    public ResponseEntity<DemoAuthResponse> demoLogin() {
        User demoUser = userRepository.findByEmail(DEMO_EMAIL)
                .orElseGet(() -> userRepository.save(new User(DEMO_EMAIL)));

        String token = jwtService.generateToken(demoUser);
        return ResponseEntity.ok(new DemoAuthResponse(token));
    }

    @PostMapping("/demo-second")
    public ResponseEntity<DemoAuthResponse> secondDemoLogin() {
        User secondUser = userRepository.findByEmail(SECOND_DEMO_EMAIL)
                .orElseGet(() -> userRepository.save(new User(SECOND_DEMO_EMAIL)));

        String token = jwtService.generateToken(secondUser);
        return ResponseEntity.ok(new DemoAuthResponse(token));
    }

    public record DemoAuthResponse(String token) {
    }
}
