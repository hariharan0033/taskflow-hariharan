import { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';
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

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskCard({ task }: Props) {
  const updateTaskOptimistic = useTaskStore((s) => s.updateTaskOptimistic);
  const removeTask = useTaskStore((s) => s.removeTask);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    setStatusError('');
    try {
      await updateTaskOptimistic(task.id, { status: newStatus });
    } catch {
      setStatusError('Failed to update status — reverted.');
      setTimeout(() => setStatusError(''), 3000);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (newPriority === task.priority) return;
    try {
      await updateTaskOptimistic(task.id, { priority: newPriority });
    } catch {
      setStatusError('Failed to update priority — reverted.');
      setTimeout(() => setStatusError(''), 3000);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await removeTask(task.id);
    } catch {
      setDeleteError('Failed to delete task.');
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
          {task.description && (
            <div className="task-card__desc">{task.description}</div>
          )}
          <div className="task-card__meta">
            {/* Status dropdown */}
            <select
              className={`task-select task-select--${task.status}`}
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              title="Change status"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            {/* Priority dropdown */}
            <select
              className={`task-select task-select--priority task-select--${task.priority}`}
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
              title="Change priority"
            >
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>

            {task.assignee && (
              <span className="task-assignee">@{task.assignee.name}</span>
            )}
            {formattedDue && (
              <span className="task-due">📅 {formattedDue}</span>
            )}
          </div>
          {statusError && <div className="task-inline-error">{statusError}</div>}
          {deleteError && <div className="task-inline-error">{deleteError}</div>}
        </div>
        <div className="task-card__actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>Edit</button>
          <button
            className="btn btn--danger btn--sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>
      {editing && <EditTaskModal task={task} onClose={() => setEditing(false)} />}
    </>
  );
}

