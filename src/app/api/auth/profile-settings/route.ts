import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ProfileUpdateBody {
  studentName?: string;
  studentEmail?: string;
  parentName?: string;
  parentEmails?: string[];
  targetMarks?: number;
}

interface ProfileResponse {
  _id: string;
  email: string;
  name: string;
  studentName?: string;
  studentEmail?: string;
  parentName?: string;
  parentEmails?: string[];
  targetMarks: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileData: ProfileResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      studentName: user.studentName,
      studentEmail: user.studentEmail,
      parentName: user.parentName,
      parentEmails: user.parentEmails || [],
      targetMarks: user.targetMarks,
    };

    return NextResponse.json({
      user: profileData,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body: ProfileUpdateBody = await request.json();

    // Validate emails end with @gmail.com
    if (body.studentEmail && !body.studentEmail.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Student email must end with @gmail.com' },
        { status: 400 }
      );
    }

    if (body.parentEmails && body.parentEmails.length > 0) {
      for (const email of body.parentEmails) {
        if (email && !email.endsWith('@gmail.com')) {
          return NextResponse.json(
            { error: 'All parent emails must end with @gmail.com' },
            { status: 400 }
          );
        }
      }
    }

    await dbConnect();

    const updateData: any = {};
    if (body.studentName !== undefined) updateData.studentName = body.studentName;
    if (body.studentEmail !== undefined) updateData.studentEmail = body.studentEmail;
    if (body.parentName !== undefined) updateData.parentName = body.parentName;
    if (body.parentEmails !== undefined) updateData.parentEmails = body.parentEmails.filter((e: string) => e.trim());
    if (body.targetMarks !== undefined) updateData.targetMarks = body.targetMarks;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileData: ProfileResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      studentName: user.studentName,
      studentEmail: user.studentEmail,
      parentName: user.parentName,
      parentEmails: user.parentEmails || [],
      targetMarks: user.targetMarks,
    };

    return NextResponse.json({
      user: profileData,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError' && error.errors) {
      const firstError = Object.values(error.errors)[0] as any;
      const errorMessage = firstError?.message || 'Validation error';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
