import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Test from '@/models/Test';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check all tests in database for current user
 * GET /api/debug/tests
 */
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

    // Get all tests for this user with full details
    const allTests = await Test.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    console.log('=== DEBUG: All tests for user ===');
    console.log('Total tests:', allTests.length);

    const testsWithDetails = allTests.map((test, index) => {
      const testObj = test.toObject ? test.toObject() : test;
      console.log(`\n--- Test ${index + 1} ---`);
      console.log('Test Name:', testObj.testName);
      console.log('ID:', testObj._id);
      console.log('Has subjectWiseMarks:', !!testObj.subjectWiseMarks);
      console.log('subjectWiseMarks:', testObj.subjectWiseMarks);
      console.log('totalMarksObtained:', testObj.totalMarksObtained);
      console.log('overallPercentile:', testObj.overallPercentile);
      console.log('All keys:', Object.keys(testObj).sort());
      
      return testObj;
    });

    return NextResponse.json(
      {
        total: allTests.length,
        tests: testsWithDetails,
        debug: {
          userId: decoded.userId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        message: error.message || 'An error occurred',
        error: error.toString(),
      },
      { status: 500 }
    );
  }
}
