import { useState } from 'react';
import Modal from './Modal';
import { useTaskStore } from '../store/taskStore';
import type { Task, TaskPriority, TaskStatus } from '../types';

interface Props {
  task: Task;
  onClose: () => void;
}

export default function EditTaskModal({ task, onClose }: Props) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    setLoading(true);
    setError('');
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
      });
      onClose();
    } catch {
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Task" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-group">
          <label htmlFor="edit-title">Title *</label>
          <input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-desc">Description</label>
          <textarea
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-status">Status</label>
          <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="edit-priority">Priority</label>
          <select id="edit-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="edit-due">Due Date</label>
          <input
            id="edit-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
