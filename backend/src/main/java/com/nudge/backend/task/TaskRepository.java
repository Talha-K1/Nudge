
package com.nudge.backend.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks belonging to a specific user
    List<Task> findByUserId(Long userId);

    // Find one specific task belonging to a specific user
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    // Find a user's tasks by status
    List<Task> findByUserIdAndStatus(Long userId, Task.Status status);

    // Find a user's tasks by priority
    List<Task> findByUserIdAndPriority(Long userId, Task.Priority priority);

    // Find a user's subtasks
    List<Task> findByUserIdAndParentTaskId(Long userId, Long parentTaskId);

    // Find a user's tasks from a specific email
    List<Task> findByUserIdAndSourceEmailId(Long userId, Long sourceEmailId);
}
