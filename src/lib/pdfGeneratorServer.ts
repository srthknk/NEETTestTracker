// Server-side PDF generation for email attachments
// This doesn't use 'use client' so it can be imported in API routes

import { jsPDF } from 'jspdf';

interface TestData {
  testName: string;
  coaching: string;
  date: string;
  totalMarksObtained?: number;
  overallPercentile?: number;
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
  const rowHeight = 10;
  const headerHeight = 12;
  const cellPadding = 3;

  let currentY = startY;

  // Draw headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setFillColor(25, 118, 210);
  doc.setTextColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);

  let xPos = margin;
  headers.forEach((header, index) => {
    // Draw header cell background
    doc.rect(xPos, currentY, columnWidths[index], headerHeight, 'F');
    // Draw header text
    doc.text(header, xPos + cellPadding, currentY + headerHeight - cellPadding);
    xPos += columnWidths[index];
  });

  currentY += headerHeight;

  // Draw rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setDrawColor(220, 220, 220);

  rows.forEach((row, rowIndex) => {
    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 248, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }

    xPos = margin;
    row.forEach((cell, colIndex) => {
      // Draw cell background
      doc.rect(xPos, currentY, columnWidths[colIndex], rowHeight, 'F');
      // Draw cell border
      doc.rect(xPos, currentY, columnWidths[colIndex], rowHeight);
      // Draw cell text
      doc.text(cell, xPos + cellPadding, currentY + rowHeight - cellPadding);
      xPos += columnWidths[colIndex];
    });

    currentY += rowHeight;
  });

  return currentY;
}

/**
 * Generate a test report PDF as a Buffer for email attachment
 * Returns the PDF as a Buffer instead of downloading it
 */
export function generateTestReportPDFBuffer(test: TestData, userName: string): Buffer {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // HEADER - Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(25, 118, 210);
  doc.text('TEST RESULT', margin, yPosition);
  yPosition += 10;

  // Subtitle and date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('Test Performance Report', margin, yPosition);
  yPosition += 1;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`,
    margin,
    yPosition
  );
  yPosition += 8;

  // Decorative line
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(1.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Student and Test Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Student: ${userName}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Test: ${test.testName}`, margin, yPosition);
  yPosition += 5;
  doc.text(
    `Date: ${new Date(test.date).toLocaleDateString('en-IN')} | Coaching Test Attempted: ${test.coaching}`,
    margin,
    yPosition
  );
  yPosition += 10;

  // OVERALL PERFORMANCE Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(25, 118, 210);
  doc.text('OVERALL PERFORMANCE', margin, yPosition);
  yPosition += 8;

  const performanceHeaders = ['Metric', 'Value'];
  const performanceData = [
    ['Total Score', `${test.totalMarksObtained ?? 0} / 720`],
    ['Overall Percentile', `${(test.overallPercentile ?? 0).toFixed(2)}%`],
    [
      'Estimated AIR',
      test.estimatedAIR && test.estimatedAIR !== 999999
        ? `#${test.estimatedAIR.toLocaleString('en-IN')}`
        : 'N/A',
    ],
  ];

  yPosition = drawTable(doc, yPosition, performanceHeaders, performanceData, [90, 50], margin);
  yPosition += 8;

  // SUBJECT-WISE BREAKDOWN Section
  if (test.subjectWiseMarks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(25, 118, 210);
    doc.text('SUBJECT-WISE BREAKDOWN', margin, yPosition);
    yPosition += 8;

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

    yPosition = drawTable(doc, yPosition, subjectHeaders, subjectData, [65, 45, 50], margin);
    yPosition += 10;
  }

  // Additional Info Section
  if (test.timeTaken) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(25, 118, 210);
    doc.text('TEST DURATION', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const hours = Math.floor(test.timeTaken / 60);
    const minutes = test.timeTaken % 60;
    doc.text(`Time Taken: ${hours}h ${minutes}m`, margin, yPosition);
    yPosition += 8;
  }

  // FOOTER
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );
  doc.text(
    'This is an automatically generated report from RankForge NEET Tracker',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Get PDF as buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
