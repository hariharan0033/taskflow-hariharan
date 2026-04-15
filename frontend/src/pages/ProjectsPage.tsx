import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import Spinner from '../components/Spinner';
import { useProjectStore } from '../store/projectStore';

const PAGE_SIZE = 6;

export default function ProjectsPage() {
  const { projects, pagination, loading, error, fetchProjects } = useProjectStore();
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchProjects({ page, limit: PAGE_SIZE }); }, [page]);

  return (
    <>
      <Navbar />
      <div className="container page">
        <div className="page-header">
          <h1>Projects {pagination && <span className="count-badge">({pagination.total})</span>}</h1>
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
            <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={() => fetchProjects({ page, limit: PAGE_SIZE })}>
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
          <>
            <div className="grid">
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => { setShowModal(false); fetchProjects({ page, limit: PAGE_SIZE }); }}
        />
      )}
    </>
  );
}
