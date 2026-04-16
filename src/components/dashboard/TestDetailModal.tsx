'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface TestDetailModalProps {
  test: any;
  onClose: () => void;
}

const COACHING_LOGOS = {
  'Allen': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZMk7OdcURf10oHg_6-M6bOxiA9jWr-LPQng&s',
  'Aakash': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOrs-J0j9IPEMlkJOOvP3UBcI68oscYfoL4g&s',
  'PW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Physics_wallah_logo.jpg/250px-Physics_wallah_logo.jpg',
  'PW NRTS': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRph3nFIrnymQiMccTcANvRgUP3hm8bHYNRzQ&s',
  'NTA NEET': 'https://educatedtimes.com/wp-content/uploads/2024/06/DCP-1-1024x679.webp',
};

export default function TestDetailModal({ test, onClose }: TestDetailModalProps) {
  console.log('TestDetailModal received test:', test);
  console.log('subjectWiseMarks:', test.subjectWiseMarks);
  console.log('totalMarksObtained:', test.totalMarksObtained);
  
  const subjectWiseMarks = test.subjectWiseMarks || {
    physics: { obtained: 0, total: 180 },
    chemistry: { obtained: 0, total: 180 },
    botany: { obtained: 0, total: 180 },
    zoology: { obtained: 0, total: 180 },
  };

  const subjectWisePercentiles = test.subjectWisePercentiles || {
    physics: 0,
    chemistry: 0,
    botany: 0,
    zoology: 0,
  };

  const testDate = new Date(test.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-3 md:p-6 border-b border-gray-200 sticky top-0 bg-white gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-semibold text-black truncate">{test.testName}</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">{testDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors flex-shrink-0 p-1"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
          {/* Coaching Info */}
          <div className="flex items-center gap-2 md:gap-4 p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={COACHING_LOGOS[test.coaching as keyof typeof COACHING_LOGOS]}
                alt={test.coaching}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Coaching Provider</p>
              <p className="text-sm md:text-lg font-semibold text-black truncate">{test.coaching}</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-xs text-gray-600 mb-1">Total Score</p>
              <p className="text-xl md:text-3xl font-bold text-black">
                {test.totalMarksObtained || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">/ 720</p>
            </div>
            <div className="p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-xs text-gray-600 mb-1">Percentile</p>
              <p className="text-xl md:text-3xl font-bold text-black">
                {(test.overallPercentile || 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-600 mt-1">%</p>
            </div>
            <div className="p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-xs text-gray-600 mb-1">AIR</p>
              <p className="text-xl md:text-3xl font-bold text-black truncate">
                {test.estimatedAIR === 999999 || !test.estimatedAIR ? 'N/A' : test.estimatedAIR.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-600 mt-1">All India</p>
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div>
            <h3 className="font-semibold text-black mb-3 text-base">Subject-wise Performance</h3>
            <div className="space-y-2 md:space-y-3">
              {['physics', 'chemistry', 'botany', 'zoology'].map((subject) => (
                <div key={subject} className="p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="font-medium text-black capitalize text-sm md:text-base">{subject}</p>
                    <p className="font-semibold text-black text-xs md:text-sm flex-shrink-0">
                      {subjectWiseMarks[subject as keyof typeof subjectWiseMarks]?.obtained || 0} / 180
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex-1 h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black transition-all"
                        style={{
                          width: `${Math.min(subjectWisePercentiles[subject as keyof typeof subjectWisePercentiles] || 0, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 w-12 text-right flex-shrink-0">
                      {(subjectWisePercentiles[subject as keyof typeof subjectWisePercentiles] || 0).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Details */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-xs text-gray-600 mb-1">Test Type</p>
              <p className="font-medium text-black text-xs md:text-sm capitalize">
                {test.tags?.map((tag: string) =>
                  tag === 'full-syllabus' ? 'Full Syllabus' : tag === 'part-test' ? 'Part Test' : 'PYQ'
                ).join(', ') || 'N/A'}
              </p>
            </div>
            <div className="p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-xs text-gray-600 mb-1">Time Taken</p>
              <p className="font-medium text-black text-xs md:text-sm">{test.timeTaken ?? 0} min</p>
            </div>
          </div>

          {/* Chapter Names (if applicable) */}
          {test.chapters && (test.chapters.physics || test.chapters.chemistry || test.chapters.botany || test.chapters.zoology) && (
            <div>
              <h3 className="font-semibold text-black mb-3 text-base">Chapter-wise Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {test.chapters.physics && (
                  <div className="p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <p className="text-xs text-gray-600">Physics Chapter</p>
                    <p className="font-medium text-black text-xs md:text-sm mt-1 truncate">{test.chapters.physics}</p>
                  </div>
                )}
                {test.chapters.chemistry && (
                  <div className="p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <p className="text-xs text-gray-600">Chemistry Chapter</p>
                    <p className="font-medium text-black text-xs md:text-sm mt-1 truncate">{test.chapters.chemistry}</p>
                  </div>
                )}
                {test.chapters.botany && (
                  <div className="p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <p className="text-xs text-gray-600">Botany Chapter</p>
                    <p className="font-medium text-black text-xs md:text-sm mt-1 truncate">{test.chapters.botany}</p>
                  </div>
                )}
                {test.chapters.zoology && (
                  <div className="p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <p className="text-xs text-gray-600">Zoology Chapter</p>
                    <p className="font-medium text-black text-xs md:text-sm mt-1 truncate">{test.chapters.zoology}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-3 md:pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 md:px-6 py-2 md:py-3 bg-black text-white rounded-sm hover:bg-gray-800 active:scale-95 transition-all text-sm md:text-base font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
