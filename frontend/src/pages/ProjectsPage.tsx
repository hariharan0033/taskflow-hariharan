import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import Spinner from '../components/Spinner';
import { useProjectStore } from '../store/projectStore';

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects } = useProjectStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  return (
    <>
      <Navbar />
      <div className="container page">
        <div className="page-header">
          <h1>Projects</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        {loading && <Spinner />}

        {!loading && error && (
          <div className="state-box">
            <div className="state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={fetchProjects}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="state-box">
            <div className="state-icon">📋</div>
            <h3>No projects yet. Create your first project 🚀</h3>
            <p>Click <strong>+ New Project</strong> to get started.</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
    </>
  );
}
