import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    let user = await User.findOne({ email });

    // If user doesn't exist, create default user on first login attempt
    if (!user) {
      // Check if this is a valid default account
      const isValidAdmin =
        email === 'admin@neet.com' &&
        password === 'admin123';

      const isValidSarthak =
        email === 'sarthaknk08@gmail.com' &&
        password === 'Sarthak@2008';

      if (isValidAdmin || isValidSarthak) {
        // Create the user
        const hashedPassword = await hashPassword(password);
        const userName = isValidSarthak ? 'Sarthak Kulkarni' : 'NEET Admin';
        user = new User({
          email,
          password: hashedPassword,
          name: userName,
          targetMarks: 650,
        });
        await user.save();
      } else {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } else {
      // Verify password for existing user
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    // Generate token
    const token = generateToken(user._id.toString());

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          targetMarks: user.targetMarks,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
