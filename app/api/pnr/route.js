import connectDB from '@/lib/connectDB';
import PNR from '@/models/PNR';

// GET all PNRs (public endpoint for home page)
export async function GET(request) {
  try {
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

// Search PNR by number
export async function POST(request) {
  try {
    const body = await request.json();
    const { pnr } = body;

    if (!pnr) {
      return Response.json(
        { success: false, message: 'PNR is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const pnrData = await PNR.findOne({ pnr });

    if (!pnrData) {
      return Response.json(
        { success: false, message: 'PNR not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        pnr: pnrData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Search PNR error:', error);
    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
