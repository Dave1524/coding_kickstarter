// Analytics tracking for questionnaire feature
// Lightweight implementation - can be replaced with Mixpanel/Posthog later

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private enabled: boolean = true;

  track(event: string, properties?: Record<string, unknown>) {
    if (!this.enabled) return;

    const eventData: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(eventData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }

    // In production, you would send to analytics service
    // Example: mixpanel.track(event, properties);
  }

  // Question flow events
  questionGenerated(ideaLength: number, questionCount: number) {
    this.track('question_generated', {
      idea_length: ideaLength,
      question_count: questionCount,
    });
  }

  questionAnswered(questionIndex: number, answerLength: number, questionType: string) {
    this.track('question_answered', {
      question_index: questionIndex,
      answer_length: answerLength,
      question_type: questionType,
    });
  }

  questionSkipped(questionIndex: number) {
    this.track('question_skipped', {
      question_index: questionIndex,
    });
  }

  questionNavigatedBack(fromIndex: number, toIndex: number) {
    this.track('question_navigated_back', {
      from_index: fromIndex,
      to_index: toIndex,
    });
  }

  readinessChecked(totalQuestions: number, answeredCount: number, skippedCount: number) {
    this.track('readiness_checked', {
      total_questions: totalQuestions,
      answered_count: answeredCount,
      skipped_count: skippedCount,
    });
  }

  guideGenerated(totalQuestions: number, answeredCount: number, timeSpent?: number) {
    this.track('guide_generated', {
      total_questions: totalQuestions,
      answered_count: answeredCount,
      time_spent: timeSpent,
    });
  }

  errorOccurred(errorType: string, context: string) {
    this.track('error_occurred', {
      error_type: errorType,
      context,
    });
  }

  dropOff(stage: string, questionIndex?: number) {
    this.track('drop_off', {
      stage,
      question_index: questionIndex,
    });
  }

  // Deep link events
  deepLinkClicked(stepNumber: number, isFirstStep: boolean) {
    this.track('deep_link_clicked', {
      step_number: stepNumber,
      is_first_step: isFirstStep,
      timestamp: new Date().toISOString(),
    });
  }

  deepLinkSuccess(stepNumber: number, isFirstStep: boolean) {
    this.track('deep_link_success', {
      step_number: stepNumber,
      is_first_step: isFirstStep,
    });
  }

  deepLinkFailed(stepNumber: number, error: string) {
    this.track('deep_link_failed', {
      step_number: stepNumber,
      error,
    });
  }

  taskCompleted(taskId: string, isAutoDetected: boolean) {
    this.track('task_completed', {
      task_id: taskId,
      is_auto_detected: isAutoDetected,
    });
  }

  commandCopied(stepNumber: number) {
    this.track('command_copied', {
      step_number: stepNumber,
    });
  }

  // Get events for debugging/export
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clear() {
    this.events = [];
  }

  // Enable/disable tracking
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const analytics = typeof window !== 'undefined' ? new Analytics() : new Analytics();

