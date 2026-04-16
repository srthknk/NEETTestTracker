import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Test from '@/models/Test';
import AnalyticsSummary from '@/models/AnalyticsSummary';
import { verifyToken } from '@/lib/auth';
import { calculateAIR } from '@/lib/airCalculator';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const tests = await Test.find({ userId: decoded.userId })
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Test.countDocuments({ userId: decoded.userId });

    console.log('GET /api/tests returning tests:', tests.length, 'tests');
    if (tests.length > 0) {
      console.log('First test data:', JSON.stringify(tests[0].toObject ? tests[0].toObject() : tests[0], null, 2));
    }

    return NextResponse.json(
      {
        tests,
        total,
        pages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Tests fetch error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    console.log('POST /api/tests body received:', JSON.stringify(body, null, 2));

    // Calculate total marks from subject-wise marks
    const totalMarksObtained =
      body.subjectWiseMarks.physics.obtained +
      body.subjectWiseMarks.chemistry.obtained +
      body.subjectWiseMarks.botany.obtained +
      body.subjectWiseMarks.zoology.obtained;

    console.log('Calculated totalMarksObtained:', totalMarksObtained);

    // Calculate subject-wise percentiles
    const subjectWisePercentiles = {
      physics: (body.subjectWiseMarks.physics.obtained / 180) * 100,
      chemistry: (body.subjectWiseMarks.chemistry.obtained / 180) * 100,
      botany: (body.subjectWiseMarks.botany.obtained / 180) * 100,
      zoology: (body.subjectWiseMarks.zoology.obtained / 180) * 100,
    };

    // Calculate overall percentile
    const overallPercentile = (totalMarksObtained / 720) * 100;

    // Calculate estimated AIR from marks (now uses accurate NEET score mapping)
    const testYear = new Date(body.date).getFullYear();
    const estimatedAIR = calculateAIR(totalMarksObtained, testYear);

    console.log('Creating test with:', {
      subjectWiseMarks: body.subjectWiseMarks,
      totalMarksObtained,
      subjectWisePercentiles,
      overallPercentile,
      estimatedAIR,
    });

    const test = new Test({
      userId: decoded.userId,
      testName: body.testName,
      coaching: body.coaching,
      date: body.date,
      timeTaken: body.timeTaken,
      subjects: body.subjects,
      chapters: body.chapters,
      tags: body.tags,
      subjectWiseMarks: body.subjectWiseMarks,
      totalMarksObtained,
      totalMarksPossible: 720,
      subjectWisePercentiles,
      overallPercentile,
      estimatedAIR,
      // Deprecated fields for backward compatibility
      marksObtained: totalMarksObtained,
      accuracy: overallPercentile,
      totalMarks: 720,
    });

    console.log('Test object before save:', JSON.stringify(test.toObject ? test.toObject() : test, null, 2));

    await test.save();

    console.log('Test saved successfully with subjectWiseMarks:', test.subjectWiseMarks);
    console.log('Full saved test:', JSON.stringify(test.toObject(), null, 2));
    
    // Verify by querying immediately after save
    const verifyTest = await Test.findById(test._id);
    console.log('Verification - Test retrieved immediately after save:', JSON.stringify(verifyTest?.toObject(), null, 2));

    // Update analytics
    const tests = await Test.find({ userId: decoded.userId });
    const totalTests = tests.length;
    const averageScore =
      tests.reduce((sum: number, t: any) => sum + (t.totalMarksObtained || t.marksObtained || 0), 0) /
      totalTests;
    const highestScore = Math.max(...tests.map((t: any) => t.totalMarksObtained || t.marksObtained || 0));
    const overallAccuracy =
      tests.reduce((sum: number, t: any) => sum + (t.overallPercentile || ((t.marksObtained || 0) / (t.totalMarks || 720)) * 100), 0) / totalTests;
    
    // Calculate best AIR (lowest value is better)
    const estimatedAIRs = tests.map((t: any) => t.estimatedAIR || 999999).filter((air: number) => air !== 999999);
    const bestAIR = estimatedAIRs.length > 0 ? Math.min(...estimatedAIRs) : 999999;

    // Calculate subject-wise performance (average percentile for each subject)
    const subjectWisePerformance = {
      physics: 0,
      chemistry: 0,
      botany: 0,
      zoology: 0,
    };

    let testsWithSubjectData = 0;
    tests.forEach((t: any) => {
      if (t.subjectWisePercentiles) {
        subjectWisePerformance.physics += t.subjectWisePercentiles.physics || 0;
        subjectWisePerformance.chemistry += t.subjectWisePercentiles.chemistry || 0;
        subjectWisePerformance.botany += t.subjectWisePercentiles.botany || 0;
        subjectWisePerformance.zoology += t.subjectWisePercentiles.zoology || 0;
        testsWithSubjectData++;
      }
    });

    if (testsWithSubjectData > 0) {
      const subjects = Object.keys(subjectWisePerformance) as Array<keyof typeof subjectWisePerformance>;
      subjects.forEach((subject) => {
        subjectWisePerformance[subject] = subjectWisePerformance[subject] / testsWithSubjectData;
      });
    }

    console.log('Calculated subject-wise performance:', subjectWisePerformance);
    console.log('Tests with subject data:', testsWithSubjectData);

    await AnalyticsSummary.findOneAndUpdate(
      { userId: decoded.userId },
      {
        totalTestsAttempted: totalTests,
        averageScore,
        highestScore,
        overallAccuracy,
        estimatedAIR: bestAIR,
        subjectWisePerformance,
        lastUpdated: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json(
      { message: 'Test created successfully', test },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Test creation error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
