import { useState } from 'react';

// Myers diff algorithm implementation
function highlightDiff(oldText, newText) {
  if (!oldText) oldText = '';
  if (!newText) newText = '';
  
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  // Myers diff algorithm
  const maxD = oldLines.length + newLines.length;
  const v = new Array(2 * maxD + 1);
  
  for (let d = 0; d <= maxD; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x, y;
      
      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1];
      } else {
        x = v[k - 1] + 1;
      }
      
      y = x - k;
      
      while (x < oldLines.length && y < newLines.length && oldLines[x] === newLines[y]) {
        x++;
        y++;
      }
      
      v[k] = x;
      
      if (x >= oldLines.length && y >= newLines.length) {
        // Found the shortest edit path
        return reconstructDiff(oldLines, newLines, k, v, d);
      }
    }
  }
  
  // Fallback to simple line-by-line diff
  const diff = [];
  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = i < oldLines.length ? oldLines[i] : null;
    const newLine = i < newLines.length ? newLines[i] : null;
    
    if (oldLine === newLine) {
      diff.push({ type: 'unchanged', old: oldLine || '', new: newLine || '' });
    } else {
      diff.push({ type: 'changed', old: oldLine || '', new: newLine || '' });
    }
  }
  
  return diff;
}

function reconstructDiff(oldLines, newLines, k, v, d) {
  // Simple and accurate diff reconstruction
  const diff = [];
  const oldSet = new Set(oldLines.map((line, idx) => ({line, idx})));
  const newSet = new Set(newLines.map((line, idx) => ({line, idx})));
  
  let oldIdx = 0;
  let newIdx = 0;
  
  while (oldIdx < oldLines.length && newIdx < newLines.length) {
    if (oldLines[oldIdx] === newLines[newIdx]) {
      // Lines match
      diff.push({ type: 'unchanged', old: oldLines[oldIdx], new: newLines[newIdx] });
      oldIdx++;
      newIdx++;
    } else {
      // Find next match for current old line
      let foundOldNext = false;
      let oldNextMatchAt = -1;
      for (let j = newIdx + 1; j < newLines.length; j++) {
        if (oldLines[oldIdx] === newLines[j]) {
          foundOldNext = true;
          oldNextMatchAt = j;
          break;
        }
      }
      
      // Find next match for current new line
      let foundNewNext = false;
      let newNextMatchAt = -1;
      for (let j = oldIdx + 1; j < oldLines.length; j++) {
        if (newLines[newIdx] === oldLines[j]) {
          foundNewNext = true;
          newNextMatchAt = j;
          break;
        }
      }
      
      if (foundOldNext && !foundNewNext) {
        // Current old line removed
        diff.push({ type: 'removed', old: oldLines[oldIdx], new: '' });
        oldIdx++;
      } else if (foundNewNext && !foundOldNext) {
        // Current new line added
        diff.push({ type: 'added', old: '', new: newLines[newIdx] });
        newIdx++;
      } else {
        // Both lines changed
        diff.push({ type: 'changed', old: oldLines[oldIdx], new: newLines[newIdx] });
        oldIdx++;
        newIdx++;
      }
    }
  }
  
  // Handle remaining lines
  while (oldIdx < oldLines.length) {
    diff.push({ type: 'removed', old: oldLines[oldIdx], new: '' });
    oldIdx++;
  }
  
  while (newIdx < newLines.length) {
    diff.push({ type: 'added', old: '', new: newLines[newIdx] });
    newIdx++;
  }
  
  return diff;
}

const FileDiffView = ({ change }) => {
  const [showDiff, setShowDiff] = useState(false);

  // Parse content from raw_data JSON
  let contentBefore = null;
  let contentAfter = null;
  
  try {
    if (change.raw_data) {
      const parsed = JSON.parse(change.raw_data);
      contentBefore = parsed.content_before;
      contentAfter = parsed.content_after;
    }
  } catch (e) {
    console.error('Failed to parse content data:', e);
  }

  if (!contentBefore && !contentAfter) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No file content available for comparison
      </div>
    );
  }

  const diff = showDiff ? highlightDiff(contentBefore, contentAfter) : [];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {change.file_name}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            change.event_type === 'modified' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            change.event_type === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {change.event_type}
          </span>
          {change.size && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(change.size)} bytes
            </span>
          )}
        </div>
        <button
          onClick={() => setShowDiff(!showDiff)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          {showDiff ? 'Hide' : 'Show'} Diff
        </button>
      </div>

      {showDiff && diff.length > 0 && (
        <div className="relative">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 grid grid-cols-2 gap-2 bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2 px-4">
            <div className="px-2 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-t">
              Before (이전 버전)
            </div>
            <div className="px-2 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-t">
              After (새 버전)
            </div>
          </div>
          
          {/* Content */}
          <div className="max-h-96 overflow-auto px-4 pb-4">
            <div className="text-xs font-mono">
              {diff.map((line, idx) => (
                <div key={idx} className={`grid grid-cols-2 gap-2 ${
                  line.type === 'unchanged' ? '' :
                  line.type === 'changed' ? 'bg-yellow-50 dark:bg-yellow-950' :
                  line.type === 'added' ? 'bg-green-50 dark:bg-green-950' :
                  'bg-red-50 dark:bg-red-950'
                }`}>
                {/* Left: Before (Old version) */}
                <div className={`px-2 py-1 whitespace-pre-wrap break-all border-r border-gray-200 dark:border-gray-700 min-h-[1.5rem] ${
                  line.type === 'removed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 line-through' : 
                  line.type === 'changed' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-gray-700 dark:text-gray-300' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {line.old || '\u00A0'}
                </div>
                {/* Right: After (New version) */}
                <div className={`px-2 py-1 whitespace-pre-wrap break-all min-h-[1.5rem] ${
                  line.type === 'added' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  line.type === 'changed' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-gray-700 dark:text-gray-300' :
                  line.type === 'removed' ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {line.new || '\u00A0'}
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default FileDiffView;

