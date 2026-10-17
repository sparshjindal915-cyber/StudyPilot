import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send the HTTP-only auth cookie
  timeout: 15000,
});

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (err?.request && !err.response) return 'Cannot reach the server. Check your connection.';
  return fallback;
}

// Maps server validation details [{field, message}] to { field: message }.
export function getFieldErrors(err) {
  const out = {};
  for (const d of err?.response?.data?.details || []) {
    if (d.field && !out[d.field]) out[d.field] = d.message;
  }
  return out;
}

export default api;
