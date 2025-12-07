import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import PNR from '@/models/PNR';

// PUT update PNR
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { pnr, train, route, distance, estimatedTime, passengers, connections } = body;

    await connectDB();

    const updatedPNR = await PNR.findByIdAndUpdate(
      id,
      {
        pnr,
        train,
        route,
        distance,
        estimatedTime,
        passengers,
        connections,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedPNR) {
      return Response.json(
        { success: false, message: 'PNR not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'PNR updated successfully',
        pnr: updatedPNR
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update PNR error:', error);
    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE PNR
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const deletedPNR = await PNR.findByIdAndDelete(id);

    if (!deletedPNR) {
      return Response.json(
        { success: false, message: 'PNR not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'PNR deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete PNR error:', error);
    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
