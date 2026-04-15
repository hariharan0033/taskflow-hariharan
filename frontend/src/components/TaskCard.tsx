import { useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { useTaskStore } from '../store/taskStore';
import EditTaskModal from './EditTaskModal';

interface Props {
  task: Task;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export default function TaskCard({ task }: Props) {
  const updateTaskOptimistic = useTaskStore((s) => s.updateTaskOptimistic);
  const removeTask = useTaskStore((s) => s.removeTask);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusClick = async () => {
    const next = NEXT_STATUS[task.status];
    try {
      await updateTaskOptimistic(task.id, { status: next });
    } catch {
      // revert already handled in store
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await removeTask(task.id);
    } catch {
      setDeleting(false);
    }
  };

  const formattedDue = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : null;

  return (
    <>
      <div className="task-card">
        <div className="task-card__body">
          <div className="task-card__title">{task.title}</div>
          <div className="task-card__meta">
            <button
              className={`badge badge--${task.status}`}
              onClick={handleStatusClick}
              title="Click to advance status"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {STATUS_LABELS[task.status]}
            </button>
            <span className={`badge badge--${task.priority}`}>{task.priority}</span>
            {task.assignee && (
              <span className="task-assignee">@{task.assignee.name}</span>
            )}
            {formattedDue && (
              <span className="task-due">📅 {formattedDue}</span>
            )}
          </div>
        </div>
        <div className="task-card__actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>Edit</button>
          <button
            className="btn btn--danger btn--sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '…' : 'Del'}
          </button>
        </div>
      </div>
      {editing && <EditTaskModal task={task} onClose={() => setEditing(false)} />}
    </>
  );
}
