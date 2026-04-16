'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faSpinner,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { generateOverallReportPDF, generateTestReportPDF } from '@/lib/pdfGenerator';

interface Test {
  _id: string;
  testName: string;
  date: string;
  totalMarksObtained?: number;
  overallPercentile?: number;
  marksObtained?: number;
  totalMarks?: number;
  accuracy?: number;
  timeTaken: number;
  subjects: string[];
  coaching: string;
  estimatedAIR?: number;
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
  estimatedAIR?: number;
}

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);

      // Fetch user data
      try {
        const userRes = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.name || 'Student');
        }
      } catch (error) {
        console.log('Could not fetch user profile, using default name');
      }

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
        setTests(data.tests.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analytics) return;
    generateOverallReportPDF(analytics, tests, userName);
  };

  const downloadTestReport = (test: Test) => {
    generateTestReportPDF(test, userName);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Reports</h1>
          <p className="text-gray-600">
            Generate and download detailed reports
          </p>
        </div>
        <button
          onClick={downloadReport}
          disabled={!analytics || analytics.totalTestsAttempted === 0}
          className="btn-primary flex items-center gap-2 disabled:bg-gray-400"
        >
          <FontAwesomeIcon icon={faDownload} />
          Download Overall Report
        </button>
      </div>

      {/* Overall Summary Report */}
      {analytics && analytics.totalTestsAttempted > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-black mb-6">
            <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
            Overall Performance Report
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border-l-4 border-black pl-4">
              <p className="text-gray-600 text-sm mb-1">Total Tests</p>
              <p className="text-3xl font-bold text-black">
                {analytics.totalTestsAttempted}
              </p>
            </div>

            <div className="border-l-4 border-gray-400 pl-4">
              <p className="text-gray-600 text-sm mb-1">Average Score</p>
              <p className="text-3xl font-bold text-black">
                {analytics.averageScore.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">
                out of 720
              </p>
            </div>

            <div className="border-l-4 border-gray-600 pl-4">
              <p className="text-gray-600 text-sm mb-1">Overall Accuracy</p>
              <p className="text-3xl font-bold text-black">
                {analytics.overallAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              Subject-wise Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-sm border border-gray-200">
                <h4 className="font-semibold text-black mb-2">Physics</h4>
                <p className="text-2xl font-bold text-black mb-1">
                  {analytics.subjectWisePerformance.physics.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-sm border border-gray-200">
                <h4 className="font-semibold text-black mb-2">Chemistry</h4>
                <p className="text-2xl font-bold text-black mb-1">
                  {analytics.subjectWisePerformance.chemistry.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-sm border border-gray-200">
                <h4 className="font-semibold text-black mb-2">Botany</h4>
                <p className="text-2xl font-bold text-black mb-1">
                  {analytics.subjectWisePerformance.botany.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-sm border border-gray-200">
                <h4 className="font-semibold text-black mb-2">Zoology</h4>
                <p className="text-2xl font-bold text-black mb-1">
                  {analytics.subjectWisePerformance.zoology.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Test Reports */}
      {tests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-black">Individual Test Reports</h2>

          {tests.map((test) => (
            <div key={test._id} className="card hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {test.testName}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-medium text-black">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Score</p>
                      <p className="font-medium text-black">
                        {test.totalMarksObtained ?? test.marksObtained ?? 0}/720
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Percentile</p>
                      <p className="font-medium text-black">
                        {(test.overallPercentile ?? test.accuracy ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">AIR</p>
                      <p className="font-medium text-black">
                        {test.estimatedAIR && test.estimatedAIR !== 999999
                          ? test.estimatedAIR.toLocaleString('en-IN')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Coaching: {test.coaching || 'N/A'} | Time: {test.timeTaken} min
                  </p>
                </div>
                <button
                  onClick={() => downloadTestReport(test)}
                  className="btn-secondary flex items-center gap-2 whitespace-nowrap ml-4"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tests.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            No tests found. Add tests to generate reports!
          </p>
        </div>
      )}
    </div>
  );
}
