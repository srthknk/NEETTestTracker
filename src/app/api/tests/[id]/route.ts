import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Test from '@/models/Test';
import AnalyticsSummary from '@/models/AnalyticsSummary';
import { verifyToken } from '@/lib/auth';
import { calculateAIR } from '@/lib/airCalculator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const test = await Test.findById(params.id);

    if (!test || test.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(test, { status: 200 });
  } catch (error: any) {
    console.error('Fetch test error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const test = await Test.findById(params.id);

    if (!test || test.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Test not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Calculate total marks from subject-wise marks
    const totalMarksObtained =
      body.subjectWiseMarks.physics.obtained +
      body.subjectWiseMarks.chemistry.obtained +
      body.subjectWiseMarks.botany.obtained +
      body.subjectWiseMarks.zoology.obtained;

    // Calculate subject-wise percentiles
    const subjectWisePercentiles = {
      physics: (body.subjectWiseMarks.physics.obtained / 180) * 100,
      chemistry: (body.subjectWiseMarks.chemistry.obtained / 180) * 100,
      botany: (body.subjectWiseMarks.botany.obtained / 180) * 100,
      zoology: (body.subjectWiseMarks.zoology.obtained / 180) * 100,
    };

    // Calculate overall percentile
    const overallPercentile = (totalMarksObtained / 720) * 100;

    // Calculate estimated AIR from percentile
    const testYear = new Date(body.date).getFullYear();
    const estimatedAIR = calculateAIR(overallPercentile, testYear);

    const updatedTest = await Test.findByIdAndUpdate(
      params.id,
      {
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
      },
      { new: true }
    );

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

    await AnalyticsSummary.findOneAndUpdate(
      { userId: decoded.userId },
      {
        totalTestsAttempted: totalTests,
        averageScore,
        highestScore,
        overallAccuracy,
        estimatedAIR: bestAIR,
        lastUpdated: new Date(),
      }
    );

    return NextResponse.json(
      { message: 'Test updated successfully', test: updatedTest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update test error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const test = await Test.findById(params.id);

    if (!test || test.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Test not found' },
        { status: 404 }
      );
    }

    await Test.findByIdAndDelete(params.id);

    // Update analytics
    const tests = await Test.find({ userId: decoded.userId });
    const totalTests = tests.length;

    if (totalTests === 0) {
      await AnalyticsSummary.findOneAndUpdate(
        { userId: decoded.userId },
        {
          totalTestsAttempted: 0,
          averageScore: 0,
          highestScore: 0,
          overallAccuracy: 0,
          estimatedAIR: 999999,
        }
      );
    } else {
      const averageScore =
        tests.reduce((sum: number, t: any) => sum + (t.totalMarksObtained || t.marksObtained || 0), 0) /
        totalTests;
      const highestScore = Math.max(
        ...tests.map((t: any) => t.totalMarksObtained || t.marksObtained || 0)
      );
      const overallAccuracy =
        tests.reduce((sum: number, t: any) => sum + (t.overallPercentile || ((t.marksObtained || 0) / (t.totalMarks || 720)) * 100), 0) /
        totalTests;
      
      // Calculate best AIR (lowest value is better)
      const estimatedAIRs = tests.map((t: any) => t.estimatedAIR || 999999).filter((air: number) => air !== 999999);
      const bestAIR = estimatedAIRs.length > 0 ? Math.min(...estimatedAIRs) : 999999;

      await AnalyticsSummary.findOneAndUpdate(
        { userId: decoded.userId },
        {
          totalTestsAttempted: totalTests,
          averageScore,
          highestScore,
          overallAccuracy,
          estimatedAIR: bestAIR,
          lastUpdated: new Date(),
        }
      );
    }

    return NextResponse.json(
      { message: 'Test deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete test error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
