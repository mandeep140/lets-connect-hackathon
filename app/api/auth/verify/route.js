import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session:', session); // Debug log

    if (!session || !session.user) {
      return Response.json(
        { success: false, message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { verificationType, documentNumber } = body;

    console.log('Verification request:', { verificationType, documentNumber }); // Debug log

    // Validate input
    if (!verificationType || !documentNumber) {
      return Response.json(
        { success: false, message: 'Verification type and document number are required' },
        { status: 400 }
      );
    }

    // Validate verification type
    const validTypes = ['aadhaar', 'pan', 'passport'];
    if (!validTypes.includes(verificationType.toLowerCase())) {
      return Response.json(
        { success: false, message: 'Invalid verification type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email from session
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return Response.json(
        { success: true, message: 'User is already verified', isVerified: true },
        { status: 200 }
      );
    }

    // Simple validation based on type
    let isValid = false;
    let errorMessage = '';

    switch (verificationType.toLowerCase()) {
      case 'aadhaar':
        // Aadhaar: 12 digits
        isValid = /^\d{12}$/.test(documentNumber);
        errorMessage = 'Aadhaar number must be 12 digits';
        break;
      case 'pan':
        // PAN: 10 characters (ABCDE1234F format)
        isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(documentNumber);
        errorMessage = 'PAN number must be in format: ABCDE1234F';
        break;
      case 'passport':
        // Passport: 8 characters (A1234567 format)
        isValid = /^[A-Z]{1}[0-9]{7}$/.test(documentNumber);
        errorMessage = 'Passport number must be in format: A1234567';
        break;
    }

    if (!isValid) {
      return Response.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationMethod = verificationType.toLowerCase();
    user.verifiedAt = new Date();
    await user.save();

    console.log('User verified successfully:', user.email); // Debug log

    return Response.json(
      {
        success: true,
        message: 'Verification successful! You are now verified.',
        isVerified: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          isVerified: user.isVerified,
          verificationMethod: user.verificationMethod,
          verifiedAt: user.verifiedAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return Response.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
