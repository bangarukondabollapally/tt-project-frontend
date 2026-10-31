import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/projects.js';
import { STATUSES, validateProject } from '../utils/projects.js';

const EMPTY_PROJECT = { name: '', description: '', startDate: '', deadline: '', status: 'NOT_STARTED' };

function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function ProjectForm({ project, onSubmit, onClose }) {
  const dialogRef = useRef(null);
  const [values, setValues] = useState(() => {
    const { name, description, startDate, deadline, status } = project ?? EMPTY_PROJECT;
    return { name, description, startDate, deadline, status };
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  function fieldProps(name) {
    return {
      id: name,
      name,
      value: values[name],
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
      onChange: (event) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
      },
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateProject(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors(error.response?.data?.fieldErrors ?? {});
      setFormError(getErrorMessage(error));
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-form-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <h2 id="project-form-title">{project ? 'Edit project' : 'New project'}</h2>

        {formError && (
          <p className="notice error" role="alert">
            {formError}
          </p>
        )}

        <Field id="name" label="Project name" error={errors.name}>
          <input type="text" maxLength={150} {...fieldProps('name')} />
        </Field>

        <Field id="description" label="Description" error={errors.description}>
          <textarea rows={4} maxLength={2000} {...fieldProps('description')} />
        </Field>

        <div className="field-pair">
          <Field id="startDate" label="Start date" error={errors.startDate}>
            <input type="date" {...fieldProps('startDate')} />
          </Field>
          <Field id="deadline" label="Deadline" error={errors.deadline}>
            <input type="date" {...fieldProps('deadline')} />
          </Field>
        </div>

        <Field id="status" label="Status" error={errors.status}>
          <select {...fieldProps('status')}>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="dialog-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : project ? 'Save changes' : 'Add project'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default ProjectForm;
