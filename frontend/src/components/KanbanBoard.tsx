import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../types';
import { useTaskStore } from '../store/taskStore';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export default function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const updateTaskOptimistic = useTaskStore((s) => s.updateTaskOptimistic);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync from store when not mid-drag (new task added, deleted, etc.)
  useEffect(() => {
    if (!activeTask) setLocalTasks(tasks);
  }, [tasks, activeTask]);

  // Require 8px of movement before drag activates — lets clicks on buttons pass through
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const grouped = STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, s) => { acc[s] = localTasks.filter((t) => t.status === s); return acc; },
    { todo: [], in_progress: [], done: [] }
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(localTasks.find((t) => t.id === active.id) ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const task = localTasks.find((t) => t.id === activeId)!;

    // If dropped on a column id → that's the target status
    // If dropped on another task id → use that task's column
    const targetStatus: TaskStatus = (STATUSES as string[]).includes(overId)
      ? (overId as TaskStatus)
      : (localTasks.find((t) => t.id === overId)?.status ?? task.status);

    if (targetStatus !== task.status) {
      // Cross-column drop → optimistic status change
      setLocalTasks((prev) =>
        prev.map((t) => t.id === activeId ? { ...t, status: targetStatus } : t)
      );
      try {
        await updateTaskOptimistic(activeId, { status: targetStatus });
      } catch {
        setLocalTasks(tasks); // revert on API failure
      }
    } else {
      // Same-column drop → reorder locally only (no backend order field)
      const col = grouped[targetStatus];
      const oldIdx = col.findIndex((t) => t.id === activeId);
      const newIdx = col.findIndex((t) => t.id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        const reordered = arrayMove(col, oldIdx, newIdx);
        setLocalTasks((prev) => [
          ...prev.filter((t) => t.status !== targetStatus),
          ...reordered,
        ]);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {STATUSES.map((s) => (
          <KanbanColumn key={s} status={s} tasks={grouped[s]} />
        ))}
      </div>

      {/* Ghost card shown under the cursor while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="drag-overlay">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
