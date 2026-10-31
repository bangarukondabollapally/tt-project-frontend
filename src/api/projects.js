import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function getProjects() {
  const { data } = await client.get('/api/projects');
  return data;
}

export async function createProject(project) {
  const { data } = await client.post('/api/projects', project);
  return data;
}

export async function updateProject(id, project) {
  const { data } = await client.put(`/api/projects/${id}`, project);
  return data;
}

export async function deleteProject(id) {
  await client.delete(`/api/projects/${id}`);
}

export function getErrorMessage(error) {
  if (!error.response) {
    return 'Could not reach the server. Check that the backend is running.';
  }
  return error.response.data?.message ?? 'Something went wrong. Please try again.';
}
