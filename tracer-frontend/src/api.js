import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetch available dates that have logs
 * @returns {Promise<string[]>} Array of date strings (YYYY-MM-DD)
 */
export const fetchDates = async () => {
  try {
    const response = await api.get('/api/logs/by-date');
    // Return array of dates from the response
    return response.data.logs_by_date.map(item => item.date);
  } catch (error) {
    console.error('Error fetching dates:', error);
    throw error;
  }
};

/**
 * Fetch logs for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<{entries: Array, summary: string}>} Log entries and summary
 */
export const fetchLogsByDate = async (date) => {
  try {
    const response = await api.get(`/api/logs/date/${date}`);
    // Transform the response to match frontend expectations
    const logs = response.data.logs || [];
    
    // Count commands by category
    const commands = {
      git: 0,
      docker: 0,
      node: 0,
      python: 0,
      system: 0
    };
    
    logs.forEach(log => {
      const cmd = log.command.toLowerCase();
      if (cmd.startsWith('git')) commands.git++;
      else if (cmd.startsWith('docker')) commands.docker++;
      else if (cmd.includes('npm') || cmd.includes('node')) commands.node++;
      else if (cmd.includes('python') || cmd.includes('pip')) commands.python++;
      else commands.system++;
    });
    
    // Create summary text
    const summary = `On ${date}, ${logs.length} commands were executed. ` +
      `Git: ${commands.git}, Docker: ${commands.docker}, ` +
      `Python: ${commands.python}, Node: ${commands.node}, Others: ${commands.system}`;
    
    return {
      entries: logs.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        time: log.time,
        user: log.user,
        working_directory: log.directory,
        command: log.command
      })),
      summary: summary
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

/**
 * Analyze logs for a specific date (placeholder)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<{summary: string}>} Analysis summary
 */
export const analyzeLogs = async (date) => {
  try {
    // This endpoint doesn't exist in the backend yet
    // For now, just return a message
    console.log('Analyze endpoint not yet implemented');
    return {
      summary: `Analysis for ${date} (feature coming soon)`
    };
  } catch (error) {
    console.error('Error analyzing logs:', error);
    throw error;
  }
};

// File Watch APIs
export const fetchWatchFolders = async () => {
  try {
    const response = await api.get('/api/folders');
    return response.data.folders || [];
  } catch (error) {
    console.error('Error fetching watch folders:', error);
    throw error;
  }
};

export const addWatchFolder = async (path, filePatterns, recursive = true) => {
  try {
    const params = new URLSearchParams({ path });
    if (filePatterns) params.append('file_patterns', filePatterns);
    if (recursive !== undefined) params.append('recursive', recursive);
    
    const response = await api.post(`/api/folders/add?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error adding watch folder:', error);
    throw error;
  }
};

export const removeWatchFolder = async (folderId) => {
  try {
    const response = await api.delete(`/api/folders/${folderId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing watch folder:', error);
    throw error;
  }
};

export const toggleWatchFolder = async (folderId) => {
  try {
    const response = await api.post(`/api/folders/${folderId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Error toggling watch folder:', error);
    throw error;
  }
};

export const fetchFileChanges = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.event_type) queryParams.append('event_type', params.event_type);
    if (params.file_extension) queryParams.append('file_extension', params.file_extension);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await api.get(`/api/changes?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching file changes:', error);
    throw error;
  }
};

export const fetchChangesByDate = async () => {
  try {
    const response = await api.get('/api/changes/by-date');
    return response.data.changes_by_date || [];
  } catch (error) {
    console.error('Error fetching changes by date:', error);
    throw error;
  }
};

export const fetchFileChangeStats = async () => {
  try {
    const response = await api.get('/api/changes/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching file change stats:', error);
    throw error;
  }
};

export default api;

