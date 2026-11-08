
package com.nudge.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository
        extends JpaRepository<Subscription, Long> {

    List<Subscription> findByStatus(Subscription.Status status);

    List<Subscription> findByNextChargeDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<Subscription> findByMerchantContainingIgnoreCase(String merchant);
}
