import axios from './axios';

/**
 * Export all user data (profile, lost reports, claims) as a JSON object.
 * Triggers a browser download of the data as a JSON file.
 */
export const exportUserData = async (): Promise<void> => {
  const response = await axios.get('/api/v1/data/export');
  if (response.data.success) {
    const data = response.data.data;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reclaim-export-${data.exportedAt?.split('T')[0] || 'data'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } else {
    throw new Error(response.data.message || 'Failed to export data');
  }
};

/**
 * Import user data from a previously exported JSON file.
 * Restores profile info and lost reports.
 * @param file The JSON file selected by the user
 */
export const importUserData = async (file: File): Promise<string> => {
  const text = await file.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file');
  }

  const response = await axios.post('/api/v1/data/import', {
    profile: data.profile,
    lostReports: data.lostReports,
  });

  if (response.data.success) {
    return response.data.message;
  }
  throw new Error(response.data.message || 'Failed to import data');
};
