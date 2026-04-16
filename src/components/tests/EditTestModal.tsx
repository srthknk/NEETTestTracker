'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface EditTestModalProps {
  test: any;
  onClose: () => void;
  onUpdateTest: (testId: string, testData: any) => void;
}

interface FormData {
  testName: string;
  coaching: string;
  date: string;
  subjectWiseMarks: {
    physics: { obtained: number; total: number };
    chemistry: { obtained: number; total: number };
    botany: { obtained: number; total: number };
    zoology: { obtained: number; total: number };
  };
  timeTaken: number;
  subjects: string[];
  chapters: {
    physics: string;
    chemistry: string;
    botany: string;
    zoology: string;
  };
  tags: string[];
}

const COACHING_LOGOS = {
  'Allen': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZMk7OdcURf10oHg_6-M6bOxiA9jWr-LPQng&s',
  'Aakash': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOrs-J0j9IPEMlkJOOvP3UBcI68oscYfoL4g&s',
  'PW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Physics_wallah_logo.jpg/250px-Physics_wallah_logo.jpg',
  'PW NRTS': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRph3nFIrnymQiMccTcANvRgUP3hm8bHYNRzQ&s',
  'NTA NEET': 'https://educatedtimes.com/wp-content/uploads/2024/06/DCP-1-1024x679.webp',
};

export default function EditTestModal({ test, onClose, onUpdateTest }: EditTestModalProps) {
  const [formData, setFormData] = useState<FormData>({
    testName: test.testName || '',
    coaching: test.coaching || 'Allen',
    date: test.date ? test.date.split('T')[0] : new Date().toISOString().split('T')[0],
    subjectWiseMarks: test.subjectWiseMarks || {
      physics: { obtained: 0, total: 180 },
      chemistry: { obtained: 0, total: 180 },
      botany: { obtained: 0, total: 180 },
      zoology: { obtained: 0, total: 180 },
    },
    timeTaken: test.timeTaken || 0,
    subjects: test.subjects || ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    chapters: test.chapters || {
      physics: '',
      chemistry: '',
      botany: '',
      zoology: '',
    },
    tags: test.tags || [],
  });

  const [loading, setLoading] = useState(false);

  const tagOptions = ['full-syllabus', 'part-test', 'PYQ'];
  const coachingOptions = Object.keys(COACHING_LOGOS) as Array<keyof typeof COACHING_LOGOS>;
  const subjectOptions = ['Physics', 'Chemistry', 'Botany', 'Zoology'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'timeTaken' ? Number(value) : value,
    }));
  };

  const handleSubjectMarksChange = (
    subject: 'physics' | 'chemistry' | 'botany' | 'zoology',
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      subjectWiseMarks: {
        ...prev.subjectWiseMarks,
        [subject]: {
          obtained: value,
          total: 180,
        },
      },
    }));
  };

  const handleChapterChange = (subject: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [subject.toLowerCase()]: value,
      },
    }));
  };

  const handleCoachingChange = (coaching: string) => {
    setFormData((prev) => ({
      ...prev,
      coaching,
    }));
  };

  const handleTagChange = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const shouldShowChapterInputs = formData.tags.includes('part-test') || formData.tags.includes('PYQ');

  // Calculate totals and percentiles
  const calculateStats = () => {
    const totalObtained =
      formData.subjectWiseMarks.physics.obtained +
      formData.subjectWiseMarks.chemistry.obtained +
      formData.subjectWiseMarks.botany.obtained +
      formData.subjectWiseMarks.zoology.obtained;

    const overallPercent = (totalObtained / 720) * 100;

    const subjectPercentiles = {
      physics: (formData.subjectWiseMarks.physics.obtained / 180) * 100,
      chemistry: (formData.subjectWiseMarks.chemistry.obtained / 180) * 100,
      botany: (formData.subjectWiseMarks.botany.obtained / 180) * 100,
      zoology: (formData.subjectWiseMarks.zoology.obtained / 180) * 100,
    };

    return { totalObtained, overallPercent, subjectPercentiles };
  };

  const stats = calculateStats();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateTest(test._id, formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-semibold text-black">Edit Test</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Test Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Test Name *
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleChange}
                placeholder="e.g., Allen PT-1"
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Test Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-base"
                required
              />
            </div>
          </div>

          {/* Coaching Selection */}
          <div>
            <label className="block text-sm font-semibold text-black mb-4">
              Coaching Provider
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {coachingOptions.map((coaching) => (
                <button
                  key={coaching}
                  type="button"
                  onClick={() => handleCoachingChange(coaching)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-sm border-2 transition-all ${
                    formData.coaching === coaching
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={COACHING_LOGOS[coaching]}
                      alt={coaching}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <span className="text-xs font-medium text-center text-black">{coaching}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject-wise Marks - NEET Pattern */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
            <h3 className="font-semibold text-black mb-4">Subject-wise Marks (NEET Pattern - Each out of 180)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {(['physics', 'chemistry', 'botany', 'zoology'] as const).map((subject) => (
                <div key={subject}>
                  <label className="block text-sm font-medium text-black mb-2 capitalize">
                    {subject} *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.subjectWiseMarks[subject].obtained}
                      onChange={(e) =>
                        handleSubjectMarksChange(subject, Number(e.target.value) || 0)
                      }
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-base"
                      min="0"
                      max="180"
                      required
                    />
                    <span className="text-gray-600 font-medium text-lg">/ 180</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.subjectPercentiles[subject].toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white border border-gray-200 rounded-sm">
              <div>
                <p className="text-xs text-gray-600">Total Marks</p>
                <p className="text-3xl font-bold text-black">{stats.totalObtained}</p>
                <p className="text-xs text-gray-600">/720</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Overall Percentile</p>
                <p className="text-3xl font-bold text-black">{stats.overallPercent.toFixed(1)}</p>
                <p className="text-xs text-gray-600">%</p>
              </div>
            </div>
          </div>

          {/* Time Taken */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Time Taken (minutes)
              </label>
              <input
                type="number"
                name="timeTaken"
                value={formData.timeTaken}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-base"
                min="0"
              />
            </div>
          </div>

          {/* Test Type */}
          <div>
            <label className="block text-sm font-semibold text-black mb-4">Test Type</label>
            <div className="flex flex-wrap gap-4">
              {tagOptions.map((tag) => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-black capitalize">
                    {tag === 'full-syllabus' ? 'Full Syllabus' : tag === 'part-test' ? 'Part Test' : 'PYQ'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Chapter Names */}
          {shouldShowChapterInputs && (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
              <h3 className="font-semibold text-black mb-4">Chapter Names (if applicable)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectOptions.map((subject) => (
                  <div key={subject}>
                    <label className="block text-sm font-medium text-black mb-2">
                      {subject} Chapter
                    </label>
                    <input
                      type="text"
                      value={formData.chapters[subject.toLowerCase() as keyof typeof formData.chapters]}
                      onChange={(e) => handleChapterChange(subject, e.target.value)}
                      placeholder={`e.g., Mechanics, Mole Concept`}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-base"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-black rounded-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
