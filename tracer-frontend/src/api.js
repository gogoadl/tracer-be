import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Extract data from ApiResponse format
 * @param {object} response - Axios response object
 * @returns {any} The data from response.data.data
 */
const extractData = (response) => {
  // Check if response follows ApiResponse format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  // Fallback for non-standard responses
  return response.data;
};

/**
 * Extract error message from ApiResponse format
 * @param {object} error - Axios error object
 * @returns {string} Error message
 */
const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error.message || 'An error occurred';
};

/**
 * Fetch available dates that have logs
 * @returns {Promise<string[]>} Array of date strings (YYYY-MM-DD)
 */
export const fetchDates = async () => {
  try {
    const response = await api.get('/api/logs/by-date');
    const data = extractData(response);
    // Return array of dates from the response
    return (data?.logsByDate || []).map(item => item.date);
  } catch (error) {
    console.error('Error fetching dates:', error);
    throw new Error(extractErrorMessage(error));
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
    const data = extractData(response);
    const logs = data?.logs || [];
    
    // Count commands by category
    const commands = {
      git: 0,
      docker: 0,
      node: 0,
      python: 0,
      system: 0
    };
    
    logs.forEach(log => {
      const cmd = log.command?.toLowerCase() || '';
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
        timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
        time: log.time,
        user: log.user,
        working_directory: log.directory,
        command: log.command
      })),
      summary: summary
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Fetch logs with advanced search filters
 * @param {object} filters - Search filters
 * @param {string} filters.start_date - Start date (YYYY-MM-DD)
 * @param {string} filters.end_date - End date (YYYY-MM-DD)
 * @param {string} filters.user - User filter
 * @param {string} filters.directory - Directory filter
 * @param {string} filters.search - Command search
 * @param {number} limit - Limit results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<{logs: Array, total: number, count: number}>} Log entries
 */
export const fetchLogsWithFilters = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Support both startDate/endDate and start_date/end_date
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.user) params.append('user', filters.user);
    if (filters.directory) params.append('directory', filters.directory);
    if (filters.search) params.append('search', filters.search);
    
    // Use provided limit/offset or defaults
    params.append('limit', filters.limit || 100);
    params.append('offset', filters.offset || 0);
    
    const response = await api.get(`/api/logs?${params.toString()}`);
    const data = extractData(response);
    
    // Transform to match frontend expectations
    return {
      logs: (data?.logs || []).map(log => ({
        timestamp: log.timestamp,
        time: log.time || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''),
        user: log.user,
        working_directory: log.directory,
        command: log.command
      })),
      total: data?.total || 0,
      count: data?.count || 0,
      limit: filters.limit || 100,
      offset: filters.offset || 0
    };
  } catch (error) {
    console.error('Error fetching logs with filters:', error);
    throw new Error(extractErrorMessage(error));
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
    throw new Error(extractErrorMessage(error));
  }
};

export const refreshLogsFromFile = async () => {
  try {
    const response = await api.post('/api/reload-logs');
    const data = extractData(response);
    return {
      message: response.data?.message || 'Logs reloaded successfully',
      source: data?.source,
      reloadedCount: data?.reloadedCount
    };
  } catch (error) {
    console.error('Error refreshing logs:', error);
    throw new Error(extractErrorMessage(error));
  }
};

// File Watch APIs
export const fetchWatchFolders = async () => {
  try {
    const response = await api.get('/api/folders');
    const data = extractData(response);
    return data?.folders || [];
  } catch (error) {
    console.error('Error fetching watch folders:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const addWatchFolder = async (path, filePatterns, recursive = true) => {
  try {
    const params = new URLSearchParams({ path });
    if (filePatterns) params.append('file_patterns', filePatterns);
    if (recursive !== undefined) params.append('recursive', recursive);
    
    const response = await api.post(`/api/folders/add?${params.toString()}`);
    const data = extractData(response);
    return {
      message: response.data?.message || 'Folder added successfully',
      folder: data?.folder
    };
  } catch (error) {
    console.error('Error adding watch folder:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const removeWatchFolder = async (folderId) => {
  try {
    const response = await api.delete(`/api/folders/${folderId}`);
    return {
      message: response.data?.message || 'Folder removed successfully'
    };
  } catch (error) {
    console.error('Error removing watch folder:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const toggleWatchFolder = async (folderId) => {
  try {
    const response = await api.post(`/api/folders/${folderId}/toggle`);
    const data = extractData(response);
    return {
      message: response.data?.message || 'Folder status updated',
      isActive: data?.isActive
    };
  } catch (error) {
    console.error('Error toggling watch folder:', error);
    throw new Error(extractErrorMessage(error));
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
    if (params.offset) queryParams.append('offset', params.offset);
    
    const response = await api.get(`/api/changes?${queryParams.toString()}`);
    const data = extractData(response);
    return {
      total: data?.total || 0,
      count: data?.count || 0,
      changes: data?.changes || []
    };
  } catch (error) {
    console.error('Error fetching file changes:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchChangesByDate = async () => {
  try {
    const response = await api.get('/api/changes/by-date');
    const data = extractData(response);
    return data?.changesByDate || [];
  } catch (error) {
    console.error('Error fetching changes by date:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchFileChangeStats = async () => {
  try {
    const response = await api.get('/api/changes/stats');
    const data = extractData(response);
    return data || {};
  } catch (error) {
    console.error('Error fetching file change stats:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchLogFilterOptions = async () => {
  try {
    const response = await api.get('/api/logs/filter-options');
    const data = extractData(response);
    return data || { users: [], directories: [] };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteFileChange = async (changeId) => {
  try {
    const response = await api.delete(`/api/changes/${changeId}`);
    return {
      message: response.data?.message || 'File change deleted successfully',
      id: extractData(response)?.id
    };
  } catch (error) {
    console.error('Error deleting file change:', error);
    throw new Error(extractErrorMessage(error));
  }
};

export default api;
