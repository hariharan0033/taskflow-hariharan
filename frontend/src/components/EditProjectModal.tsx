import { useState } from 'react';
import Modal from './Modal';
import { useProjectStore } from '../store/projectStore';
import type { Project } from '../types';

interface Props {
  project: Project;
  onClose: () => void;
}

export default function EditProjectModal({ project, onClose }: Props) {
  const editProject = useProjectStore((s) => s.editProject);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }

    setLoading(true);
    setError('');
    try {
      await editProject(project.id, { name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch {
      setError('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Project" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-group">
          <label htmlFor="edit-proj-name">Name *</label>
          <input
            id="edit-proj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-proj-desc">Description</label>
          <textarea
            id="edit-proj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
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
