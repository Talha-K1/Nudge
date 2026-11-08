
package com.nudge.backend.task;

import java.time.Instant;

public record TaskUpdateRequest(
        String title,
        String description,
        Instant dueAt,
        Task.Priority priority,
        Task.Status status,
        Long sourceEmailId,
        Long parentTaskId
) {
}
