'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [currentService, setCurrentService] = useState('all');
  const [journeyOptions, setJourneyOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [currentPNRData, setCurrentPNRData] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [sortBy, setSortBy] = useState('price-low');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load PNR data from URL or sessionStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const pnr = urlParams.get('pnr');
      const serviceType = urlParams.get('type');
      
      const storedPNRData = sessionStorage.getItem('currentPNRData');
      
      if (storedPNRData) {
        const pnrData = JSON.parse(storedPNRData);
        setCurrentPNRData(pnrData);
        
        // Convert PNR connections to journey options
        if (pnrData.connections && pnrData.connections.length > 0) {
          const options = pnrData.connections.map((conn, index) => ({
            id: index + 1,
            type: conn.type.toLowerCase().replace(/\s+/g, '-'),
            icon: conn.icon,
            title: conn.type,
            provider: getProviderFromType(conn.type),
            price: getPriceEstimate(conn.type),
            duration: getDurationEstimate(conn.type),
            departure: getDepartureTime(conn.type),
            rating: (4.0 + Math.random()).toFixed(1),
            features: conn.description ? [conn.description, 'Available Now', 'Verified'] : ['Available', 'Verified'],
            route: pnrData.route || 'Station → Destination',
            availability: 'Available',
            description: conn.description
          }));
          setJourneyOptions(options);
        }
      } else if (pnr) {
        setCurrentPNRData({
          pnr: pnr,
          train: 'Train Details',
          route: 'Loading route information...',
          passengers: []
        });
      }

      if (serviceType) {
        setTimeout(() => switchService(serviceType.toLowerCase()), 500);
      }
    }
  }, []);

  const getProviderFromType = (type) => {
    const providers = {
      'Metro': 'Metro Railway',
      'Local Train': 'Indian Railways',
      'Cab': 'Ride Services',
      'Bus': 'Transport Corporation',
      'Auto': 'Local Operators',
      'Taxi': 'Cab Services'
    };
    return providers[type] || 'Service Provider';
  };

  const getPriceEstimate = (type) => {
    const prices = {
      'Metro': Math.floor(30 + Math.random() * 40),
      'Local Train': Math.floor(15 + Math.random() * 30),
      'Cab': Math.floor(150 + Math.random() * 200),
      'Bus': Math.floor(25 + Math.random() * 60),
      'Auto': Math.floor(40 + Math.random() * 80),
      'Taxi': Math.floor(200 + Math.random() * 150)
    };
    return prices[type] || Math.floor(50 + Math.random() * 100);
  };

  const getDurationEstimate = (type) => {
    const durations = {
      'Metro': '35 min',
      'Local Train': '40 min',
      'Cab': '45 min',
      'Bus': '55 min',
      'Auto': '30 min',
      'Taxi': '40 min'
    };
    return durations[type] || '45 min';
  };

  const getDepartureTime = (type) => {
    if (type.includes('Metro')) return 'Every 5 min';
    if (type.includes('Train')) return 'Check Schedule';
    if (type.includes('Cab') || type.includes('Auto') || type.includes('Taxi')) return 'On Demand';
    if (type.includes('Bus')) return 'Every 15 min';
    return 'Available';
  };

  useEffect(() => {
    filterAndSortOptions();
  }, [currentService, sortBy]);

  const switchService = (service) => {
    setCurrentService(service);
    setDisplayedCount(8);
  };

  const filterAndSortOptions = () => {
    let filtered = currentService === 'all' 
      ? journeyOptions 
      : journeyOptions.filter(opt => opt.type === currentService);

    // Sort options
    switch(sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'time-fast':
        filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredOptions(filtered);
  };

  const bookOption = (option) => {
    setSelectedOption(option);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    alert('🎉 Booking confirmed! You will receive confirmation details on your registered mobile number and email.');
    setShowBookingModal(false);
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
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
            Complete Your <span className="bg-gradient-to-r from-[#238636] to-[#2ea043] bg-clip-text text-transparent">Journey</span>
          </h1>
          <p className="text-lg text-[#8b949e] mb-8">Choose from 20+ verified transport options for your onward journey</p>

          {/* PNR Summary */}
          {currentPNRData && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Journey Summary</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#238636]/20 border border-[#238636] rounded-lg">
                  <i className="fas fa-ticket-alt text-[#238636]"></i>
                  <span className="font-mono">{currentPNRData.pnr}</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <i className="fas fa-train text-2xl text-[#238636]"></i>
                  <div>
                    <h4 className="font-semibold">{currentPNRData.train}</h4>
                    <p className="text-sm text-[#8b949e]">{currentPNRData.route}</p>
                  </div>
                </div>
                {currentPNRData.passengers && currentPNRData.passengers.length > 0 && (
                  <div className="flex gap-3">
                    <i className="fas fa-users text-2xl text-[#238636]"></i>
                    <div>
                      <h4 className="font-semibold">Passengers</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentPNRData.passengers.map((p, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-[#161b22] border border-[#30363d] rounded-md">
                            {p.name} ({p.age})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Service Selection */}
      <section className="py-8 bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Select Your Service Type</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', icon: 'fa-th-large', label: 'All Services' },
              { key: 'train', icon: 'fa-train', label: 'Trains' },
              { key: 'cab', icon: 'fa-car', label: 'Cabs' },
              { key: 'bus', icon: 'fa-bus', label: 'Buses' },
              { key: 'metro', icon: 'fa-subway', label: 'Metro' }
            ].map(service => (
              <button
                key={service.key}
                onClick={() => switchService(service.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentService === service.key
                    ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] text-white shadow-lg'
                    : 'bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:border-[#238636]'
                }`}
              >
                <i className={`fas ${service.icon}`}></i>
                {service.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Options */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Available Journey Options</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="time-fast">Fastest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {filteredOptions.slice(0, displayedCount).map((option, index) => (
              <div
                key={option.id}
                className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#238636] transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#238636]/20 rounded-lg flex items-center justify-center text-[#238636] text-xl">
                      <i className={`fas ${option.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold">{option.title}</h3>
                      <p className="text-xs text-[#8b949e]">{option.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#238636]">₹{option.price}</div>
                    <div className="text-xs text-[#8b949e]">per person</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-[#8b949e]">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock w-4"></i>
                    <span>{option.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-route w-4"></i>
                    <span className="truncate">{option.route}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star w-4 text-yellow-500"></i>
                    <span>{option.rating}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock w-4"></i>
                    <span>Dep: {option.departure}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {option.features.slice(0, 2).map((feature, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded-md text-[#8b949e]">
                      {feature}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => bookOption(option)}
                  className="w-full py-2 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <i className="fas fa-ticket-alt mr-2"></i>
                  Book Now
                </button>
              </div>
            ))}
          </div>

          {displayedCount < filteredOptions.length && (
            <div className="text-center">
              <button
                onClick={() => setDisplayedCount(prev => Math.min(prev + 8, filteredOptions.length))}
                className="px-8 py-3 bg-[#161b22] border border-[#30363d] text-white font-semibold rounded-xl hover:border-[#238636] transition-all"
              >
                <i className="fas fa-plus mr-2"></i>
                Load More ({filteredOptions.length - displayedCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-[#30363d] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#8b949e]">
          <p>&copy; 2025 Let's Connect. Made with ❤️ by IIT Patna Students.</p>
        </div>
      </footer>

      {/* Booking Modal */}
      {showBookingModal && selectedOption && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-[#0d1117] rounded-lg transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            <h3 className="text-2xl font-bold mb-6">Confirm Your Booking</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-2 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Service:</span>
                <span className="font-semibold">{selectedOption.title} ({selectedOption.provider})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Route:</span>
                <span className="font-semibold">{selectedOption.route}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Duration:</span>
                <span className="font-semibold">{selectedOption.duration}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Departure:</span>
                <span className="font-semibold">{selectedOption.departure}</span>
              </div>
              <div className="flex justify-between py-3 text-xl">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-[#238636]">₹{selectedOption.price}</span>
              </div>
            </div>

            {currentPNRData && (
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 mb-6">
                <h4 className="font-semibold mb-2">Passenger Information</h4>
                <p className="text-sm text-[#8b949e]"><strong>PNR:</strong> {currentPNRData.pnr}</p>
                <p className="text-sm text-[#8b949e]"><strong>Train:</strong> {currentPNRData.train}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 border border-[#30363d] text-white font-semibold rounded-xl hover:bg-[#0d1117] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <i className="fas fa-credit-card mr-2"></i>
                Proceed to Payment
              </button>
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
