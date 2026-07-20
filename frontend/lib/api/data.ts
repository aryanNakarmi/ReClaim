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
