import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import { useProjectStore } from '../store/projectStore';
import EditProjectModal from './EditProjectModal';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  const removeProject = useProjectStore((s) => s.removeProject);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}" and all its tasks?`)) return;
    setDeleting(true);
    try {
      await removeProject(project.id);
    } catch {
      alert('Failed to delete project.');
      setDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  return (
    <>
      <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
        <div className="project-card__header">
          <h3>{project.name}</h3>
          <div className="project-card__actions" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn--ghost btn--sm" onClick={handleEdit}>Edit</button>
            <button className="btn btn--danger btn--sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
        {project.description && <p>{project.description}</p>}
      </div>

      {editing && (
        <EditProjectModal project={project} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

