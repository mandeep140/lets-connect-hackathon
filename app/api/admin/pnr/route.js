import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import PNR from '@/models/PNR';

// GET all PNRs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const pnrs = await PNR.find().sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        pnrs
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get PNRs error:', error);
    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST create new PNR
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pnr, train, route, distance, estimatedTime, passengers, connections } = body;

    // Validate required fields
    if (!pnr || !train || !route || !distance || !estimatedTime) {
      return Response.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate PNR format
    if (pnr.length !== 10) {
      return Response.json(
        { success: false, message: 'PNR must be 10 digits' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if PNR already exists
    const existingPNR = await PNR.findOne({ pnr });
    if (existingPNR) {
      return Response.json(
        { success: false, message: 'PNR already exists' },
        { status: 409 }
      );
    }

    const newPNR = new PNR({
      pnr,
      train,
      route,
      distance,
      estimatedTime,
      passengers: passengers || [],
      connections: connections || []
    });

    await newPNR.save();

    return Response.json(
      {
        success: true,
        message: 'PNR created successfully',
        pnr: newPNR
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create PNR error:', error);
    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
