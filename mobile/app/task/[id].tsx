
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  useTasks,
  useUpdateTask,
  useBreakdown,
  useDeleteTask,
} from '@/src/api/hooks';

import type { Email, Task } from '@/src/api/types';

import { Card } from '@/src/components/Card';
import { PriorityChip } from '@/src/components/PriorityChip';
import { EmptyState } from '@/src/components/EmptyState/EmptyState';
import { formatDue } from '@/src/lib/dates';
import { colors, spacing } from '@/src/theme';

type TaskWithEmail = Task & {
  sourceEmail?: Pick<Email, 'subject' | 'sender' | 'snippet'> | null;
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data = [], isLoading } = useTasks();

  const task = data.find((t) => String(t.id) === id) as
    | TaskWithEmail
    | undefined;

  const steps = data.filter((t) => String(t.parentTaskId) === id);

  const updateTask = useUpdateTask();
  const breakdown = useBreakdown();
  const deleteTask = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!task) {
    return <EmptyState title="Task not found" />;
  }

  // TypeScript now knows this task definitely exists.
  const currentTask: TaskWithEmail = task;

  const isDone = currentTask.status === 'DONE';
  const doneCount = steps.filter(
    (step) => step.status === 'DONE'
  ).length;

  function toggleTask(item: Task) {
    updateTask.mutate({
      id: item.id,
      patch: {
        status: item.status === 'DONE' ? 'TODO' : 'DONE',
      },
    });
  }

  function startEditing() {
    setEditTitle(currentTask.title);
    setEditDescription(currentTask.description ?? '');
    setIsEditing(true);
  }

  function saveEdit() {
    const cleanTitle = editTitle.trim();

    if (!cleanTitle) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }

    updateTask.mutate(
      {
        id: currentTask.id,
        patch: {
          title: cleanTitle,
          description: editDescription.trim() || null,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  }

  function confirmDelete() {
    Alert.alert(
      'Delete task?',
      'This task will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask.mutate(currentTask.id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Task details</Text>

        <Pressable
          onPress={confirmDelete}
          style={styles.deleteButton}
        >
          <Ionicons
            name="trash-outline"
            size={21}
            color={colors.high}
          />
        </Pressable>
      </View>

      {/* Main task information */}
      <Card>
        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.label}>Title</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Description</Text>

            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              style={[styles.input, styles.descriptionInput]}
              placeholder="Add a description..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.editActions}>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveEdit}
                disabled={updateTask.isPending}
                style={[styles.actionButton, styles.primaryButton]}
              >
                {updateTask.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.taskTitle,
                  isDone && styles.completedTitle,
                ]}
              >
                {currentTask.title}
              </Text>

              <Pressable
                onPress={startEditing}
                style={styles.editButton}
              >
                <Ionicons
                  name="pencil-outline"
                  size={19}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            <View style={styles.metadata}>
              <PriorityChip priority={currentTask.priority} />

              <View style={styles.dueDate}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={colors.muted}
                />
                <Text style={styles.metadataText}>
                  {currentTask.dueAt
                    ? formatDue(currentTask.dueAt)
                    : 'No due date'}
                </Text>
              </View>
            </View>

            <Text style={styles.status}>
              Status: {currentTask.status}
            </Text>

            {currentTask.description ? (
              <Text style={styles.description}>
                {currentTask.description}
              </Text>
            ) : (
              <Text style={styles.noDescription}>
                No description added.
              </Text>
            )}
          </>
        )}

        {/* Task actions */}
        {!isEditing && (
          <View style={styles.mainActions}>
            <Pressable
              onPress={() => toggleTask(currentTask)}
              disabled={updateTask.isPending}
              style={[
                styles.actionButton,
                isDone ? styles.cancelButton : styles.primaryButton,
              ]}
            >
              <Text
                style={
                  isDone
                    ? styles.cancelButtonText
                    : styles.primaryButtonText
                }
              >
                {isDone ? 'Reopen task' : 'Mark as done'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                updateTask.mutate({
                  id: currentTask.id,
                  patch: { status: 'SNOOZED' },
                })
              }
              disabled={updateTask.isPending}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Snooze</Text>
            </Pressable>
          </View>
        )}
      </Card>

      {/* Source email */}
      {currentTask.sourceEmail && (
        <Card>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="mail-outline"
              size={19}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Source email</Text>
          </View>

          <Text style={styles.emailSubject}>
            {currentTask.sourceEmail.subject}
          </Text>

          <Text style={styles.metadataText}>
            From: {currentTask.sourceEmail.sender}
          </Text>

          {currentTask.sourceEmail.snippet ? (
            <Text style={styles.description}>
              {currentTask.sourceEmail.snippet}
            </Text>
          ) : null}
        </Card>
      )}

      {/* Subtasks */}
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Steps</Text>

          {steps.length > 0 && (
            <Text style={styles.progressText}>
              {doneCount} of {steps.length} done
            </Text>
          )}
        </View>

        {steps.length > 0 ? (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(doneCount / steps.length) * 100}%`,
                  },
                ]}
              />
            </View>

            {steps.map((step) => {
              const stepDone = step.status === 'DONE';

              return (
                <Pressable
                  key={step.id}
                  onPress={() => toggleTask(step)}
                  style={styles.stepRow}
                >
                  <Ionicons
                    name={
                      stepDone
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={22}
                    color={
                      stepDone ? colors.primary : colors.muted
                    }
                  />

                  <Text
                    style={[
                      styles.stepTitle,
                      stepDone && styles.completedTitle,
                    ]}
                  >
                    {step.title}
                  </Text>
                </Pressable>
              );
            })}
          </>
        ) : (
          <View style={styles.noSteps}>
            <Text style={styles.noStepsText}>
              This task has no steps yet.
            </Text>

            <Pressable
              onPress={() => breakdown.mutate(currentTask.id)}
              disabled={breakdown.isPending}
              style={[styles.actionButton, styles.primaryButton]}
            >
              {breakdown.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="sparkles-outline"
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.primaryButtonText}>
                    Break this down
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  editButton: {
    padding: spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metadataText: {
    fontSize: 13,
    color: colors.muted,
  },
  status: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.muted,
  },
  description: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  noDescription: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
  },
  mainActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  progressText: {
    fontSize: 13,
    color: colors.muted,
  },
  progressTrack: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  stepTitle: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  noSteps: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  noStepsText: {
    fontSize: 14,
    color: colors.muted,
  },
  emailSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  editContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    minHeight: 100,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
