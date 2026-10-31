import { describe, expect, it } from 'vitest';
import { formatDate, getDeadlineInfo, validateProject } from './projects.js';

const validProject = {
  name: 'Portfolio',
  description: 'Personal site',
  startDate: '2026-01-10',
  deadline: '2026-02-10',
  status: 'IN_PROGRESS',
};

describe('validateProject', () => {
  it('accepts a complete project', () => {
    expect(validateProject(validProject)).toEqual({});
  });

  it('accepts a deadline on the start date', () => {
    expect(validateProject({ ...validProject, deadline: '2026-01-10' })).toEqual({});
  });

  it('reports every missing mandatory field', () => {
    const errors = validateProject({ name: '  ', description: '', startDate: '', deadline: '', status: '' });
    expect(Object.keys(errors).sort()).toEqual(['deadline', 'description', 'name', 'startDate', 'status']);
  });

  it('rejects a deadline before the start date', () => {
    expect(validateProject({ ...validProject, deadline: '2026-01-09' }).deadline).toBe(
      'Deadline cannot be earlier than the start date'
    );
  });
});

describe('getDeadlineInfo', () => {
  const today = new Date(2026, 0, 15);
  const withDeadline = (deadline, status = 'IN_PROGRESS') => ({ deadline, status });

  it.each([
    ['2026-01-14', 'overdue', 'Overdue by 1 day'],
    ['2026-01-05', 'overdue', 'Overdue by 10 days'],
    ['2026-01-15', 'soon', 'Due today'],
    ['2026-01-16', 'soon', 'Due in 1 day'],
    ['2026-01-22', 'soon', 'Due in 7 days'],
    ['2026-01-23', 'upcoming', 'Due in 8 days'],
  ])('describes a deadline of %s', (deadline, tone, label) => {
    expect(getDeadlineInfo(withDeadline(deadline), today)).toEqual({ tone, label });
  });

  it('does not flag completed projects as overdue', () => {
    expect(getDeadlineInfo(withDeadline('2020-01-01', 'COMPLETED'), today).tone).toBe('done');
  });
});

describe('formatDate', () => {
  it('keeps the calendar day regardless of time zone', () => {
    expect(formatDate('2026-03-01')).toContain('2026');
    expect(formatDate('2026-03-01')).toMatch(/\b1\b/);
  });
});
