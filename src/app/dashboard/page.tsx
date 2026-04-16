'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faTrophy,
  faCrosshairs,
  faFire,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import TestDetailModal from '@/components/dashboard/TestDetailModal';

interface AnalyticsSummary {
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
  estimatedAIR: number;
}

interface Test {
  _id: string;
  testName: string;
  coaching: string;
  date: string;
  totalMarksObtained?: number;
  overallPercentile?: number;
  marksObtained?: number;
  totalMarks?: number;
  accuracy?: number;
  subjectWiseMarks?: {
    physics: { obtained: number; total: number };
    chemistry: { obtained: number; total: number };
    botany: { obtained: number; total: number };
    zoology: { obtained: number; total: number };
  };
  subjectWisePercentiles?: {
    physics: number;
    chemistry: number;
    botany: number;
    zoology: number;
  };
  estimatedAIR?: number;
  tags?: string[];
  chapters?: {
    physics?: string;
    chemistry?: string;
    botany?: string;
    zoology?: string;
  };
  timeTaken?: number;
}

const COLORS = ['#000000', '#666666', '#cccccc'];

const COACHING_LOGOS = {
  'Allen': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZMk7OdcURf10oHg_6-M6bOxiA9jWr-LPQng&s',
  'Aakash': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOrs-J0j9IPEMlkJOOvP3UBcI68oscYfoL4g&s',
  'PW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Physics_wallah_logo.jpg/250px-Physics_wallah_logo.jpg',
  'PW NRTS': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRph3nFIrnymQiMccTcANvRgUP3hm8bHYNRzQ&s',
  'NTA NEET': 'https://educatedtimes.com/wp-content/uploads/2024/06/DCP-1-1024x679.webp',
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string | null) => {
    if (!token) return;

    try {
      const res = await fetch('/api/analytics/summary', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }

      const testsRes = await fetch('/api/tests?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (testsRes.ok) {
        const testsData = await testsRes.json();
        const testsList = testsData.tests || testsData;
        console.log('Tests fetched from dashboard:', testsList);
        setTests(testsList);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const realityCheckGap =
    (user?.targetMarks || 650) - (analytics?.averageScore || 0);

  const subjectData = analytics
    ? [
        { name: 'Physics', value: analytics.subjectWisePerformance.physics },
        {
          name: 'Chemistry',
          value: analytics.subjectWisePerformance.chemistry,
        },
        { name: 'Botany', value: analytics.subjectWisePerformance.botany },
        { name: 'Zoology', value: analytics.subjectWisePerformance.zoology },
      ]
    : [];

  // Calculate NEET subject-wise performance (Physics, Chemistry, Botany, Zoology)
  const calculateSubjectPerformance = () => {
    if (tests.length === 0) {
      return [];
    }

    const subjects = {
      physics: { total: 0, count: 0 },
      chemistry: { total: 0, count: 0 },
      botany: { total: 0, count: 0 },
      zoology: { total: 0, count: 0 },
    };

    tests.forEach((test) => {
      if (test.subjectWisePercentiles) {
        subjects.physics.total += test.subjectWisePercentiles.physics || 0;
        subjects.chemistry.total += test.subjectWisePercentiles.chemistry || 0;
        subjects.botany.total += test.subjectWisePercentiles.botany || 0;
        subjects.zoology.total += test.subjectWisePercentiles.zoology || 0;
        subjects.physics.count++;
        subjects.chemistry.count++;
        subjects.botany.count++;
        subjects.zoology.count++;
      }
    });

    return [
      {
        name: 'Physics',
        percentile: subjects.physics.count > 0 ? (subjects.physics.total / subjects.physics.count) : 0,
        marks: tests.reduce((sum, t) => sum + (t.subjectWiseMarks?.physics?.obtained || 0), 0) / Math.max(tests.length, 1),
      },
      {
        name: 'Chemistry',
        percentile: subjects.chemistry.count > 0 ? (subjects.chemistry.total / subjects.chemistry.count) : 0,
        marks: tests.reduce((sum, t) => sum + (t.subjectWiseMarks?.chemistry?.obtained || 0), 0) / Math.max(tests.length, 1),
      },
      {
        name: 'Botany',
        percentile: subjects.botany.count > 0 ? (subjects.botany.total / subjects.botany.count) : 0,
        marks: tests.reduce((sum, t) => sum + (t.subjectWiseMarks?.botany?.obtained || 0), 0) / Math.max(tests.length, 1),
      },
      {
        name: 'Zoology',
        percentile: subjects.zoology.count > 0 ? (subjects.zoology.total / subjects.zoology.count) : 0,
        marks: tests.reduce((sum, t) => sum + (t.subjectWiseMarks?.zoology?.obtained || 0), 0) / Math.max(tests.length, 1),
      },
    ];
  };

  const neetSubjectData = calculateSubjectPerformance();

  return (
    <div className="space-y-10 md:space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
          Welcome back, {user?.name || 'Student'}
        </h1>
        <p className="text-lg text-gray-600">
          Here's your NEET preparation progress at a glance
        </p>
      </div>

      {/* Reality Check Panel */}
      {analytics && (
        <div className="card bg-white">
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg font-semibold text-black">Reality Check</h2>
            <p className="text-sm text-gray-600 mt-1">Your progress vs. target marks</p>
          </div>

          <div className="grid grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">Target Marks</p>
              <p className="text-3xl md:text-4xl font-bold text-black">
                {user?.targetMarks || 650}
              </p>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <p className="text-sm text-gray-600 mb-3 font-medium">Current Avg</p>
              <p className="text-3xl md:text-4xl font-bold text-black">
                {analytics.averageScore.toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">Gap</p>
              <p
                className={`text-3xl md:text-4xl font-bold ${
                  realityCheckGap > 0 ? 'text-red-600' : 'text-black'
                }`}
              >
                {realityCheckGap > 0 ? '-' : '+'}
                {Math.abs(realityCheckGap).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Tests */}
        <div className="card">
          <p className="text-sm text-gray-600 font-medium mb-3">Total Tests</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl md:text-4xl font-bold text-black">
              {analytics?.totalTestsAttempted || 0}
            </p>
            <FontAwesomeIcon
              icon={faFire}
              className="text-2xl text-gray-400"
            />
          </div>
        </div>

        {/* Average Score */}
        <div className="card">
          <p className="text-sm text-gray-600 font-medium mb-3">Average Score</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl md:text-4xl font-bold text-black">
              {analytics?.averageScore.toFixed(0) || 0}
            </p>
            <FontAwesomeIcon
              icon={faChartLine}
              className="text-2xl text-gray-400"
            />
          </div>
        </div>

        {/* Highest Score */}
        <div className="card">
          <p className="text-sm text-gray-600 font-medium mb-3">Highest Score</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl md:text-4xl font-bold text-black">
              {analytics?.highestScore || 0}
            </p>
            <FontAwesomeIcon
              icon={faTrophy}
              className="text-2xl text-gray-400"
            />
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="card">
          <p className="text-sm text-gray-600 font-medium mb-3">Accuracy</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl md:text-4xl font-bold text-black">
              {analytics?.overallAccuracy.toFixed(1) || 0}%
            </p>
            <FontAwesomeIcon
              icon={faCrosshairs}
              className="text-2xl text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Subject Performance */}
        {subjectData.length > 0 && subjectData.some((d: any) => d.value > 0) && (
          <div className="card">
            <h3 className="text-lg font-semibold text-black mb-6">
              Subject Performance
            </h3>
            <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#000"
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Best AIR */}
        <div className="card">
          <h3 className="text-lg font-semibold text-black mb-6">
            Best Estimated AIR
          </h3>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-5xl md:text-6xl font-bold text-black mb-3">
              {analytics?.estimatedAIR === 999999 || !analytics?.estimatedAIR
                ? 'N/A'
                : analytics?.estimatedAIR.toLocaleString('en-IN')}
            </p>
            <p className="text-gray-600 text-center mb-6">
              Your best estimated All India Rank
            </p>
            {analytics && analytics.estimatedAIR !== 999999 && analytics.estimatedAIR && (
              <div className="mt-6 space-y-2 text-sm text-gray-600 text-center border-t border-gray-200 pt-6">
                <p>
                  Best Score: <span className="font-semibold text-black">{analytics.highestScore} / 720</span>
                </p>
                <p>
                  Total Tests: <span className="font-semibold text-black">{analytics.totalTestsAttempted}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Benchmarks */}
      {tests.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8">
          <h3 className="text-lg font-semibold text-black mb-6">Performance Benchmarks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <p className="text-sm text-gray-600 font-medium mb-3">Perfect Score AIR</p>
              <p className="text-3xl font-bold text-black mb-2">1</p>
              <p className="text-xs text-gray-600">720 / 720 (100%)</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <p className="text-sm text-gray-600 font-medium mb-3">Your Best Score</p>
              <p className="text-3xl font-bold text-black mb-2">
                {analytics?.estimatedAIR === 999999 || !analytics?.estimatedAIR
                  ? 'N/A'
                  : analytics?.estimatedAIR.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-600">{analytics?.highestScore || 0} / 720</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <p className="text-sm text-gray-600 font-medium mb-3">Average Performance</p>
              <p className="text-3xl font-bold text-black mb-2">{analytics?.averageScore.toFixed(0) || 0}</p>
              <p className="text-xs text-gray-600">Across {analytics?.totalTestsAttempted || 0} tests</p>
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Performance Bar Chart */}
      {neetSubjectData.length > 0 && tests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-black mb-6">
            Subject-wise Performance (NEET)
          </h3>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <BarChart data={neetSubjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Percentile (%)', angle: -90, position: 'insideLeft', offset: -5 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: 'Avg Marks / 180', angle: 90, position: 'insideRight', offset: -5 }}
              />
              <Tooltip 
                formatter={(value: any) => {
                  if (typeof value === 'number') return value.toFixed(1);
                  return value;
                }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', fontSize: '12px', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="percentile" fill="#000000" name="Percentile (%)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="marks" fill="#9ca3af" name="Avg Marks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Subject Details Grid */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {neetSubjectData.map((subject) => (
              <div key={subject.name} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-black mb-3">{subject.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Percentile</span>
                    <span className="text-sm font-bold text-black">{subject.percentile.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Avg Marks</span>
                    <span className="text-sm font-bold text-black">{subject.marks.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempted Tests */}
      {tests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-black mb-6">
            Recent Tests
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.slice(0, 6).map((test) => (
              <div
                key={test._id}
                onClick={() => setSelectedTest(test)}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={COACHING_LOGOS[test.coaching as keyof typeof COACHING_LOGOS]}
                        alt={test.coaching}
                        className="w-full h-full object-contain p-0.5"
                        title={test.coaching}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black text-sm truncate">{test.testName}</p>
                      <p className="text-xs text-gray-600 truncate">{test.coaching}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-black">
                      {test.totalMarksObtained ?? test.marksObtained ?? 0}/720
                    </span>
                    <span className="text-sm font-bold text-black">
                      {(test.overallPercentile ?? test.accuracy ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600">
                  {new Date(test.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>

                {test.tags && test.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {test.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Detail Modal */}
      {selectedTest && (
        <TestDetailModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
}
