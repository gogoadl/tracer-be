export const translations = {
  en: {
    // App Title
    appTitle: "Tracer",
    
    // Sidebar Menu
    dashboard: { label: "Dashboard", name: "Dashboard" },
    logs: { label: "Command Logs", name: "Command Logs" },
    watcher: { label: "File Watcher", name: "File Watcher" },
    changes: { label: "File Changes", name: "File Changes" },
    
    // Dashboard
    commandLogAnalytics: "Command Log Analytics",
    fileChangeAnalytics: "File Change Analytics",
    totalCommands: "Total Commands",
    avgPerDay: "Avg per Day",
    changesByEventType: "Changes by Event Type",
    changesOverTime: "Changes Over Time",
    topFileExtensions: "Top File Extensions",
    mostActiveDirectories: "Most Active Directories",
    
    // Logs
    selectDate: "Select Date",
    orSelectDate: "or Select Date",
    noLogsFound: "No log entries found for this date.",
    selectDateToView: "Select a date to view logs",
    entry: "entry",
    entries: "entries",
    commandLogs: "Command Logs",
    
    // Filters
    searchAndFilters: "Search & Filters",
    clearFilters: "Clear Filters",
    activeFilters: "Active Filters",
    allUsers: "All Users",
    allDirectories: "All Directories",
    searchCommands: "Search commands, filenames, etc...",
    user: "User",
    search: "Search",
    directory: "Directory",
    activeFilter: "Active Filters",
    
    // Summary
    aiSummary: "AI Summary",
    reanalyze: "Reanalyze",
    analyzing: "Analyzing...",
    
    // File Watcher
    addFolder: "Add Folder",
    folderPath: "Folder Path",
    filePatterns: "File Patterns",
    recursive: "Recursive",
    active: "Active",
    remove: "Remove",
    toggle: "Toggle",
    edit: "Edit",
    noWatchedFolders: "No watched folders yet. Add one to start monitoring file changes.",
    
    // File Changes
    noChanges: "No file changes recorded yet. Start watching folders to see changes here.",
    
    // File Diff
    before: "Before (Old Version)",
    after: "After (New Version)",
    noDiff: "No changes detected",
    removed: "Removed",
    added: "Added",
    changed: "Changed",
    unchanged: "Unchanged",
    
    // Charts
    totalChanges: "Total Changes",
    fileExtensions: "File Extensions",
    directories: "Directories",
    
    // Periods
    last7Days: "Last 7 days",
    last14Days: "Last 14 days",
    last30Days: "Last 30 days",
    lastYear: "Last year",
    
    // General
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
  },
  
  ko: {
    // App Title
    appTitle: "추적기",
    
    // Sidebar Menu
    dashboard: { label: "대시보드", name: "Dashboard" },
    logs: { label: "커맨드 로그", name: "Command Logs" },
    watcher: { label: "파일 워처", name: "File Watcher" },
    changes: { label: "파일 변경사항", name: "File Changes" },
    
    // Dashboard
    commandLogAnalytics: "커맨드 로그 분석",
    fileChangeAnalytics: "파일 변경 분석",
    totalCommands: "총 명령어",
    avgPerDay: "일평균",
    changesByEventType: "이벤트 타입별 변경",
    changesOverTime: "시간별 변경 추이",
    topFileExtensions: "주요 파일 확장자",
    mostActiveDirectories: "가장 활발한 디렉토리",
    
    // Logs
    selectDate: "날짜 선택",
    orSelectDate: "또는 날짜 선택",
    noLogsFound: "이 날짜에 대한 로그 항목을 찾을 수 없습니다.",
    selectDateToView: "로그를 보려면 날짜를 선택하세요",
    entry: "항목",
    entries: "항목",
    commandLogs: "커맨드 로그",
    
    // Filters
    searchAndFilters: "검색 및 필터",
    clearFilters: "필터 초기화",
    activeFilters: "활성 필터",
    allUsers: "모든 사용자",
    allDirectories: "모든 디렉토리",
    searchCommands: "명령어, 파일명 등을 검색하세요...",
    user: "사용자",
    search: "검색",
    directory: "디렉토리",
    activeFilter: "활성 필터",
    
    // Summary
    aiSummary: "AI 요약",
    reanalyze: "재분석",
    analyzing: "분석 중...",
    
    // File Watcher
    addFolder: "폴더 추가",
    folderPath: "폴더 경로",
    filePatterns: "파일 패턴",
    recursive: "재귀",
    active: "활성",
    remove: "제거",
    toggle: "전환",
    edit: "편집",
    noWatchedFolders: "아직 감시 중인 폴더가 없습니다. 폴더를 추가하여 파일 변경을 모니터링하세요.",
    
    // File Changes
    noChanges: "아직 파일 변경사항이 기록되지 않았습니다. 폴더를 감시하면 변경사항을 여기서 볼 수 있습니다.",
    
    // File Diff
    before: "이전 버전",
    after: "새 버전",
    noDiff: "변경사항이 감지되지 않음",
    removed: "삭제됨",
    added: "추가됨",
    changed: "변경됨",
    unchanged: "변경 없음",
    
    // Charts
    totalChanges: "총 변경",
    fileExtensions: "파일 확장자",
    directories: "디렉토리",
    
    // Periods
    last7Days: "최근 7일",
    last14Days: "최근 14일",
    last30Days: "최근 30일",
    lastYear: "최근 1년",
    
    // General
    loading: "로딩 중...",
    error: "오류",
    retry: "다시 시도",
    cancel: "취소",
    save: "저장",
    delete: "삭제",
    edit: "편집",
    close: "닫기",
    back: "뒤로",
    next: "다음",
    previous: "이전",
  }
};

export const getTranslation = (key, language = 'en') => {
  const lang = translations[language] || translations.en;
  return lang[key] || key;
};

export default translations;

