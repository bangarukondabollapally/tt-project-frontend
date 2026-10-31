import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, deleteProject, getErrorMessage, getProjects, updateProject } from '../api/projects.js';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import { STATUSES } from '../utils/projects.js';

const PROJECTS_KEY = ['projects'];
const NOTICE_DURATION_MS = 4000;
const NEW_PROJECT = 'new';

function ProjectsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [formTarget, setFormTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  const { data: projects, isPending, error, refetch, isFetching } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: getProjects,
  });

  useEffect(() => {
    if (notice?.type !== 'success') {
      return undefined;
    }
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const refreshProjects = () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
  // A failed change can mean the list is out of date, for example a project deleted in another tab.
  const handleChangeError = (mutationError) => {
    setNotice({ type: 'error', text: getErrorMessage(mutationError) });
    refreshProjects();
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, values }) => (id ? updateProject(id, values) : createProject(values)),
    onSuccess: async (saved, { id }) => {
      await refreshProjects();
      setFormTarget(null);
      setNotice({ type: 'success', text: `“${saved.name}” ${id ? 'updated' : 'added'}.` });
    },
    onError: refreshProjects,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, name, description, startDate, deadline, status }) =>
      updateProject(id, { name, description, startDate, deadline, status }),
    onSuccess: async (saved) => {
      await refreshProjects();
      const label = STATUSES.find((status) => status.value === saved.status).label;
      setNotice({ type: 'success', text: `“${saved.name}” marked ${label}.` });
    },
    onError: handleChangeError,
  });

  const deleteMutation = useMutation({
    mutationFn: (project) => deleteProject(project.id),
    onSuccess: async (_, project) => {
      await refreshProjects();
      setNotice({ type: 'success', text: `“${project.name}” deleted.` });
    },
    onError: handleChangeError,
  });

  const visibleProjects = projects?.filter((project) => filter === 'ALL' || project.status === filter);
  const editingProject = formTarget === NEW_PROJECT ? null : formTarget;
  const isBusy = statusMutation.isPending || deleteMutation.isPending;

  function countFor(status) {
    return projects?.filter((project) => project.status === status).length ?? 0;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Project Tracker</h1>
          <p>Record your software projects and keep track of their deadlines.</p>
        </div>
        <button type="button" className="button primary" onClick={() => setFormTarget(NEW_PROJECT)}>
          New project
        </button>
      </header>

      <div className="filters" role="group" aria-label="Filter projects by status">
        <button type="button" aria-pressed={filter === 'ALL'} onClick={() => setFilter('ALL')}>
          All <span className="count">{projects?.length ?? 0}</span>
        </button>
        {STATUSES.map((status) => (
          <button
            key={status.value}
            type="button"
            aria-pressed={filter === status.value}
            onClick={() => setFilter(status.value)}
          >
            {status.label} <span className="count">{countFor(status.value)}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {notice && (
          <p className={`notice ${notice.type}`}>
            <span>{notice.text}</span>
            <button type="button" className="notice-close" aria-label="Dismiss" onClick={() => setNotice(null)}>
              ×
            </button>
          </p>
        )}
      </div>

      {isPending && <p className="state">Loading projects…</p>}

      {!projects && error && (
        <div className="state" role="alert">
          <h2>Could not load projects</h2>
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="button" disabled={isFetching} onClick={() => refetch()}>
            {isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      )}

      {projects?.length === 0 && (
        <div className="state">
          <h2>No projects yet</h2>
          <p>Add your first project to start tracking it.</p>
        </div>
      )}

      {projects?.length > 0 && visibleProjects.length === 0 && (
        <div className="state">
          <h2>Nothing here</h2>
          <p>No projects have the status “{STATUSES.find((status) => status.value === filter).label}”.</p>
        </div>
      )}

      {visibleProjects?.length > 0 && (
        <ul className="project-list">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isBusy={isBusy}
              onEdit={setFormTarget}
              onDelete={(target) => deleteMutation.mutate(target)}
              onStatusChange={(target, status) => statusMutation.mutate({ ...target, status })}
            />
          ))}
        </ul>
      )}

      {formTarget && (
        <ProjectForm
          key={editingProject?.id ?? NEW_PROJECT}
          project={editingProject}
          onClose={() => setFormTarget(null)}
          onSubmit={(values) => saveMutation.mutateAsync({ id: editingProject?.id, values })}
        />
      )}
    </div>
  );
}

export default ProjectsPage;
