
package com.nudge.backend.task;

import com.nudge.backend.user.User;
import com.nudge.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found: " + id));
    }

    public Task createTask(Task task, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + userId));

        task.setUser(user);

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, TaskUpdateRequest request) {
        Task existingTask = getTaskById(id);

        if (request.title() != null) existingTask.setTitle(request.title());
        if (request.description() != null) existingTask.setDescription(request.description());
        if (request.dueAt() != null) existingTask.setDueAt(request.dueAt());
        if (request.priority() != null) existingTask.setPriority(request.priority());
        if (request.status() != null) existingTask.setStatus(request.status());
        if (request.sourceEmailId() != null) existingTask.setSourceEmailId(request.sourceEmailId());
        if (request.parentTaskId() != null) existingTask.setParentTaskId(request.parentTaskId());

        return taskRepository.save(existingTask);
    }

    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
