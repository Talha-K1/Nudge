
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView, 
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useTasks,
  useUpdateTask,
  useCreateTask,
} from '@/src/api/hooks';

import type { Task } from '@/src/api/types';
import type { Priority } from '@/src/theme';

import { Card } from '@/src/components/Card';
import { PriorityChip } from '@/src/components/PriorityChip';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { ErrorState } from '@/src/components/ErrorState';
import { EmptyState } from '@/src/components/EmptyState/EmptyState';

import { daysUntil, formatDue } from '@/src/lib/dates';
import { colors, spacing } from '@/src/theme';

type Filter = 'today' | 'upcoming' | 'done';
type DueChoice = 'today' | 'tomorrow' | 'threeDays' | 'none';

const filters: { label: string; value: Filter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Done', value: 'done' },
];

const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

const dueChoices: { label: string; value: DueChoice }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'In 3 days', value: 'threeDays' },
  { label: 'No date', value: 'none' },
];

// Calculate a due date at 5 PM local time and convert it to ISO.
function makeDueDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(17, 0, 0, 0);
  return date.toISOString();
}

export default function Tasks() {
  const router = useRouter();

  // Get tasks from the API.
  const {
    data = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTasks();

  const updateTask = useUpdateTask();
  const createTask = useCreateTask();

  // Only show top-level tasks.
  const top = data.filter((t) => !t.parentTaskId);

  // Current filter.
  const [filter, setFilter] = useState<Filter>('today');

  // Add-task modal state.
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueChoice, setDueChoice] = useState<DueChoice>('today');
  const [titleError, setTitleError] = useState('');

  // Filter and sort tasks.
  const visibleTasks = top
    .filter((task) => {
      if (filter === 'done') {
        return task.status === 'DONE';
      }

      if (task.status === 'DONE') {
        return false;
      }

      if (filter === 'today') {
        return !task.dueAt || daysUntil(task.dueAt) <= 0;
      }

      return !!task.dueAt && daysUntil(task.dueAt) > 0;
    })
    .sort((a, b) => {
      const aDate = a.dueAt
        ? new Date(a.dueAt).getTime()
        : Infinity;

      const bDate = b.dueAt
        ? new Date(b.dueAt).getTime()
        : Infinity;

      return aDate - bDate;
    });

  // Toggle a task between DONE and TODO.
  function toggleTask(task: Task) {
    updateTask.mutate({
      id: task.id,
      patch: {
        status: task.status === 'DONE' ? 'TODO' : 'DONE',
      },
    });
  }

  // Reset the add-task form.
  function resetForm() {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueChoice('today');
    setTitleError('');
  }

  // Close the modal.
  function closeModal() {
    setModalVisible(false);
    resetForm();
  }

  // Create a new task.
  function saveTask() {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setTitleError('Please enter a task title.');
      return;
    }

    let dueAt: string | undefined;

    if (dueChoice === 'today') {
      dueAt = makeDueDate(0);
    } else if (dueChoice === 'tomorrow') {
      dueAt = makeDueDate(1);
    } else if (dueChoice === 'threeDays') {
      dueAt = makeDueDate(3);
    }

    createTask.mutate(
      {
        title: cleanTitle,
        description: description.trim() || undefined,
        priority,
        dueAt,
      },
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );
  }

  // Render one task.
  function renderTask({ item }: { item: Task }) {
    const isDone = item.status === 'DONE';

    return (
      <Card style={styles.taskCard}>
        <View style={styles.taskRow}>
          {/* Completion checkbox */}
          <Pressable
            style={styles.checkbox}
            onPress={() => toggleTask(item)}
            accessibilityRole="button"
            accessibilityLabel={
              isDone ? 'Mark task incomplete' : 'Complete task'
            }
          >
            <Ionicons
              name={
                isDone
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              size={27}
              color={isDone ? colors.primary : colors.muted}
            />
          </Pressable>

          {/* Task details */}
          <Pressable
            style={styles.taskDetails}
            onPress={() =>
              router.push({
                pathname: '/task/[id]',
                params: { id: String(item.id) },
              })
            }
          >
            <Text
              style={[
                styles.taskTitle,
                isDone && styles.completedTitle,
              ]}
            >
              {item.title}
            </Text>

            <View style={styles.taskMeta}>
              <PriorityChip priority={item.priority} />

              <Text style={styles.dueText}>
                {formatDue(item.dueAt)}
              </Text>
            </View>
          </Pressable>
        </View>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError && data.length === 0) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTask}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {isError && <ErrorBanner />}
            <Text style={styles.heading}>My Tasks</Text>

            <Text style={styles.subtitle}>
              Keep track of what needs to get done.
            </Text>

            {/* Filter buttons */}
            <View style={styles.filterRow}>
              {filters.map((item) => {
                const active = filter === item.value;

                return (
                  <Pressable
                    key={item.value}
                    style={[
                      styles.filterButton,
                      active && styles.activeFilter,
                    ]}
                    onPress={() => setFilter(item.value)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.activeFilterText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState title="Nothing here" />
        }
      />

      {/* Floating add button */}
      <Pressable
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add task"
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </Pressable>

      {/* Add task modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Task</Text>

                <Pressable onPress={closeModal}>
                  <Ionicons
                    name="close"
                    size={26}
                    color={colors.muted}
                  />
                </Pressable>
              </View>

              {/* Title */}
              <Text style={styles.fieldLabel}>Task title *</Text>

              <TextInput
                style={styles.input}
                placeholder="What do you need to do?"
                placeholderTextColor={colors.muted}
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  setTitleError('');
                }}
                maxLength={120}
              />

              {titleError ? (
                <Text style={styles.errorText}>{titleError}</Text>
              ) : null}

              {/* Description */}
              <Text style={styles.fieldLabel}>
                Description (optional)
              </Text>

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Add some details..."
                placeholderTextColor={colors.muted}
                value={description}
                onChangeText={setDescription}
                multiline
              />

              {/* Priority */}
              <Text style={styles.fieldLabel}>Priority</Text>

              <View style={styles.optionRow}>
                {priorities.map((item) => {
                  const active = priority === item;

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.optionButton,
                        active && styles.activeOption,
                      ]}
                      onPress={() => setPriority(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.activeOptionText,
                        ]}
                      >
                        {item.charAt(0) + item.slice(1).toLowerCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Due date */}
              <Text style={styles.fieldLabel}>Due date</Text>

              <View style={styles.dueChoiceRow}>
                {dueChoices.map((item) => {
                  const active = dueChoice === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      style={[
                        styles.dueChoice,
                        active && styles.activeOption,
                      ]}
                      onPress={() => setDueChoice(item.value)}
                    >
                      <Text
                        style={[
                          styles.dueChoiceText,
                          active && styles.activeOptionText,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Save */}
              <Pressable
                style={[
                  styles.saveButton,
                  (!title.trim() || createTask.isPending) &&
                    styles.disabledButton,
                ]}
                onPress={saveTask}
                disabled={!title.trim() || createTask.isPending}
              >
                {createTask.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Task</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 110,
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  taskCard: {
    marginBottom: spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dueText: {
    color: colors.muted,
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  descriptionInput: {
    minHeight: 75,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.high,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  activeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  activeOptionText: {
    color: '#FFFFFF',
  },
  dueChoiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dueChoice: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  dueChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
