import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email || email !== session.user.email) {
      return Response.json(
        { success: false, message: 'Invalid request' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          phone: user.phone,
          age: user.age,
          preferences: user.preferences,
          isVerified: user.isVerified,
          verificationMethod: user.verificationMethod,
          verifiedAt: user.verifiedAt,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get user error:', error);
    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
