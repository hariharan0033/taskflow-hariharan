import { useState } from 'react';
import Modal from './Modal';
import { useProjectStore } from '../store/projectStore';

interface Props {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: Props) {
  const addProject = useProjectStore((s) => s.addProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }

    setLoading(true);
    setError('');
    try {
      await addProject({ name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch {
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New Project" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-group">
          <label htmlFor="proj-name">Name *</label>
          <input
            id="proj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Redesign"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="proj-desc">Description</label>
          <textarea
            id="proj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
