
package com.nudge.backend.task;

import com.nudge.backend.user.User;
import com.nudge.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // Get all tasks belonging to a specific user
    @Transactional(readOnly = true)
    public List<Task> getAllTasks(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    // Get one task, but only if it belongs to the user
    @Transactional(readOnly = true)
    public Task getTaskById(Long id, Long userId) {
        return taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"
                        ));
    }

    // Create a task and assign it to its owner
    public Task createTask(Task task, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));

        task.setUser(user);

        return taskRepository.save(task);
    }

    // Update only a task belonging to the user
    public Task updateTask(Long id, TaskUpdateRequest request, Long userId) {
        Task existingTask = getTaskById(id, userId);

        if (request.title() != null) existingTask.setTitle(request.title());
        if (request.description() != null) existingTask.setDescription(request.description());
        if (request.dueAt() != null) existingTask.setDueAt(request.dueAt());
        if (request.priority() != null) existingTask.setPriority(request.priority());
        if (request.status() != null) existingTask.setStatus(request.status());
        if (request.sourceEmailId() != null) existingTask.setSourceEmailId(request.sourceEmailId());
        if (request.parentTaskId() != null) existingTask.setParentTaskId(request.parentTaskId());

        return taskRepository.save(existingTask);
    }

    // Delete only a task belonging to the user
    public void deleteTask(Long id, Long userId) {
        Task task = getTaskById(id, userId);
        taskRepository.delete(task);
    }
}
