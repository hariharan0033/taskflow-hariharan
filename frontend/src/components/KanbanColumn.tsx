import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../types';
import DraggableTaskCard from './DraggableTaskCard';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function KanbanColumn({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`kanban-col${isOver ? ' kanban-col--over' : ''}`}>
      <div className="kanban-col__header">
        <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>
        <span className="kanban-col__count">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-col__body">
          {tasks.length === 0 ? (
            <p className="kanban-empty">Drop tasks here</p>
          ) : (
            tasks.map((t) => <DraggableTaskCard key={t.id} task={t} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
