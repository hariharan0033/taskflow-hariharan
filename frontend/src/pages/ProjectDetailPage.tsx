import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import Spinner from '../components/Spinner';
import { useTaskStore } from '../store/taskStore';
import { getProject } from '../api/projects';
import type { Project, TaskStatus } from '../types';

const TASK_PAGE_SIZE = 10;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tasks, pagination, loading, error, fetchTasks } = useTaskStore();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    setProjectLoading(true);
    getProject(id)
      .then(setProject)
      .catch(() => setProjectError('Failed to load project'))
      .finally(() => setProjectLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchTasks(id, {
      status: filterStatus || undefined,
      assignee: filterAssignee || undefined,
      page,
      limit: TASK_PAGE_SIZE,
    });
  }, [id, filterStatus, filterAssignee, page]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newStatus: TaskStatus | '', newAssignee: string) => {
    setPage(1);
    setFilterStatus(newStatus);
    setFilterAssignee(newAssignee);
  };

  // Collect unique assignees from tasks for the filter dropdown
  const assigneeOptions = Array.from(
    new Map(
      tasks
        .filter((t) => t.assignee)
        .map((t) => [t.assignee!.id, t.assignee!])
    ).values()
  );

  if (projectLoading) return <><Navbar /><Spinner /></>;

  if (projectError) return (
    <>
      <Navbar />
      <div className="container page">
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h3>Project not found</h3>
          <p>{projectError}</p>
          <Link to="/projects" className="btn btn--ghost" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            ← Back to Projects
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container page">
        <Link to="/projects" className="back-link">← Back to Projects</Link>

        {project && (
          <div className="project-detail-header">
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </div>
        )}

        <div className="page-header">
          <h1 style={{ fontSize: '1.1rem', color: '#64748b' }}>
            Tasks {pagination && <span className="count-badge">({pagination.total})</span>}
          </h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value as TaskStatus | '', filterAssignee)}
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {assigneeOptions.length > 0 && (
            <select
              value={filterAssignee}
              onChange={(e) => handleFilterChange(filterStatus, e.target.value)}
            >
              <option value="">All Assignees</option>
              {assigneeOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}

          {(filterStatus || filterAssignee) && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => handleFilterChange('', '')}
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading && <Spinner />}

        {!loading && error && (
          <div className="state-box">
            <div className="state-icon">⚠️</div>
            <h3>Failed to load tasks</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="state-box">
            <div className="state-icon">✅</div>
            <h3>No tasks in this project</h3>
            <p>Add your first task by clicking <strong>+ New Task</strong>.</p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <>
            <div className="task-list">
              {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
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

      {showModal && id && (
        <CreateTaskModal projectId={id} onClose={() => { setShowModal(false); setPage(1); fetchTasks(id, { page: 1, limit: TASK_PAGE_SIZE }); }} />
      )}
    </>
  );
}
