package com.program.spring.ai.sentiment.controller;

import com.program.spring.ai.sentiment.entity.Feedback;
import com.program.spring.ai.sentiment.repository.FeedbackRepository;
import com.program.spring.ai.sentiment.service.SentimentAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173/")
public class FeedbackController {
    private final FeedbackRepository feedbackRepository;
    private final SentimentAnalysisService service;

    public FeedbackController(FeedbackRepository feedbackRepository, SentimentAnalysisService sentimentAnalysisService) {
        this.feedbackRepository = feedbackRepository;
        this.service = sentimentAnalysisService;
    }

    @GetMapping
    public List<Feedback> getAllFeedback(){
        return feedbackRepository.findAll();
    }

    @PostMapping
    public Feedback saveFeedback(@RequestBody String content){
        Feedback feedback1 = service.analyzeFeedback(content);
        return feedbackRepository.save(feedback1);
    }
}
