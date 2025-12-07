'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [currentPNRData, setCurrentPNRData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [selectedFromStation, setSelectedFromStation] = useState('');
  const [selectedToStation, setSelectedToStation] = useState('');
  const [availableStations, setAvailableStations] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [showTicket, setShowTicket] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPNRData = sessionStorage.getItem('currentPNRData');
      
      if (storedPNRData) {
        const pnrData = JSON.parse(storedPNRData);
        setCurrentPNRData(pnrData);
        
        if (pnrData.from_station) setFromStation(pnrData.from_station);
        if (pnrData.to_station) setToStation(pnrData.to_station);
        
        if (pnrData.selectedPassengers && pnrData.selectedPassengers.length > 0) {
          setPassengers(pnrData.selectedPassengers.length);
          setSelectedPassengers(pnrData.selectedPassengers);
        } else if (pnrData.passengers && pnrData.passengers.length > 0) {
          setPassengers(pnrData.passengers.length);
          setSelectedPassengers(pnrData.passengers);
        }
        
        if (pnrData.from_station && pnrData.to_station) {
          searchRoute(pnrData.from_station, pnrData.to_station);
        }
      }
    }
  }, []);

  const searchRoute = async (from = fromStation, to = toStation) => {
    if (!from || !to) {
      return;
    }

    setLoading(true);
    try {
      let apiUrl = `/api/routes?from=${from.toUpperCase()}&to=${to.toUpperCase()}`;
      if (currentPNRData?.train_number) {
        apiUrl += `&train=${currentPNRData.train_number}`;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        setRouteData(data);
        
        const stations = data.path || [];
        setAvailableStations(stations);
      } else {
        setRouteData(null);
      }
    } catch (error) {
      console.error('Error searching route:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSegment = (segment, train) => {
    setSelectedTrain(train);
    setSelectedFromStation(segment.from);
    setSelectedToStation(segment.to);
  };

  const bookTicket = () => {
    if (!selectedTrain || !selectedFromStation || !selectedToStation) {
      return;
    }
    
    if (currentPNRData && selectedFromStation) {
      const pnrArrivalTime = currentPNRData.boarding_time;
      const boardingTime = selectedTrain.departure;
      
      const parseTime = (timeStr) => {
        if (!timeStr || timeStr === '--') return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const pnrArrival = parseTime(pnrArrivalTime);
      const connectionDeparture = parseTime(boardingTime);
      
      if (pnrArrival !== null && connectionDeparture !== null) {
        let timeDiff = connectionDeparture - pnrArrival;
        
        if (timeDiff < 0) timeDiff += 24 * 60;
        
        const hoursDiff = timeDiff / 60;
        
        if (hoursDiff > 2) {
          return;
        }
      }
    }
    
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    const bookingId = `BKG${Date.now().toString().slice(-8)}`;
    const fare = Math.floor(passengers * (Math.random() * 500 + 300));
    const bookingTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const booking = {
      bookingId,
      fare,
      bookingTime,
      train: selectedTrain,
      from: selectedFromStation,
      to: selectedToStation,
      fromName: getStationName(selectedFromStation),
      toName: getStationName(selectedToStation),
      passengers: selectedPassengers,
      pnr: currentPNRData?.pnr,
      originalTrain: currentPNRData?.train_name,
      journeyDate: selectedTrain.journey_day
    };

    const qrData = `IRCTC-LET'S CONNECT|BKG:${bookingId}|TRN:${selectedTrain.number}|FROM:${selectedFromStation}|TO:${selectedToStation}|PAX:${passengers}|FARE:${fare}|DATE:${selectedTrain.journey_day}|REF:${currentPNRData?.pnr}`;
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    
    setBookingDetails(booking);
    setShowBookingModal(false);
    setShowTicket(true);
  };

  const getStationName = (code) => {
    if (!routeData || !routeData.segments) return code;
    
    for (const segment of routeData.segments) {
      if (segment.from === code) return segment.from_name;
      if (segment.to === code) return segment.to_name;
    }
    return code;
  };

  const isTrainBookable = (train) => {
    if (!currentPNRData || !train) return true;
    
    const pnrArrivalTime = currentPNRData.boarding_time;
    const boardingTime = train.departure;
    
    const parseTime = (timeStr) => {
      if (!timeStr || timeStr === '--') return null;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const pnrArrival = parseTime(pnrArrivalTime);
    const connectionDeparture = parseTime(boardingTime);
    
    if (pnrArrival !== null && connectionDeparture !== null) {
      let timeDiff = connectionDeparture - pnrArrival;
      if (timeDiff < 0) timeDiff += 24 * 60;
      const hoursDiff = timeDiff / 60;
      return hoursDiff <= 2;
    }
    
    return true;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(35,134,54,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(31,111,235,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(218,54,51,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-[rgba(13,17,23,0.95)] backdrop-blur-md border-b border-[#30363d] z-50">
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[70px]">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <i className="fas fa-route text-[#238636] text-2xl"></i>
            <span>Let's Connect</span>
          </Link>

          <ul className={`md:flex md:gap-6 md:items-center ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex-row flex-col absolute md:relative top-[70px] md:top-0 left-0 w-full md:w-auto bg-[#161b22] md:bg-transparent p-4 md:p-0`}>
            <li><Link href="/" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Home</Link></li>
            <li><Link href="/#pnr-section" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">PNR Search</Link></li>
            <li><Link href="/#features" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Features</Link></li>
            <li><Link href="/#about" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">About</Link></li>
            <li><Link href="/#pricing" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Pricing</Link></li>
            <li><Link href="/#contact" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Contact</Link></li>
          </ul>

          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#238636] text-[#238636] hover:bg-[#238636] hover:text-white transition-all">
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              <div className="w-5 flex flex-col gap-1">
                <span className="h-0.5 bg-white rounded"></span>
                <span className="h-0.5 bg-white rounded"></span>
                <span className="h-0.5 bg-white rounded"></span>
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Booking Hero */}
      <section className="pt-[100px] pb-12 bg-[#161b22] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-6">
            <Link href="/" className="text-[#238636] hover:underline">
              <i className="fas fa-home mr-1"></i>Home
            </Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span>Booking</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Book Your <span className="bg-gradient-to-r from-[#238636] to-[#2ea043] bg-clip-text text-transparent">Train Journey</span>
          </h1>
          <p className="text-lg text-[#8b949e] mb-8">Select interval stations and book tickets</p>

          {/* PNR Summary */}
          {currentPNRData && (
            <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border-2 border-[#238636] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <i className="fas fa-ticket-alt text-[#238636]"></i>
                  Your PNR Details
                </h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#238636]/20 border-2 border-[#238636] rounded-xl">
                  <i className="fas fa-hashtag text-[#238636]"></i>
                  <span className="font-mono font-bold text-lg">{currentPNRData.pnr}</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fas fa-train text-2xl text-[#238636]"></i>
                    <div className="flex-1">
                      <p className="text-xs text-[#8b949e] mb-1">Train</p>
                      <h4 className="font-bold">{currentPNRData.train_name}</h4>
                      <p className="text-sm text-[#8b949e]">#{currentPNRData.train_number} • {currentPNRData.train_type || 'Express'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fas fa-route text-2xl text-[#1f6feb]"></i>
                    <div className="flex-1">
                      <p className="text-xs text-[#8b949e] mb-1">Journey Route</p>
                      <h4 className="font-bold">{currentPNRData.from_station_name || currentPNRData.from_station}</h4>
                      <p className="text-sm text-[#8b949e]">→ {currentPNRData.to_station_name || currentPNRData.to_station}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fas fa-clock text-2xl text-[#da3633]"></i>
                    <div className="flex-1">
                      <p className="text-xs text-[#8b949e] mb-1">Journey Time</p>
                      <h4 className="font-bold text-lg">{currentPNRData.boarding_time || '--'}</h4>
                      <p className="text-sm text-[#8b949e]">{currentPNRData.journey_date || 'Today'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fas fa-users text-2xl text-[#f78166]"></i>
                    <div className="flex-1">
                      <p className="text-xs text-[#8b949e] mb-1">Passengers</p>
                      <h4 className="font-bold text-lg">{passengers} Traveller{passengers > 1 ? 's' : ''}</h4>
                      <p className="text-sm text-[#8b949e]">Class: {currentPNRData.class || 'SL'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                  <p className="text-xs text-[#8b949e] mb-1">Distance</p>
                  <p className="font-bold text-lg">{currentPNRData.distance || Math.floor(Math.random() * 500 + 100)} km</p>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                  <p className="text-xs text-[#8b949e] mb-1">Duration</p>
                  <p className="font-bold text-lg">{currentPNRData.duration || `${Math.floor(Math.random() * 8 + 2)}h ${Math.floor(Math.random() * 60)}m`}</p>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                  <p className="text-xs text-[#8b949e] mb-1">Status</p>
                  <p className="font-bold text-lg text-[#238636]"><i className="fas fa-check-circle mr-1"></i>Confirmed</p>
                </div>
              </div>
              
              {/* Passenger List */}
              {selectedPassengers.length > 0 && (
                <div className="border-t border-[#30363d] pt-4">
                  <h4 className="text-sm font-semibold text-[#8b949e] mb-2">Passengers:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPassengers.map((passenger, index) => (
                      <div key={index} className="px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-lg text-sm">
                        <i className="fas fa-user text-[#238636] mr-2"></i>
                        {passenger.name} ({passenger.age}y, {passenger.gender})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>


      {/* Route Results */}
      {routeData && (
        <>
          {/* Route Overview */}
          <section className="py-8 bg-[#161b22]">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">
                  <i className="fas fa-route text-[#238636] mr-2"></i>
                  Route Overview
                </h2>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#238636]">{routeData.total_stations}</div>
                    <div className="text-sm text-[#8b949e]">Total Stations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#1f6feb]">{routeData.segments?.length || 0}</div>
                    <div className="text-sm text-[#8b949e]">Segments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#da3633]">{routeData.from}</div>
                    <div className="text-sm text-[#8b949e]">From</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#da3633]">{routeData.to}</div>
                    <div className="text-sm text-[#8b949e]">To</div>
                  </div>
                </div>

                {/* Station Path */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-[#8b949e]">Complete Route Path:</h3>
                  <div className="flex flex-wrap gap-2">
                    {routeData.path?.map((station, index) => (
                      <div key={index} className="flex items-center">
                        <span className="px-3 py-1 bg-[#0d1117] border border-[#238636] rounded-lg font-mono text-sm">
                          {station}
                        </span>
                        {index < routeData.path.length - 1 && (
                          <i className="fas fa-arrow-right text-[#8b949e] mx-2"></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Available Trains by Segment */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">
                <i className="fas fa-train text-[#238636] mr-2"></i>
                Select Your Journey Details
              </h2>

              {/* Interval Station Selection */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">
                  <i className="fas fa-map-marker-alt text-[#238636] mr-2"></i>
                  Choose Boarding & Destination Stations
                </h3>
                <p className="text-sm text-[#8b949e] mb-6">
                  Select any interval stations from the route path for your journey
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <i className="fas fa-arrow-circle-up text-[#238636] mr-2"></i>
                      Boarding Station
                    </label>
                    <select
                      value={selectedFromStation}
                      onChange={(e) => setSelectedFromStation(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all"
                    >
                      <option value="">Select boarding station</option>
                      {availableStations.map((station, index) => (
                        <option key={index} value={station}>
                          {getStationName(station)} ({station})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <i className="fas fa-arrow-circle-down text-[#da3633] mr-2"></i>
                      Destination Station
                    </label>
                    <select
                      value={selectedToStation}
                      onChange={(e) => setSelectedToStation(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all"
                    >
                      <option value="">Select destination station</option>
                      {availableStations.map((station, index) => (
                        <option key={index} value={station}>
                          {getStationName(station)} ({station})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedFromStation && selectedToStation && (
                  <div className="mt-6 p-4 bg-[#238636]/10 border border-[#238636]/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-check-circle text-[#238636] text-xl"></i>
                      <div>
                        <p className="font-semibold">Journey Selected</p>
                        <p className="text-sm text-[#8b949e]">
                          {getStationName(selectedFromStation)} → {getStationName(selectedToStation)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Trains */}
              <h3 className="text-xl font-bold mb-4">Available Trains</h3>
              <p className="text-[#8b949e] mb-6">Select a train for your journey</p>

              {routeData.segments?.map((segment, segIndex) => (
                <div key={segIndex} className="mb-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#238636]/20 rounded-lg flex items-center justify-center">
                          <i className="fas fa-route text-[#238636] text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">
                            {segment.from_name} → {segment.to_name}
                          </h3>
                          <p className="text-sm text-[#8b949e]">
                            {segment.from} to {segment.to}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#8b949e]">{segment.trains?.length || 0} trains available</div>
                      </div>
                    </div>

                    {/* Trains for this segment */}
                    {segment.trains && segment.trains.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {segment.trains.map((train, trainIndex) => {
                          const bookable = isTrainBookable(train);
                          return (
                          <div
                            key={trainIndex}
                            className={`bg-[#0d1117] border rounded-xl p-4 transition-all ${
                              !bookable
                                ? 'opacity-50 cursor-not-allowed border-[#30363d]'
                                : selectedTrain?.number === train.number
                                ? 'border-[#238636] shadow-lg shadow-[#238636]/20 cursor-pointer'
                                : 'border-[#30363d] hover:border-[#238636]/50 cursor-pointer'
                            }`}
                            onClick={() => bookable && selectSegment(segment, train)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-white">{train.name}</h4>
                                <p className="text-xs text-[#8b949e]">#{train.number}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-md text-xs ${
                                train.type === 'Rajdhani' ? 'bg-red-500/20 text-red-400' :
                                train.type === 'Shatabdi' ? 'bg-blue-500/20 text-blue-400' :
                                train.type === 'Duronto' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {train.type}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm mb-3">
                              <div className="flex items-center gap-2 text-[#8b949e]">
                                <i className="fas fa-arrow-up w-4"></i>
                                <span>Dep: {train.departure} (Platform {train.from_platform})</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#8b949e]">
                                <i className="fas fa-arrow-down w-4"></i>
                                <span>Arr: {train.arrival} (Platform {train.to_platform})</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#8b949e]">
                                <i className="fas fa-calendar w-4"></i>
                                <span>{train.journey_day}</span>
                              </div>
                            </div>

                            {selectedTrain?.number === train.number && bookable && (
                              <div className="flex items-center gap-2 text-[#238636] text-sm font-semibold">
                                <i className="fas fa-check-circle"></i>
                                <span>Selected</span>
                              </div>
                            )}
                            
                            {!bookable && (
                              <div className="mt-2 pt-2 border-t border-[#30363d]">
                                <div className="flex items-center gap-2 text-[#da3633] text-xs">
                                  <i className="fas fa-exclamation-triangle"></i>
                                  <span>Outside 2-hour window</span>
                                </div>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[#8b949e]">
                        <i className="fas fa-info-circle text-3xl mb-2"></i>
                        <p>No trains available for this segment</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Booking Summary */}
              {selectedTrain && selectedFromStation && selectedToStation && (
                <div className="sticky bottom-4 bg-[#161b22] border-2 border-[#238636] rounded-xl p-6 shadow-2xl">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#238636]/20 rounded-lg flex items-center justify-center">
                          <i className="fas fa-train text-[#238636] text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{selectedTrain.name} ({selectedTrain.number})</p>
                          <p className="text-sm text-[#8b949e]">
                            {getStationName(selectedFromStation)} → {getStationName(selectedToStation)}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-[#238636]">
                              <i className="fas fa-users mr-1"></i>
                              {passengers} Passenger{passengers > 1 ? 's' : ''}
                            </p>
                            {selectedPassengers.length > 0 && (
                              <p className="text-xs text-[#8b949e]">
                                ({selectedPassengers.map(p => p.name).join(', ')})
                              </p>
                            )}
                          </div>
                          {!isTrainBookable(selectedTrain) && (
                            <div className="mt-2 flex items-center gap-2 text-[#da3633] text-sm">
                              <i className="fas fa-exclamation-circle"></i>
                              <span>Train departs more than 2 hours after your PNR arrival</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={bookTicket}
                      disabled={!isTrainBookable(selectedTrain)}
                      className={`px-6 py-3 font-semibold rounded-xl transition-all ${
                        isTrainBookable(selectedTrain)
                          ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] text-white hover:shadow-lg cursor-pointer'
                          : 'bg-[#30363d] text-[#8b949e] cursor-not-allowed opacity-50'
                      }`}
                    >
                      <i className="fas fa-ticket-alt mr-2"></i>
                      {isTrainBookable(selectedTrain) ? 'Book Now' : 'Not Available'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Empty State */}
      {!routeData && !loading && (
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-[#238636]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-[#238636] text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4">Search for Train Routes</h3>
            <p className="text-[#8b949e] mb-6">
              Enter your source and destination station codes to find available trains and interval stations
            </p>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <h4 className="font-semibold mb-3">Popular Station Codes:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">NDLS</span> - New Delhi</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">HWH</span> - Howrah</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">MMCT</span> - Mumbai</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">MAS</span> - Chennai</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">BPL</span> - Bhopal</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">LKO</span> - Lucknow</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">PNBE</span> - Patna</div>
                <div className="text-[#8b949e]"><span className="text-[#238636] font-mono">CNB</span> - Kanpur</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-[#30363d] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#8b949e]">
          <p>&copy; 2025 Let's Connect. Made with ❤️ by IIT Patna Students.</p>
        </div>
      </footer>

      {/* Booking Modal */}
      {showBookingModal && selectedTrain && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-[#0d1117] rounded-lg transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#238636]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-ticket-alt text-[#238636] text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">Confirm Your Booking</h3>
              <p className="text-[#8b949e]">Review your journey details before proceeding</p>
            </div>
            
            <div className="space-y-4">
              {/* Train Details Card */}
              <div className="bg-[#0d1117] border border-[#238636] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#238636]/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-train text-[#238636] text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{selectedTrain.name}</h4>
                    <p className="text-sm text-[#8b949e]">Train #{selectedTrain.number} • {selectedTrain.type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-[#161b22] rounded-lg p-3">
                    <p className="text-[#8b949e] text-xs mb-1">Departure</p>
                    <p className="font-semibold text-lg">{selectedTrain.departure}</p>
                    <p className="text-[#8b949e] text-xs">Platform {selectedTrain.from_platform}</p>
                  </div>
                  <div className="bg-[#161b22] rounded-lg p-3">
                    <p className="text-[#8b949e] text-xs mb-1">Arrival</p>
                    <p className="font-semibold text-lg">{selectedTrain.arrival}</p>
                    <p className="text-[#8b949e] text-xs">Platform {selectedTrain.to_platform}</p>
                  </div>
                </div>
              </div>

              {/* Journey Route Card */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <i className="fas fa-route text-[#1f6feb]"></i>
                  Journey Route
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-[#8b949e] mb-1">From</p>
                    <p className="font-semibold">{getStationName(selectedFromStation)}</p>
                    <p className="text-xs text-[#8b949e] font-mono">{selectedFromStation}</p>
                  </div>
                  <i className="fas fa-arrow-right text-[#238636] text-xl"></i>
                  <div className="flex-1 text-right">
                    <p className="text-xs text-[#8b949e] mb-1">To</p>
                    <p className="font-semibold">{getStationName(selectedToStation)}</p>
                    <p className="text-xs text-[#8b949e] font-mono">{selectedToStation}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#30363d] text-sm text-[#8b949e]">
                  <i className="fas fa-calendar mr-2"></i>
                  {selectedTrain.journey_day}
                </div>
              </div>

              {/* Passenger Details Card */}
              {selectedPassengers.length > 0 && (
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-users text-[#da3633]"></i>
                    {passengers} Passenger{passengers > 1 ? 's' : ''}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedPassengers.map((passenger, index) => (
                      <div key={index} className="flex items-center gap-3 bg-[#161b22] rounded-lg p-3">
                        <div className="w-10 h-10 bg-[#238636]/20 rounded-full flex items-center justify-center">
                          <span className="font-bold text-[#238636]">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{passenger.name}</p>
                          <p className="text-xs text-[#8b949e]">
                            {passenger.age}y • {passenger.gender === 'M' ? 'Male' : 'Female'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference PNR Card */}
              {currentPNRData && (
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-link text-[#8b949e]"></i>
                    Reference PNR
                  </h4>
                  <div className="flex items-center justify-between bg-[#161b22] rounded-lg p-3">
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Original Train</p>
                      <p className="font-semibold">{currentPNRData.train_name}</p>
                    </div>
                    <div className="px-3 py-1 bg-[#238636]/20 border border-[#238636] rounded-lg">
                      <p className="text-xs text-[#8b949e]">PNR</p>
                      <p className="font-mono font-bold text-[#238636]">{currentPNRData.pnr}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fare Card */}
              <div className="bg-gradient-to-br from-[#238636]/20 to-[#2ea043]/20 border border-[#238636] rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b949e] mb-1">Total Fare</p>
                    <p className="text-3xl font-bold text-[#238636]">₹{Math.floor(passengers * (Math.random() * 500 + 300))}</p>
                  </div>
                  <i className="fas fa-rupee-sign text-[#238636] text-4xl opacity-20"></i>
                </div>
                <p className="text-xs text-[#8b949e] mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Includes all taxes and booking charges
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 border border-[#30363d] text-white font-semibold rounded-xl hover:bg-[#0d1117] transition-all"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Go Back
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 transition-all"
              >
                <i className="fas fa-credit-card mr-2"></i>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Display with QR Code */}
      {showTicket && bookingDetails && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] border-2 border-[#238636] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => {
                setShowTicket(false);
                window.location.href = '/';
              }}
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
                  <p className="font-mono font-bold text-white text-lg">{bookingDetails.bookingId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <i className="fas fa-check-circle"></i>
                <span>Booking Confirmed</span>
                <span className="mx-2">•</span>
                <i className="fas fa-clock"></i>
                <span>{bookingDetails.bookingTime}</span>
              </div>
            </div>

            <div className="p-6">
              {/* QR Code Section - UTS Style */}
              <div className="bg-white rounded-xl p-6 mb-6 text-center border-4 border-dashed border-[#238636]">
                <div className="bg-gradient-to-br from-[#238636]/10 to-[#2ea043]/10 rounded-lg p-4 inline-block mb-3">
                  {qrCode && (
                    <img 
                      src={qrCode} 
                      alt="Booking QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  )}
                </div>
                <p className="text-gray-800 font-bold text-sm mb-1">Scan for Ticket Verification</p>
                <p className="text-gray-600 text-xs">Show this QR code to TTE for validation</p>
              </div>

              {/* Train Details */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-4">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fas fa-train text-[#238636]"></i>
                  Train Details
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Train Name</p>
                    <p className="font-bold">{bookingDetails.train.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Train Number</p>
                    <p className="font-bold font-mono">{bookingDetails.train.number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Class</p>
                    <p className="font-bold">{currentPNRData?.class || 'SL'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Type</p>
                    <p className="font-bold">{bookingDetails.train.type}</p>
                  </div>
                </div>
                
                {/* Journey Timeline */}
                <div className="bg-[#0d1117] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-[#8b949e] mb-2">Departure</p>
                      <p className="font-bold text-xl text-[#238636]">{bookingDetails.train.departure}</p>
                      <p className="font-semibold mt-1">{bookingDetails.fromName}</p>
                      <p className="text-xs text-[#8b949e] font-mono">{bookingDetails.from}</p>
                      <p className="text-xs text-[#8b949e] mt-1">Platform {bookingDetails.train.from_platform}</p>
                    </div>
                    
                    <div className="flex flex-col items-center px-4">
                      <i className="fas fa-arrow-right text-[#238636] text-2xl mb-2"></i>
                      <div className="w-px h-12 bg-[#30363d]"></div>
                      <p className="text-xs text-[#8b949e] my-2">Journey</p>
                      <div className="w-px h-12 bg-[#30363d]"></div>
                    </div>
                    
                    <div className="flex-1 text-right">
                      <p className="text-xs text-[#8b949e] mb-2">Arrival</p>
                      <p className="font-bold text-xl text-[#da3633]">{bookingDetails.train.arrival}</p>
                      <p className="font-semibold mt-1">{bookingDetails.toName}</p>
                      <p className="text-xs text-[#8b949e] font-mono">{bookingDetails.to}</p>
                      <p className="text-xs text-[#8b949e] mt-1">Platform {bookingDetails.train.to_platform}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#30363d] text-center">
                    <p className="text-sm text-[#8b949e]">
                      <i className="fas fa-calendar mr-2"></i>
                      {bookingDetails.journeyDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-4">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="fas fa-users text-[#1f6feb]"></i>
                  Passenger Details ({bookingDetails.passengers.length})
                </h4>
                <div className="space-y-2">
                  {bookingDetails.passengers.map((passenger, index) => (
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
                          <p className="font-semibold text-[#238636]">Confirmed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference PNR */}
              {bookingDetails.pnr && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <i className="fas fa-link text-[#8b949e]"></i>
                    Linked to Original PNR
                  </h4>
                  <div className="flex items-center justify-between bg-[#0d1117] rounded-lg p-3">
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Original Train</p>
                      <p className="font-semibold">{bookingDetails.originalTrain}</p>
                    </div>
                    <div className="px-4 py-2 bg-[#238636]/20 border border-[#238636] rounded-lg">
                      <p className="text-xs text-[#8b949e]">PNR</p>
                      <p className="font-mono font-bold text-[#238636] text-lg">{bookingDetails.pnr}</p>
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
                    <span className="text-[#8b949e]">Base Fare ({bookingDetails.passengers.length} passenger{bookingDetails.passengers.length > 1 ? 's' : ''})</span>
                    <span className="font-semibold">₹{Math.floor(bookingDetails.fare * 0.85)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b949e]">GST & Taxes</span>
                    <span className="font-semibold">₹{Math.floor(bookingDetails.fare * 0.10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b949e]">Booking Charges</span>
                    <span className="font-semibold">₹{Math.floor(bookingDetails.fare * 0.05)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#238636] flex justify-between items-center">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-3xl text-[#238636]">₹{bookingDetails.fare}</span>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-[#da3633]/10 border border-[#da3633]/30 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-[#da3633]">
                  <i className="fas fa-exclamation-triangle"></i>
                  Important Instructions
                </h4>
                <ul className="text-xs text-[#8b949e] space-y-1">
                  <li>• Please carry a valid ID proof during the journey</li>
                  <li>• Show this QR code to TTE for verification</li>
                  <li>• Report at the station 30 minutes before departure</li>
                  <li>• Keep this ticket until end of your journey</li>
                </ul>
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
                  onClick={() => {
                    setShowTicket(false);
                    window.location.href = '/';
                  }}
                  className="py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <i className="fas fa-home mr-2"></i>
                  Back to Home
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
