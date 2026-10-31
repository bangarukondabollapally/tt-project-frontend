import { useState } from 'react';
import { STATUSES, formatDate, getDeadlineInfo } from '../utils/projects.js';

function ProjectCard({ project, isBusy, onEdit, onDelete, onStatusChange }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deadlineInfo = getDeadlineInfo(project);

  return (
    <li className={`project-card tone-${deadlineInfo.tone}`}>
      <div className="deadline">
        <span className="deadline-caption">Deadline</span>
        <strong className="deadline-date">{formatDate(project.deadline)}</strong>
        <span className="deadline-label">{deadlineInfo.label}</span>
      </div>

      <div className="project-body">
        <h2>{project.name}</h2>
        <p className="project-description">{project.description}</p>
        <p className="project-start">Start date: {formatDate(project.startDate)}</p>

        <div className="project-actions">
          <label className="status-control">
            Status
            <select
              className={`status-${project.status}`}
              value={project.status}
              disabled={isBusy}
              onChange={(event) => onStatusChange(project, event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="button-row">
            {confirmingDelete ? (
              <>
                <span className="confirm-text">Delete this project?</span>
                <button type="button" className="button danger" disabled={isBusy} onClick={() => onDelete(project)}>
                  Yes, delete
                </button>
                <button type="button" className="button" onClick={() => setConfirmingDelete(false)}>
                  Keep
                </button>
              </>
            ) : (
              <>
                <button type="button" className="button" onClick={() => onEdit(project)}>
                  Edit
                </button>
                <button type="button" className="button" onClick={() => setConfirmingDelete(true)}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default ProjectCard;
