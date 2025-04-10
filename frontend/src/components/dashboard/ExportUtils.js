import * as XLSX from 'xlsx';
import { calculatePerformance } from './PerformanceUtils';

export const exportToExcel = ({testData, testConfig}) => {
  if (!testData || Object.keys(testData).length === 0) return;

  const wb = XLSX.utils.book_new();

  Object.entries(testData).forEach(([testType, data]) => {
    if (!data || data.length === 0) return;

    const avgResponseTime = data.reduce((acc, curr) => acc + curr.responseTime, 0) / data.length;
    const lagThresholdMs = avgResponseTime * 2;

    const exportData = data.map(item => ({
      'Test Type': testType,
      'Timestamp': new Date(item.timestamp).toLocaleString(),
      'Response Time (ms)': item.responseTime.toFixed(2),
      'Actual Users': item.vus,
      'Status': item.status,
      'Error': item.error || '',
      'Is Lagging': item.responseTime > lagThresholdMs ? 'Yes' : 'No',
      'Performance Rating': calculatePerformance(item.responseTime).rating
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, testType.replace(' Test', ''));

    const lagData = data
      .filter(item => item.responseTime > lagThresholdMs)
      .map((item, idx) => ({
        'Timestamp': new Date(item.timestamp).toLocaleString(),
        'Response Time (ms)': item.responseTime.toFixed(2),
        'Virtual Users': testConfig.vus,
        'Actual User': item.actualUser || Math.floor(idx % testConfig.vus) + 1,
        'Iteration': idx + 1,
        'Lag Threshold (ms)': lagThresholdMs.toFixed(2)
      }));

    if (lagData.length > 0) {
      const lagWs = XLSX.utils.json_to_sheet(lagData);
      XLSX.utils.book_append_sheet(wb, lagWs, `${testType.replace(' Test', '')}_Lag`);
    }
  });

  XLSX.writeFile(wb, `performance_test_results_${new Date().toISOString().split('T')[0]}.xlsx`);
};