import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

// Loads subjects for dropdowns. Returns { subjects, reload }.
export default function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { subjects, loading, error, reload };
}
