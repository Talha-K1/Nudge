
package com.nudge.backend.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(Task.Status status);

    List<Task> findByPriority(Task.Priority priority);

    List<Task> findByParentTaskId(Long parentTaskId);

    List<Task> findBySourceEmailId(Long sourceEmailId);
}
