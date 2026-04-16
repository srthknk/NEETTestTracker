'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faPercent,
  faBullseye,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';

interface Test {
  _id: string;
  testName: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number;
}

interface Analytics {
  totalTestsAttempted: number;
  averageScore: number;
  highestScore: number;
  overallAccuracy: number;
  subjectWisePerformance: {
    physics: number;
    chemistry: number;
    botany: number;
    zoology: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);

      const [analyticsRes, testsRes] = await Promise.all([
        fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/tests?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(data.tests.reverse()); // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-2xl text-gray-400 animate-spin"
        />
      </div>
    );
  }

  // Prepare chart data
  const trendData = tests.map((test, idx) => ({
    name: `Test ${idx + 1}`,
    marks: test.marksObtained,
    accuracy: test.accuracy,
    time: test.timeTaken,
  }));

  const efficiencyData = tests.map((test, idx) => ({
    name: `Test ${idx + 1}`,
    efficiency: parseFloat((test.marksObtained / test.timeTaken).toFixed(2)),
    accuracy: test.accuracy,
  }));

  const subjectData = analytics
    ? [
        { name: 'Physics', accuracy: analytics.subjectWisePerformance.physics },
        {
          name: 'Chemistry',
          accuracy: analytics.subjectWisePerformance.chemistry,
        },
        { name: 'Botany', accuracy: analytics.subjectWisePerformance.botany },
        { name: 'Zoology', accuracy: analytics.subjectWisePerformance.zoology },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Analytics</h1>
        <p className="text-gray-600">
          Deep dive into your performance metrics and trends
        </p>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Tests</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.totalTestsAttempted}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-2xl text-gray-400"
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average Accuracy</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.overallAccuracy.toFixed(1)}%
                </p>
              </div>
              <FontAwesomeIcon
                icon={faPercent}
                className="text-2xl text-gray-400"
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average Score</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.averageScore.toFixed(0)}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faBullseye}
                className="text-2xl text-gray-400"
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Best Score</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.highestScore}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-2xl text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {trendData.length > 0 && (
        <>
          {/* Score Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-black mb-4">
              Score Trend Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="marks" fill="#000000" name="Marks" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#666666"
                  name="Accuracy (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency Analysis */}
          <div className="card">
            <h3 className="text-lg font-semibold text-black mb-4">
              Efficiency (Marks/Minute) vs Accuracy
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  type="number"
                  dataKey="efficiency"
                  name="Efficiency (Marks/min)"
                />
                <YAxis type="number" dataKey="accuracy" name="Accuracy (%)" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Tests"
                  data={efficiencyData}
                  fill="#000000"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Performance */}
          {subjectData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-black mb-4">
                Subject-Wise Average Accuracy
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="accuracy" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Statistics Table */}
      {tests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-black mb-4">
            All Tests Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Test Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Marks
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Accuracy
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, idx) => (
                  <tr
                    key={test._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-black font-medium">
                      {test.testName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(test.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-black font-semibold">
                      {test.marksObtained}/{test.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-black">
                      {test.accuracy.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {test.timeTaken} min
                    </td>
                    <td className="py-3 px-4 text-black font-semibold">
                      {(test.marksObtained / test.timeTaken).toFixed(2)} M/min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tests.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">No tests found. Add tests to see analytics!</p>
        </div>
      )}
    </div>
  );
}
