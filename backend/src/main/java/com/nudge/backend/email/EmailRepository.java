
package com.nudge.backend.email;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmailRepository extends JpaRepository<Email, Long> {

    List<Email> findBySender(String sender);

    List<Email> findBySubjectContainingIgnoreCase(String subject);
}
