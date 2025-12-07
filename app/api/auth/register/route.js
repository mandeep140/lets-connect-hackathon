import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, password, phone, age, preferences } = body;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !age) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed automatically by the pre-save hook)
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      age,
      preferences: preferences || 'economy'
    });

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      age: user.age,
      preferences: user.preferences,
      isVerified: user.isVerified
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful! Please login to continue.',
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
