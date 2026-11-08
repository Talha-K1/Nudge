
package com.nudge.backend.subscription;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String merchant;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingCycle billingCycle;

    private LocalDate nextChargeDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    private Long sourceEmailId;

    protected Subscription() {
    }

    public Subscription(String merchant, BigDecimal amount,
                        String currency, BillingCycle billingCycle) {
        this.merchant = merchant;
        this.amount = amount;
        this.currency = currency;
        this.billingCycle = billingCycle;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BillingCycle getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(BillingCycle billingCycle) {
        this.billingCycle = billingCycle;
    }

    public LocalDate getNextChargeDate() {
        return nextChargeDate;
    }

    public void setNextChargeDate(LocalDate nextChargeDate) {
        this.nextChargeDate = nextChargeDate;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Long getSourceEmailId() {
        return sourceEmailId;
    }

    public void setSourceEmailId(Long sourceEmailId) {
        this.sourceEmailId = sourceEmailId;
    }

    public enum BillingCycle {
        WEEKLY,
        MONTHLY,
        YEARLY
    }

    public enum Status {
        ACTIVE,
        CANCELLED
    }
}
