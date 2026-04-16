import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import Spinner from '../components/Spinner';
import { useTaskStore } from '../store/taskStore';
import { getProject } from '../api/projects';
import { getTasks } from '../api/tasks';
import type { Project, TaskStatus, User } from '../types';

const TASK_PAGE_SIZE = 10;
const BOARD_FETCH_LIMIT = 100; // fetch all tasks for board view
type ViewMode = 'list' | 'board';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tasks, pagination, loading, error, fetchTasks } = useTaskStore();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<ViewMode>('list');

  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [page, setPage] = useState(1);
  // Fetched once per project — never depends on filtered tasks
  const [allAssignees, setAllAssignees] = useState<Pick<User, 'id' | 'name' | 'email'>[]>([]);

  const refreshAssignees = (projectId: string) => {
    getTasks(projectId, { limit: 500, page: 1 }).then((res) => {
      const map = new Map<string, Pick<User, 'id' | 'name' | 'email'>>();
      res.data.forEach((t) => { if (t.assignee) map.set(t.assignee.id, t.assignee); });
      setAllAssignees(Array.from(map.values()));
    }).catch(() => {});
  };

  // Fetch assignees once when project loads — NOT when filtered tasks change
  useEffect(() => {
    if (!id) return;
    refreshAssignees(id);
  }, [id]);

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
    if (view === 'board') {
      // Board mode: fetch all tasks (no pagination, no status filter)
      fetchTasks(id, { limit: BOARD_FETCH_LIMIT, page: 1 });
    } else {
      fetchTasks(id, {
        status: filterStatus || undefined,
        assignee: filterAssignee || undefined,
        page,
        limit: TASK_PAGE_SIZE,
      });
    }
  }, [id, filterStatus, filterAssignee, page, view]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newStatus: TaskStatus | '', newAssignee: string) => {
    setPage(1);
    setFilterStatus(newStatus);
    setFilterAssignee(newAssignee);
  };

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
          <h1 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Tasks {pagination && <span className="count-badge">({pagination.total})</span>}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* View toggle */}
            <div className="view-toggle">
              <button
                className={`view-toggle__btn${view === 'list' ? ' view-toggle__btn--active' : ''}`}
                onClick={() => setView('list')}
              >
                ☰ List
              </button>
              <button
                className={`view-toggle__btn${view === 'board' ? ' view-toggle__btn--active' : ''}`}
                onClick={() => setView('board')}
              >
                ⊞ Board
              </button>
            </div>
            <button className="btn btn--primary" onClick={() => setShowModal(true)}>
              + New Task
            </button>
          </div>
        </div>

        {/* Filters (list mode only) */}
        {view === 'list' && (
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

          <select
            value={filterAssignee}
            onChange={(e) => handleFilterChange(filterStatus, e.target.value)}
          >
            <option value="">All Assignees</option>
            {allAssignees.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {(filterStatus || filterAssignee) && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => handleFilterChange('', '')}
            >
              Clear Filters
            </button>
          )}
        </div>
        )}

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

        {!loading && !error && tasks.length > 0 && view === 'board' && (
          <KanbanBoard tasks={tasks} />
        )}

        {!loading && !error && tasks.length > 0 && view === 'list' && (
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
        <CreateTaskModal
          projectId={id}
          onClose={() => {
            setShowModal(false);
            refreshAssignees(id); // new assignee may have been added
            if (view === 'board') {
              fetchTasks(id, { limit: BOARD_FETCH_LIMIT, page: 1 });
            } else {
              setPage(1);
              fetchTasks(id, { page: 1, limit: TASK_PAGE_SIZE });
            }
          }}
        />
      )}
    </>
  );
}
