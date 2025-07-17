import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import {
  Sortable,
  SortableItem,
  SortableRenderItemProps,
} from "react-native-reanimated-dnd";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function AppOrderScreen({ navigation }) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Learn React Native", completed: false },
    { id: "2", title: "Build an app", completed: false },
    { id: "3", title: "Deploy to store", completed: true },
    { id: "4", title: "Celebrate success", completed: false },
  ]);

  // Use a ref to hold the current order during drag
  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;

  // Handler to update the order only when dropped
  const handleDrop = useCallback((itemId: string, to: number) => {
    const from = tasksRef.current.findIndex((t) => t.id === itemId);
    if (from === -1 || from === to) return;
    const newTasks = [...tasksRef.current];
    const [movedTask] = newTasks.splice(from, 1);
    newTasks.splice(to, 0, movedTask);
    setTasks(newTasks);
  }, []);

  const renderTask = useCallback(
    (props: SortableRenderItemProps<Task>) => {
      const {
        item,
        id,
        positions,
        lowerBound,
        autoScrollDirection,
        itemsCount,
        itemHeight,
      } = props;
      return (
        <SortableItem
          key={id}
          data={item}
          id={id}
          positions={positions}
          lowerBound={lowerBound}
          autoScrollDirection={autoScrollDirection}
          itemsCount={itemsCount}
          itemHeight={itemHeight}
          onDrop={handleDrop}
          style={styles.taskItem}
        >
          <View style={styles.taskContent}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskStatus}>
                {item.completed ? "✅ Completed" : "⏳ Pending"}
              </Text>
            </View>
            <SortableItem.Handle style={styles.dragHandle}>
              <View style={styles.dragIconContainer}>
                <View style={styles.dragColumn}>
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                </View>
                <View style={styles.dragColumn}>
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                </View>
              </View>
            </SortableItem.Handle>
          </View>
        </SortableItem>
      );
    },
    [handleDrop]
  );

  return (
    <ImageBackground
      source={require("../../assets/background_gradient.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack && navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#F7F7F7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Order</Text>
          <View style={styles.headerButtons} />
        </View>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Sortable
            data={tasks}
            renderItem={renderTask}
            itemHeight={80}
            style={styles.list}
          />
        </GestureHandlerRootView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    // No backgroundColor here
  },
  header: {
    backgroundColor: 'rgba(23, 47, 80, 0.7)',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222C3A",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "MBold",
    color: "#F7F7F7",
  },
  headerButtons: {
    width: 40,
  },
  headerButton: {
    padding: 8,
  },
  list: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    // No background, border, or borderRadius
  },
  taskItem: {
    height: 80,
    backgroundColor: "transparent",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: 'rgba(30, 40, 60, 0.7)', // semi-transparent, not white
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  taskInfo: {
    flex: 1,
    paddingRight: 16,
  },
  taskTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  taskStatus: {
    color: "#8E8E93",
    fontSize: 14,
  },
  dragHandle: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dragIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dragColumn: {
    flexDirection: "column",
    gap: 2,
  },
  dragDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#6D6D70",
  },
});