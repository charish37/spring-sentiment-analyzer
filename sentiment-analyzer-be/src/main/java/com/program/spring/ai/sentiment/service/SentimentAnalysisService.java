package com.program.spring.ai.sentiment.service;

import com.program.spring.ai.sentiment.entity.Feedback;
import com.program.spring.ai.sentiment.repository.FeedbackRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class SentimentAnalysisService {
    private final ChatClient chatClient;
    public SentimentAnalysisService( ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public Feedback analyzeFeedback(String content) {
        String prompt = String.format("""
            You are a sentiment analyzer & reply writer.

            1) Classify sentiment as exactly one of: POSITIVE, NEGATIVE, NEUTRAL.
            2) Give a sentiment score between -1 and 1 (−1 most negative, 0 neutral, 1 most positive).
            3) Write a concise, human-friendly reply a support team might send back. Be polite and specific.

            OUTPUT FORMAT (single line, no extra pipes):
            SENTIMENT_TYPE|SCORE|REPLY

            Text: %s
            """, content);

        String response = chatClient
                .prompt(prompt)
                .call()
                .content();

        System.out.println("response:  "+response);

        String[] parts = response.split("\\|",3);
        if (parts.length < 2) {
            throw new IllegalStateException("Unexpected model output: " + response);
        }

//        create Feedback object
        Feedback feedback = new Feedback();
        feedback.setContent(content);
        feedback.setSentimentScore(Double.parseDouble(parts[1].trim()));
        feedback.setSentimentType(Feedback.SentimentType.valueOf(parts[0].trim()));
        feedback.setModelResponse(parts[2].trim());

       return feedback;
    }
}
