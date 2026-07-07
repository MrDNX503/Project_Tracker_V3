// ============================================
// Data Export / Import Service
// JSON format for full project backup & restore
// ============================================

export interface ExportData {
  version: string;
  exportedAt: string;
  appName: string;
  data: {
    projects: unknown[];
    milestones: unknown[];
    tasks: unknown[];
    progressLogs: unknown[];
    dailyPlans: unknown[];
    reminders: unknown[];
    susanConversations: unknown[];
    settings: unknown[];
    analyticsSnapshots: unknown[];
  };
}

/**
 * Export all data from the database to JSON
 */
export function createExportData(
  tables: ExportData['data']
): ExportData {
  return {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'KashFinance Project Tracker V3',
    data: tables,
  };
}

/**
 * Download data as a JSON file
 */
export function downloadJSON(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `kashfinance-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a JSON file from user input
 */
export function readJSONFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('File must be a .json file'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text) as ExportData;

        // Validate structure
        if (!data.version || !data.data || !data.appName) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        if (data.appName !== 'KashFinance Project Tracker V3') {
          reject(new Error('This backup file is not from KashFinance Project Tracker V3'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Export data as CSV (for a single table)
 */
export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const str = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ];

  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
