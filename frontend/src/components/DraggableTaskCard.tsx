import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { Task } from '../types';

export default function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
    >
      <div className="drag-wrapper">
        {/* Isolated handle: only this element starts the drag */}
        <button className="drag-handle" {...listeners} type="button" title="Drag to move">
          ⠿
        </button>
        <div className="drag-wrapper__card">
          <TaskCard task={task} />
        </div>
      </div>
    </div>
  );
}
