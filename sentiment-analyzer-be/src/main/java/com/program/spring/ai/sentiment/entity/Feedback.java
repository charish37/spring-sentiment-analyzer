package com.program.spring.ai.sentiment.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Feedback {
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;
    private String content;
    private Double sentimentScore;
    private LocalDateTime createdAt = LocalDateTime.now();
    @Enumerated(EnumType.STRING)
    private SentimentType sentimentType;

    public enum SentimentType {
        POSITIVE, NEGATIVE, NEUTRAL
    }

    @Column(length = 2000)
    private String modelResponse;
}
