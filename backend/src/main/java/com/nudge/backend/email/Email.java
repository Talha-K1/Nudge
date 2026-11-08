
package com.nudge.backend.email;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "emails")
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;

    private String sender;

    private Instant receivedAt;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    // Required by JPA
    protected Email() {
    }

    public Email(String subject, String sender,
                 Instant receivedAt, String snippet) {
        this.subject = subject;
        this.sender = sender;
        this.receivedAt = receivedAt;
        this.snippet = snippet;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }
}
