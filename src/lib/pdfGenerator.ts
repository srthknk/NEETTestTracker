'use client';

import { jsPDF } from 'jspdf';

interface AnalyticsData {
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

interface TestData {
  testName: string;
  coaching: string;
  date: string;
  totalMarksObtained: number;
  overallPercentile: number;
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
  timeTaken?: number;
}

// Helper function to draw a professional table
function drawTable(
  doc: jsPDF,
  startY: number,
  headers: string[],
  rows: string[][],
  columnWidths: number[],
  margin: number
): number {
  const rowHeight = 8;
  const headerHeight = 9;
  let yPos = startY;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw header
  doc.setFillColor(40, 40, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  let xPos = margin;
  for (let i = 0; i < headers.length; i++) {
    doc.rect(xPos, yPos, columnWidths[i], headerHeight, 'F');
    doc.text(headers[i], xPos + columnWidths[i] / 2, yPos + 6, {
      align: 'center',
      maxWidth: columnWidths[i] - 2,
    });
    xPos += columnWidths[i];
  }

  yPos += headerHeight;

  // Draw separator line
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  xPos = margin;
  for (let i = 0; i < headers.length; i++) {
    xPos += columnWidths[i];
  }
  doc.line(margin, yPos, xPos, yPos);
  yPos += 1;

  // Draw rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (yPos + rowHeight > pageHeight - 15) {
      doc.addPage();
      yPos = margin;
    }

    // Alternate row colors - very subtle
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      xPos = margin;
      for (let i = 0; i < headers.length; i++) {
        doc.rect(xPos, yPos, columnWidths[i], rowHeight, 'F');
        xPos += columnWidths[i];
      }
    }

    // Draw cell borders
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    xPos = margin;
    for (let i = 0; i < headers.length; i++) {
      doc.rect(xPos, yPos, columnWidths[i], rowHeight);
      xPos += columnWidths[i];
    }

    // Draw text
    doc.setTextColor(50, 50, 50);
    xPos = margin;
    for (let i = 0; i < row.length; i++) {
      const cellText = row[i];
      const align = i === 0 ? 'left' : 'center';
      const xOffset = i === 0 ? 3 : columnWidths[i] / 2;
      doc.text(cellText, xPos + xOffset, yPos + 5.5, {
        align: align as any,
        maxWidth: columnWidths[i] - 4,
      });
      xPos += columnWidths[i];
    }

    yPos += rowHeight;
  });

  return yPos + 5;
}

export function generateOverallReportPDF(
  analytics: AnalyticsData,
  tests: TestData[],
  userName: string
): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let yPosition = margin;

  // HEADER SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(25, 118, 210);
  doc.text('TEST RESULT', margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('Overall Performance Report', margin, yPosition);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin - 45, yPosition);
  yPosition += 8;

  // Decorative line
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  // Student info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Student: ${userName}`, margin, yPosition);
  yPosition += 10;

  // KEY METRICS SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(25, 118, 210);
  doc.text('KEY METRICS', margin, yPosition);
  yPosition += 7;

  const metricsHeaders = ['Metric', 'Value'];
  const metricsData = [
    ['Total Tests Attempted', analytics.totalTestsAttempted.toString()],
    ['Average Score', `${analytics.averageScore.toFixed(0)}/720`],
    ['Highest Score', `${analytics.highestScore}/720`],
    ['Overall Accuracy', `${analytics.overallAccuracy.toFixed(2)}%`],
  ];

  yPosition = drawTable(doc, yPosition, metricsHeaders, metricsData, [95, 40], margin);
  yPosition += 4;

  // ESTIMATED AIR SECTION
  if (analytics.estimatedAIR && analytics.estimatedAIR !== 999999) {
    doc.setFillColor(25, 118, 210);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Estimated All India Rank (AIR)', margin + 5, yPosition + 6);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${analytics.estimatedAIR.toLocaleString('en-IN')}`, pageWidth - margin - 15, yPosition + 12, { align: 'right' });

    yPosition += 23;
  }

  // SUBJECT-WISE PERFORMANCE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(25, 118, 210);
  doc.text('SUBJECT-WISE PERFORMANCE', margin, yPosition);
  yPosition += 7;

  const subjectHeaders = ['Subject', 'Percentile'];
  const subjectData = [
    ['Physics', `${analytics.subjectWisePerformance.physics.toFixed(1)}%`],
    ['Chemistry', `${analytics.subjectWisePerformance.chemistry.toFixed(1)}%`],
    ['Botany', `${analytics.subjectWisePerformance.botany.toFixed(1)}%`],
    ['Zoology', `${analytics.subjectWisePerformance.zoology.toFixed(1)}%`],
  ];

  yPosition = drawTable(doc, yPosition, subjectHeaders, subjectData, [95, 40], margin);
  yPosition += 6;

  // RECENT TESTS
  if (tests.length > 0) {
    if (yPosition > pageHeight - 55) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(25, 118, 210);
    doc.text('RECENT TEST ATTEMPTS', margin, yPosition);
    yPosition += 7;

    const testHeaders = ['Test', 'Date', 'Score', 'Percentile', 'AIR'];
    const testData = tests.slice(0, 10).map((test) => [
      test.testName.substring(0, 14),
      new Date(test.date).toLocaleDateString('en-IN'),
      `${test.totalMarksObtained}`,
      `${test.overallPercentile.toFixed(1)}%`,
      test.estimatedAIR && test.estimatedAIR !== 999999
        ? `#${(test.estimatedAIR / 1000).toFixed(0)}K`
        : '-',
    ]);

    yPosition = drawTable(doc, yPosition, testHeaders, testData, [28, 22, 18, 22, 22], margin);
  }

  // FOOTER
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const footerText = '📊 Keep practicing consistently to improve your scores!';
  doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Save PDF
  doc.save(`NEET_Overall_Report_${new Date().getTime()}.pdf`);
}

export function generateTestReportPDF(test: TestData, userName: string): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let yPosition = margin;

  // HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(25, 118, 210);
  doc.text('TEST RESULT', margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('Test Performance Report', margin, yPosition);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin - 45, yPosition);
  yPosition += 8;

  // Decorative line
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Test metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Student: ${userName}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Test: ${test.testName}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Date: ${new Date(test.date).toLocaleDateString('en-IN')}  |  Coaching: ${test.coaching}`, margin, yPosition);
  yPosition += 10;

  // OVERALL PERFORMANCE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(25, 118, 210);
  doc.text('OVERALL PERFORMANCE', margin, yPosition);
  yPosition += 7;

  const performanceHeaders = ['Metric', 'Value'];
  const performanceData = [
    ['Total Score', `${test.totalMarksObtained} / 720`],
    ['Overall Percentile', `${test.overallPercentile.toFixed(2)}%`],
    [
      'Estimated AIR',
      test.estimatedAIR && test.estimatedAIR !== 999999
        ? `#${test.estimatedAIR.toLocaleString('en-IN')}`
        : 'N/A',
    ],
  ];

  yPosition = drawTable(doc, yPosition, performanceHeaders, performanceData, [95, 40], margin);
  yPosition += 6;

  // SUBJECT-WISE BREAKDOWN
  if (test.subjectWiseMarks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(25, 118, 210);
    doc.text('SUBJECT-WISE BREAKDOWN', margin, yPosition);
    yPosition += 7;

    const subjectHeaders = ['Subject', 'Marks', 'Percentile'];
    const subjectData = [
      [
        'Physics',
        `${test.subjectWiseMarks.physics.obtained}/180`,
        test.subjectWisePercentiles ? `${test.subjectWisePercentiles.physics.toFixed(1)}%` : '-',
      ],
      [
        'Chemistry',
        `${test.subjectWiseMarks.chemistry.obtained}/180`,
        test.subjectWisePercentiles ? `${test.subjectWisePercentiles.chemistry.toFixed(1)}%` : '-',
      ],
      [
        'Botany',
        `${test.subjectWiseMarks.botany.obtained}/180`,
        test.subjectWisePercentiles ? `${test.subjectWisePercentiles.botany.toFixed(1)}%` : '-',
      ],
      [
        'Zoology',
        `${test.subjectWiseMarks.zoology.obtained}/180`,
        test.subjectWisePercentiles ? `${test.subjectWisePercentiles.zoology.toFixed(1)}%` : '-',
      ],
    ];

    yPosition = drawTable(doc, yPosition, subjectHeaders, subjectData, [70, 35, 40], margin);
    yPosition += 6;
  }

  // TIME MANAGEMENT
  if (test.timeTaken) {
    if (yPosition > pageHeight - 45) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(25, 118, 210);
    doc.text('TIME MANAGEMENT', margin, yPosition);
    yPosition += 7;

    const timeHeaders = ['Metric', 'Value'];
    const timeData = [
      ['Total Time', `${test.timeTaken} min`],
      ['Avg per Question', `${((test.timeTaken * 60) / 200).toFixed(1)} sec`],
      ['Efficiency', `${(test.totalMarksObtained / test.timeTaken).toFixed(2)} marks/min`],
    ];

    yPosition = drawTable(doc, yPosition, timeHeaders, timeData, [95, 40], margin);
  }

  // FOOTER
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const footerText = '💪 Keep working hard to achieve your NEET goals!';
  doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Save PDF
  doc.save(`NEET_${test.testName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
}
