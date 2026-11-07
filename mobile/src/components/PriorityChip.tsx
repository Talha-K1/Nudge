import { Text, View, StyleSheet } from 'react-native';
import { Priority, priorityColor } from '../theme';

export function PriorityChip({ priority }: { priority: Priority }) {
  const c = priorityColor(priority);
  return (
    <View style={[styles.chip, { backgroundColor: c + '22' }]}>
      <Text style={[styles.text, { color: c }]}>{priority}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});