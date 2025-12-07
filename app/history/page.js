'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function BookingHistoryPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewTicket = (booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-[#238636] mb-4"></i>
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-[#8b949e] mb-6">Please login to view your booking history</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all inline-block">
            <i className="fas fa-home mr-2"></i>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40 backdrop-blur-lg">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-lg flex items-center justify-center">
              <i className="fas fa-train text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold">Let's Connect</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#8b949e] hover:text-[#f0f6fc] transition-all">
              <i className="fas fa-home mr-2"></i>
              Home
            </Link>
            {session?.user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#238636]/20 border border-[#238636] rounded-lg">
                <i className="fas fa-user text-[#238636]"></i>
                <span className="text-sm">{session.user.name}</span>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-4">
              <Link href="/" className="text-[#238636] hover:underline">
                <i className="fas fa-home mr-1"></i>Home
              </Link>
              <i className="fas fa-chevron-right text-xs"></i>
              <span>Booking History</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              <i className="fas fa-history text-[#238636] mr-3"></i>
              Your <span className="bg-gradient-to-r from-[#238636] to-[#2ea043] bg-clip-text text-transparent">Booking History</span>
            </h1>
            <p className="text-lg text-[#8b949e]">View and manage all your train bookings</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-white'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'confirmed'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-white'
              }`}
            >
              <i className="fas fa-check-circle mr-1"></i>
              Confirmed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'cancelled'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-white'
              }`}
            >
              <i className="fas fa-times-circle mr-1"></i>
              Cancelled
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'completed'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#161b22] text-[#8b949e] hover:text-white'
              }`}
            >
              <i className="fas fa-flag-checkered mr-1"></i>
              Completed
            </button>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-20">
              <i className="fas fa-spinner fa-spin text-4xl text-[#238636] mb-4"></i>
              <p className="text-[#8b949e]">Loading your bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#238636]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-ticket-alt text-[#238636] text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">No Bookings Found</h3>
              <p className="text-[#8b949e] mb-6">
                {filter === 'all' 
                  ? "You haven't made any bookings yet" 
                  : `No ${filter} bookings found`}
              </p>
              <Link href="/" className="px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all inline-block">
                <i className="fas fa-search mr-2"></i>
                Search Trains
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#238636] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#238636]/20 rounded-lg flex items-center justify-center">
                          <i className="fas fa-train text-[#238636] text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{booking.train?.name}</h3>
                          <p className="text-sm text-[#8b949e]">Train #{booking.train?.number} • {booking.train?.type}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          booking.status === 'confirmed' ? 'bg-[#238636]/20 text-[#238636]' :
                          booking.status === 'cancelled' ? 'bg-[#da3633]/20 text-[#da3633]' :
                          'bg-[#8b949e]/20 text-[#8b949e]'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-[#8b949e] mb-1">Booking ID</p>
                          <p className="font-mono font-semibold">{booking.bookingId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b949e] mb-1">Journey</p>
                          <p className="font-semibold">{booking.journey?.fromName} → {booking.journey?.toName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b949e] mb-1">Date & Time</p>
                          <p className="font-semibold">{booking.journey?.date} • {booking.journey?.departure}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-[#8b949e]">
                          <i className="fas fa-users mr-1"></i>
                          {booking.passengers?.length} Passenger{booking.passengers?.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-[#8b949e]">
                          <i className="fas fa-chair mr-1"></i>
                          Class: {booking.class}
                        </span>
                        <span className="text-[#238636] font-semibold">
                          <i className="fas fa-rupee-sign mr-1"></i>
                          ₹{booking.fare?.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <button
                        onClick={() => viewTicket(booking)}
                        className="flex-1 md:flex-none px-4 py-2 bg-[#238636] text-white font-semibold rounded-lg hover:bg-[#2ea043] transition-all"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        View Ticket
                      </button>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => cancelBooking(booking.bookingId)}
                          className="flex-1 md:flex-none px-4 py-2 border border-[#da3633] text-[#da3633] font-semibold rounded-lg hover:bg-[#da3633] hover:text-white transition-all"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ticket Modal */}
      {showTicketModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] border-2 border-[#238636] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-[#161b22] hover:bg-[#0d1117] border border-[#30363d] rounded-lg transition-all z-10"
            >
              <i className="fas fa-times text-lg"></i>
            </button>

            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-[#238636] to-[#2ea043] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-train text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">E-Ticket</h3>
                    <p className="text-white/80 text-sm">Let's Connect - UTS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs mb-1">Booking ID</p>
                  <p className="font-mono font-bold text-white text-lg">{selectedBooking.bookingId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <i className={`fas ${selectedBooking.status === 'confirmed' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                <span>{selectedBooking.status === 'confirmed' ? 'Booking Confirmed' : selectedBooking.status === 'cancelled' ? 'Booking Cancelled' : 'Journey Completed'}</span>
                <span className="mx-2">•</span>
                <i className="fas fa-clock"></i>
                <span>{new Date(selectedBooking.bookedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-6">
              {/* QR Code */}
              {selectedBooking.qrCode && (
                <div className="bg-white rounded-xl p-6 mb-6 text-center border-4 border-dashed border-[#238636]">
                  <div className="bg-gradient-to-br from-[#238636]/10 to-[#2ea043]/10 rounded-lg p-4 inline-block mb-3">
                    <img 
                      src={selectedBooking.qrCode} 
                      alt="Booking QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-gray-800 font-bold text-sm mb-1">Scan for Ticket Verification</p>
                  <p className="text-gray-600 text-xs">Show this QR code to TTE for validation</p>
                </div>
              )}

              {/* Train Details */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-4">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fas fa-train text-[#238636]"></i>
                  Train Details
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Train Name</p>
                    <p className="font-bold">{selectedBooking.train?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Train Number</p>
                    <p className="font-bold font-mono">{selectedBooking.train?.number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Class</p>
                    <p className="font-bold">{selectedBooking.class}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Type</p>
                    <p className="font-bold">{selectedBooking.train?.type}</p>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="bg-[#0d1117] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-[#8b949e] mb-2">Departure</p>
                      <p className="font-bold text-xl text-[#238636]">{selectedBooking.journey?.departure}</p>
                      <p className="font-semibold mt-1">{selectedBooking.journey?.fromName}</p>
                      <p className="text-xs text-[#8b949e] font-mono">{selectedBooking.journey?.from}</p>
                      <p className="text-xs text-[#8b949e] mt-1">Platform {selectedBooking.journey?.fromPlatform}</p>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <i className="fas fa-arrow-right text-[#238636] text-2xl mb-2"></i>
                      <div className="w-px h-12 bg-[#30363d]"></div>
                      <p className="text-xs text-[#8b949e] my-2">Journey</p>
                      <div className="w-px h-12 bg-[#30363d]"></div>
                    </div>

                    <div className="flex-1 text-right">
                      <p className="text-xs text-[#8b949e] mb-2">Arrival</p>
                      <p className="font-bold text-xl text-[#da3633]">{selectedBooking.journey?.arrival}</p>
                      <p className="font-semibold mt-1">{selectedBooking.journey?.toName}</p>
                      <p className="text-xs text-[#8b949e] font-mono">{selectedBooking.journey?.to}</p>
                      <p className="text-xs text-[#8b949e] mt-1">Platform {selectedBooking.journey?.toPlatform}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#30363d] text-center">
                    <p className="text-sm text-[#8b949e]">
                      <i className="fas fa-calendar mr-2"></i>
                      {selectedBooking.journey?.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-4">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fas fa-users text-[#1f6feb]"></i>
                  Passenger Details ({selectedBooking.passengers?.length})
                </h4>
                <div className="space-y-2">
                  {selectedBooking.passengers?.map((passenger, index) => (
                    <div key={index} className="flex items-center gap-3 bg-[#0d1117] rounded-lg p-3">
                      <div className="w-10 h-10 bg-[#238636]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-[#238636]">{index + 1}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-[#8b949e]">Name</p>
                          <p className="font-semibold">{passenger.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b949e]">Age / Gender</p>
                          <p className="font-semibold">{passenger.age}y / {passenger.gender === 'M' ? 'Male' : 'Female'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b949e]">Status</p>
                          <p className={`font-semibold ${selectedBooking.status === 'confirmed' ? 'text-[#238636]' : 'text-[#da3633]'}`}>
                            {selectedBooking.status === 'confirmed' ? 'Confirmed' : selectedBooking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference PNR */}
              {selectedBooking.pnr && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <i className="fas fa-link text-[#8b949e]"></i>
                    Linked to Original PNR
                  </h4>
                  <div className="flex items-center justify-between bg-[#0d1117] rounded-lg p-3">
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Original Train</p>
                      <p className="font-semibold">{selectedBooking.originalTrain?.name}</p>
                    </div>
                    <div className="px-4 py-2 bg-[#238636]/20 border border-[#238636] rounded-lg">
                      <p className="text-xs text-[#8b949e]">PNR</p>
                      <p className="font-mono font-bold text-[#238636] text-lg">{selectedBooking.pnr}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fare Details */}
              <div className="bg-gradient-to-br from-[#238636]/20 to-[#2ea043]/20 border-2 border-[#238636] rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg">Fare Details</h4>
                  <i className="fas fa-rupee-sign text-[#238636] text-2xl"></i>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#8b949e]">Base Fare</span>
                    <span className="font-semibold">₹{selectedBooking.fare?.baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b949e]">GST & Taxes</span>
                    <span className="font-semibold">₹{selectedBooking.fare?.tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b949e]">Booking Charges</span>
                    <span className="font-semibold">₹{selectedBooking.fare?.bookingCharge}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#238636] flex justify-between items-center">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-3xl text-[#238636]">₹{selectedBooking.fare?.total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.print()}
                  className="py-3 border border-[#238636] text-[#238636] font-semibold rounded-xl hover:bg-[#238636] hover:text-white transition-all"
                >
                  <i className="fas fa-print mr-2"></i>
                  Print Ticket
                </button>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <i className="fas fa-times mr-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </div>
  );
}
