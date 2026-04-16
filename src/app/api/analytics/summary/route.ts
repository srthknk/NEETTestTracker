import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AnalyticsSummary from '@/models/AnalyticsSummary';
import { verifyToken } from '@/lib/auth';

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

    let analytics = await AnalyticsSummary.findOne({
      userId: decoded.userId,
    });

    if (!analytics) {
      // Create default analytics if doesn't exist
      analytics = new AnalyticsSummary({
        userId: decoded.userId,
      });
      await analytics.save();
    }

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
