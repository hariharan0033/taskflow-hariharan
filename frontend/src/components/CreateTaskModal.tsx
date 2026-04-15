import { useState } from 'react';
import Modal from './Modal';
import { useTaskStore } from '../store/taskStore';
import type { TaskPriority, TaskStatus } from '../types';

interface Props {
  projectId: string;
  onClose: () => void;
}

export default function CreateTaskModal({ projectId, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    setLoading(true);
    setError('');
    try {
      await addTask(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
      });
      onClose();
    } catch {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New Task" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-group">
          <label htmlFor="task-title">Title *</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design homepage"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
