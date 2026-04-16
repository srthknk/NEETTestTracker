'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faPencil,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import AddTestModal from '@/components/tests/AddTestModal';
import EditTestModal from '@/components/tests/EditTestModal';

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
  timeTaken: number;
  subjects: string[];
  tags: string[];
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
  chapters?: {
    physics?: string;
    chemistry?: string;
    botany?: string;
    zoology?: string;
  };
}

const COACHING_LOGOS = {
  'Allen': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZMk7OdcURf10oHg_6-M6bOxiA9jWr-LPQng&s',
  'Aakash': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOrs-J0j9IPEMlkJOOvP3UBcI68oscYfoL4g&s',
  'PW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Physics_wallah_logo.jpg/250px-Physics_wallah_logo.jpg',
  'PW NRTS': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRph3nFIrnymQiMccTcANvRgUP3hm8bHYNRzQ&s',
  'NTA NEET': 'https://educatedtimes.com/wp-content/uploads/2024/06/DCP-1-1024x679.webp',
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTests(page);
  }, [page]);

  const fetchTests = async (pageNum: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/tests?page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setTests(data.tests);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchTests(page);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleAddTest = async (testData: any) => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'exists' : 'missing');
    console.log('handleAddTest received testData:', JSON.stringify(testData, null, 2));
    
    if (!token) {
      alert('No authentication token found. Please log in again.');
      return;
    }

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await res.json();
      console.log('API response:', JSON.stringify(data, null, 2));

      if (res.ok) {
        console.log('Test created successfully:', data.test);
        setShowAddModal(false);
        fetchTests(1);
        setPage(1);
      } else {
        alert(`Error: ${data.message || 'Failed to add test'}`);
        console.error('Add test error:', data);
      }
    } catch (error) {
      console.error('Error adding test:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleUpdateTest = async (testId: string, testData: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (res.ok) {
        setEditingTest(null);
        fetchTests(page);
      }
    } catch (error) {
      console.error('Error updating test:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Tests</h1>
          <p className="text-gray-600">Manage your NEET practice tests</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Test
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-2xl text-gray-400 animate-spin"
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && tests.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No tests found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Your First Test
          </button>
        </div>
      )}

      {/* Tests Table */}
      {!loading && tests.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-black">
                  Coaching
                </th>
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
                <th className="text-center py-3 px-4 font-semibold text-black">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr
                  key={test._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={COACHING_LOGOS[test.coaching as keyof typeof COACHING_LOGOS]}
                        alt={test.coaching}
                        className="w-full h-full object-contain p-1"
                        title={test.coaching}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black font-medium">
                    {test.testName}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(test.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-black font-semibold">
                    {(test.totalMarksObtained ?? test.marksObtained ?? 0)}/{test.totalMarks ?? 720}
                  </td>
                  <td className="py-3 px-4 text-black">
                    {(test.overallPercentile ?? test.accuracy ?? 0).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {test.timeTaken} min
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setEditingTest(test)}
                      className="text-gray-600 hover:text-black mr-3 transition-colors"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test._id)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddTestModal
          onClose={() => setShowAddModal(false)}
          onAddTest={handleAddTest}
        />
      )}
      {editingTest && (
        <EditTestModal
          test={editingTest}
          onClose={() => setEditingTest(null)}
          onUpdateTest={handleUpdateTest}
        />
      )}
    </div>
  );
}
