import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <h3>{project.name}</h3>
      {project.description && <p>{project.description}</p>}
    </div>
  );
}
