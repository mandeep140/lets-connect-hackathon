'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Demo PNR data
const demoPNRs = [
  {
    pnr: '6223456789',
    train: '12003 Shatabdi Express',
    route: 'New Delhi → Amritsar',
    distance: '449 km',
    estimatedTime: '6h 15m',
    passengers: [
      { name: 'Arnab', age: 20, gender: 'Male', berth: 'A1/15' },
      { name: 'Sakshee', age: 19, gender: 'Female', berth: 'A1/16' }
    ],
    connections: [
      { type: 'Local Train', icon: 'fa-train', description: 'Connect to suburban lines' },
      { type: 'Metro', icon: 'fa-subway', description: 'Quick city transport' },
      { type: 'Cab', icon: 'fa-car', description: 'Door-to-door service' },
      { type: 'Bus', icon: 'fa-bus', description: 'Affordable city travel' }
    ]
  },
  {
    pnr: '6234567890',
    train: '12259 Duronto Express',
    route: 'Sealdah → New Delhi',
    distance: '1,472 km',
    estimatedTime: '16h 30m',
    passengers: [
      { name: 'Rahul Verma', age: 34, gender: 'Male', berth: 'B2/22' },
      { name: 'Kiran Kaur', age: 31, gender: 'Female', berth: 'B2/23' },
      { name: 'Ananya Sharma', age: 28, gender: 'Female', berth: 'B2/24' }
    ],
    connections: [
      { type: 'Metro', icon: 'fa-subway', description: 'Delhi Metro connectivity' },
      { type: 'Cab', icon: 'fa-taxi', description: 'Premium cab services' },
      { type: 'Bus', icon: 'fa-bus-alt', description: 'Inter-city buses' },
      { type: 'Local Train', icon: 'fa-train', description: 'Local railway network' }
    ]
  },
  {
    pnr: '6245678901',
    train: '12301 Howrah Rajdhani',
    route: 'Howrah → New Delhi',
    distance: '1,441 km',
    estimatedTime: '17h 45m',
    passengers: [
      { name: 'Neha Das', age: 27, gender: 'Female', berth: 'A1/8' },
      { name: 'Manish Malik', age: 29, gender: 'Male', berth: 'A1/9' },
      { name: 'Priya Singh', age: 26, gender: 'Female', berth: 'A1/10' }
    ],
    connections: [
      { type: 'Local Train', icon: 'fa-train', description: 'Local EMU services' },
      { type: 'Metro', icon: 'fa-subway', description: 'Kolkata Metro' },
      { type: 'Cab', icon: 'fa-car', description: 'App-based cabs' },
      { type: 'Bus', icon: 'fa-bus', description: 'City bus services' }
    ]
  },
  {
    pnr: '6256789012',
    train: '12951 Mumbai Rajdhani',
    route: 'Mumbai CST → New Delhi',
    distance: '1,384 km',
    estimatedTime: '15h 50m',
    passengers: [
      { name: 'Vikram Bose', age: 45, gender: 'Male', berth: 'A2/12' },
      { name: 'Deepika Iyer', age: 42, gender: 'Female', berth: 'A2/13' }
    ],
    connections: [
      { type: 'Metro', icon: 'fa-subway', description: 'Airport Metro Line' },
      { type: 'Cab', icon: 'fa-taxi', description: 'Outstation cabs' },
      { type: 'Bus', icon: 'fa-bus', description: 'Luxury bus services' },
      { type: 'Local Train', icon: 'fa-train', description: 'Suburban trains' }
    ]
  },
  {
    pnr: '6267890123',
    train: '22415 Vande Bharat Express',
    route: 'New Delhi → Varanasi',
    distance: '759 km',
    estimatedTime: '8h 10m',
    passengers: [
      { name: 'Rajesh Kumar', age: 38, gender: 'Male', berth: 'C1/45' },
      { name: 'Sunita Devi', age: 35, gender: 'Female', berth: 'C1/46' }
    ],
    connections: [
      { type: 'Auto', icon: 'fa-motorcycle', description: 'Shared auto-rickshaw' },
      { type: 'Cab', icon: 'fa-car', description: 'City cabs' },
      { type: 'Bus', icon: 'fa-bus', description: 'State transport' },
      { type: 'Local Train', icon: 'fa-train', description: 'Local connections' }
    ]
  },
  {
    pnr: '6278901234',
    train: '12626 Kerala Express',
    route: 'New Delhi → Thiruvananthapuram',
    distance: '3,149 km',
    estimatedTime: '48h 20m',
    passengers: [
      { name: 'Arun Nair', age: 41, gender: 'Male', berth: 'S4/18' },
      { name: 'Lakshmi Menon', age: 39, gender: 'Female', berth: 'S4/19' },
      { name: 'Rohan Nair', age: 16, gender: 'Male', berth: 'S4/20' }
    ],
    connections: [
      { type: 'Bus', icon: 'fa-bus', description: 'KSRTC services' },
      { type: 'Cab', icon: 'fa-taxi', description: 'Outstation travel' },
      { type: 'Auto', icon: 'fa-motorcycle', description: 'Local auto services' },
      { type: 'Ferry', icon: 'fa-ship', description: 'Backwater transport' }
    ]
  }
];

export default function Home() {
  const [pnrInput, setPnrInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pnrMessage, setPnrMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentPNRData, setCurrentPNRData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    age: '',
    phone: '',
    email: '',
    preferences: 'economy'
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePNRInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPnrInput(value);

    if (value.length === 0) {
      setPnrMessage('');
    } else if (value.length < 10) {
      setPnrMessage(`Enter ${10 - value.length} more digits`);
      setMessageType('info');
    } else if (value.length === 10) {
      const pnrExists = demoPNRs.find(p => p.pnr === value);
      if (pnrExists) {
        setPnrMessage('✓ Valid demo PNR found!');
        setMessageType('success');
      } else {
        setPnrMessage('PNR not found in demo data');
        setMessageType('error');
      }
    }
  };

  const handleDemoPNRClick = (pnr) => {
    setPnrInput(pnr);
    setTimeout(() => searchPNR(pnr), 300);
  };

  const searchPNR = (pnr = pnrInput) => {
    if (isSearching) return;

    if (!pnr || pnr.length !== 10) {
      setPnrMessage('PNR must be exactly 10 digits');
      setMessageType('error');
      return;
    }

    const pnrData = demoPNRs.find(p => p.pnr === pnr);

    if (!pnrData) {
      setPnrMessage('PNR not found in demo data. Try one of the demo PNRs below.');
      setMessageType('error');
      return;
    }

    setIsSearching(true);
    setPnrMessage('');

    setTimeout(() => {
      setCurrentPNRData(pnrData);
      setPnrMessage('✓ PNR found successfully!');
      setMessageType('success');
      setIsSearching(false);
      setShowResults(true);
      
      setTimeout(() => {
        document.getElementById('journey-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }, 2000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setShowWelcome(true);
    setTimeout(() => {
      setShowRegisterModal(false);
      setShowWelcome(false);
      setRegisterForm({ fullName: '', age: '', phone: '', email: '', preferences: 'economy' });
    }, 4000);
  };

  const handleConnectionBooking = (connection) => {
    if (confirm(`🚀 Ready to book ${connection.type}?\n\nService: ${connection.description}\n\nYou'll be redirected to our booking platform.`)) {
      if (currentPNRData) {
        sessionStorage.setItem('currentPNRData', JSON.stringify(currentPNRData));
      }
      window.location.href = `/booking?type=${encodeURIComponent(connection.type)}&service=${encodeURIComponent(connection.description)}&pnr=${currentPNRData?.pnr || ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(35,134,54,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(31,111,235,0.1)_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,_rgba(218,54,51,0.1)_0%,_transparent_50%)]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-[rgba(13,17,23,0.95)] backdrop-blur-md border-b border-[#30363d] z-50">
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[70px]">
          <div className="flex items-center gap-2 text-xl font-bold">
            <i className="fas fa-route text-[#238636] text-2xl"></i>
            <span>Let's Connect</span>
          </div>

          <ul className={`md:flex md:gap-6 md:items-center ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex-row flex-col absolute md:relative top-[70px] md:top-0 left-0 w-full md:w-auto bg-[#161b22] md:bg-transparent p-4 md:p-0`}>
            <li><a href="#home" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Home</a></li>
            <li><a href="#pnr-section" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">PNR Search</a></li>
            <li><a href="#features" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Features</a></li>
            <li><a href="#about" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">About</a></li>
            <li><a href="#pricing" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Pricing</a></li>
            <li><a href="#future" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Future</a></li>
            <li><a href="#contact" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Contact</a></li>
          </ul>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#8b949e] hover:bg-[#161b22] transition-all">
              <i className="fas fa-user-plus"></i>
              Register
            </button>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold hover:shadow-lg transition-all">
              <i className="fas fa-shield-check"></i>
              Verify Now
            </button>
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

      {/* Hero Section */}
      <section id="home" className="pt-[100px] min-h-screen flex items-center relative">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-full text-sm">
              <i className="fas fa-train text-[#238636]"></i>
              <span>Revolutionizing Indian Railways</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Connect Your Journey,
              <span className="bg-gradient-to-r from-[#238636] to-[#2ea043] bg-clip-text text-transparent"> Seamlessly</span>
            </h1>

            <p className="text-lg text-[#8b949e]">
              Skip the queues, connect every mile. From reserved trains to local connections, 
              metro rides to cab bookings - all in one intelligent platform.
            </p>

            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#238636]">4M+</div>
                <div className="text-sm text-[#8b949e]">Daily Passengers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#238636]">50+</div>
                <div className="text-sm text-[#8b949e]">Cities Connected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#238636]">24/7</div>
                <div className="text-sm text-[#8b949e]">Support Available</div>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="#pnr-section" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold hover:shadow-lg hover:-translate-y-1 transition-all">
                <i className="fas fa-rocket"></i>
                Start Journey
              </a>
              <a href="#features" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#238636] text-[#238636] hover:bg-[#238636] hover:text-white font-semibold transition-all">
                <i className="fas fa-play"></i>
                Learn More
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-[400px] relative">
              {/* Animated train visual placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[200px] text-[#238636] opacity-20">
                  <i className="fas fa-train"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PNR Search Section */}
      <section id="pnr-section" className="py-20 bg-[#161b22]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Enter Your PNR</h2>
            <p className="text-[#8b949e]">
              Enter your 10-digit PNR to unlock seamless journey connections. Try our demo PNRs to explore features.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-8 shadow-xl">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]"></i>
                <input
                  type="text"
                  value={pnrInput}
                  onChange={handlePNRInput}
                  onKeyPress={(e) => e.key === 'Enter' && !isSearching && searchPNR()}
                  placeholder="Enter 10-digit PNR (e.g., 6223456789)"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-4 bg-[#161b22] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] transition-all"
                />
              </div>
              <button
                onClick={() => searchPNR()}
                disabled={isSearching}
                className="px-8 py-4 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSearching ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Searching...</>
                ) : (
                  <><i className="fas fa-arrow-right mr-2"></i>Search</>
                )}
              </button>
            </div>

            {pnrMessage && (
              <div className={`text-sm mt-2 ${messageType === 'success' ? 'text-[#2ea043]' : messageType === 'error' ? 'text-[#da3633]' : 'text-[#8b949e]'}`}>
                {pnrMessage}
              </div>
            )}
          </div>

          {/* Demo PNRs */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
              <i className="fas fa-star text-[#238636]"></i>
              Try Demo PNRs
            </h3>
            <p className="text-center text-[#8b949e] mb-6">Click any card below to instantly test our platform</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {demoPNRs.map((pnr, index) => (
                <div
                  key={pnr.pnr}
                  onClick={() => handleDemoPNRClick(pnr.pnr)}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 cursor-pointer hover:border-[#238636] hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h4 className="font-bold text-[#238636] mb-2">{pnr.pnr}</h4>
                  <p className="font-semibold text-sm mb-1">{pnr.train}</p>
                  <p className="text-sm text-[#8b949e] mb-2">{pnr.route}</p>
                  <p className="text-xs text-[#6e7681]">
                    <i className="fas fa-route mr-1"></i>{pnr.distance} • 
                    <i className="fas fa-users ml-2 mr-1"></i>{pnr.passengers.length} passenger{pnr.passengers.length > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Results */}
      {showResults && currentPNRData && (
        <section id="journey-results" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-2xl p-8 mb-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <i className="fas fa-check-circle text-5xl"></i>
                <div>
                  <h3 className="text-2xl font-bold">PNR Found Successfully!</h3>
                  <p>We've got you covered. Let us handle the virtual queues and bring your next tickets right to your seat.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4">{currentPNRData.train}</h3>
              <div className="flex flex-wrap gap-4 text-[#8b949e] mb-6">
                <span>{currentPNRData.route}</span>
                <span>{currentPNRData.distance}</span>
                <span>{currentPNRData.estimatedTime}</span>
              </div>

              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-users text-[#238636]"></i>
                Passengers
              </h4>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {currentPNRData.passengers.map((passenger, index) => (
                  <div key={index} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                    <h5 className="font-bold mb-2">{passenger.name}</h5>
                    <div className="text-sm text-[#8b949e] space-y-1">
                      <div><i className="fas fa-birthday-cake mr-2"></i>Age: {passenger.age}</div>
                      <div>
                        <i className={`fas ${passenger.gender === 'Male' ? 'fa-mars' : 'fa-venus'} mr-2`}></i>
                        {passenger.gender}
                      </div>
                      <div><i className="fas fa-bed mr-2"></i>Berth: {passenger.berth}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-route text-[#238636]"></i>
                Available Connections
              </h4>
              <p className="text-[#8b949e] mb-6">Choose your next mode of transport</p>
              <div className="grid md:grid-cols-4 gap-4">
                {currentPNRData.connections.map((connection, index) => (
                  <div
                    key={index}
                    onClick={() => handleConnectionBooking(connection)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg transition-all text-center"
                  >
                    <div className="text-4xl text-[#238636] mb-3">
                      <i className={`fas ${connection.icon}`}></i>
                    </div>
                    <h4 className="font-bold mb-2">{connection.type}</h4>
                    <p className="text-sm text-[#8b949e]">{connection.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Let's Connect?</h2>
            <p className="text-[#8b949e]">
              Revolutionizing Indian travel with cutting-edge technology and user-first design.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'fa-ticket-alt', title: 'PNR-Based Authentication', desc: 'Skip geo-fencing hassles. Book unreserved tickets instantly using your existing PNR verification.' },
              { icon: 'fa-route', title: 'Multi-Modal Integration', desc: 'Seamlessly connect trains, metros, cabs, and buses without switching between multiple apps.' },
              { icon: 'fa-satellite-dish', title: 'Real-Time Tracking', desc: 'Live train location, platform updates, and intelligent ETA calculations powered by AI.' },
              { icon: 'fa-shield-alt', title: 'Secure & Private', desc: 'End-to-end encryption with Aadhaar, PAN, and DigiLocker integration for complete security.' },
              { icon: 'fa-users', title: 'Family-Friendly', desc: 'Designed for families and group travelers with shared booking and coordinated journeys.' },
              { icon: 'fa-brain', title: 'AI-Powered Suggestions', desc: 'Smart recommendations based on your travel patterns, preferences, and real-time conditions.' }
            ].map((feature, index) => (
              <div key={index} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 hover:border-[#238636] transition-all">
                <div className="text-4xl text-[#238636] mb-4">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#8b949e]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Built by Students, For India</h2>
              <p className="text-[#8b949e] mb-6">
                We are a passionate team of IITians from IIT Patna, driven by a single mission: 
                to make travel smooth and accessible for every Indian. Our startup was born from 
                experiencing the daily struggles of millions of passengers navigating India's 
                complex transport ecosystem.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#238636]">2</div>
                  <div className="text-sm text-[#8b949e]">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#238636]">2</div>
                  <div className="text-sm text-[#8b949e]">Days Development</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#238636]">10K+</div>
                  <div className="text-sm text-[#8b949e]">Lines of Code</div>
                </div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center">
              <i className="fas fa-users-cog text-[100px] text-[#238636] mb-4"></i>
              <h3 className="text-2xl font-bold mb-4">IIT Patna Team</h3>
              <p className="text-[#8b949e]">
                Transforming India's travel experience with cutting-edge technology and innovative solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-[#8b949e]">
              Flexible pricing options to suit every traveler's needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Basic', price: '0', features: ['PNR Search & Verification', 'Basic Journey Planning', '5 Searches per day', 'Email Support'], featured: false },
              { name: 'Premium', price: '199', features: ['Everything in Basic', 'Unlimited Searches', 'Real-time Notifications', 'Priority Booking', '24/7 Phone Support'], featured: true },
              { name: 'Enterprise', price: '999', features: ['Everything in Premium', 'API Access', 'Custom Integration', 'Dedicated Support', 'White-label Solution'], featured: false }
            ].map((plan, index) => (
              <div key={index} className={`bg-[#0d1117] border ${plan.featured ? 'border-[#238636]' : 'border-[#30363d]'} rounded-xl p-8 relative ${plan.featured ? 'scale-105' : ''}`}>
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#238636] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-[#8b949e]">₹</span>
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-[#8b949e]">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <i className="fas fa-check text-[#238636] mt-1"></i>
                      <span className="text-[#8b949e]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.featured ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] text-white hover:shadow-lg' : 'border border-[#238636] text-[#238636] hover:bg-[#238636] hover:text-white'}`}>
                  {plan.name === 'Basic' ? 'Get Started' : plan.name === 'Premium' ? 'Choose Premium' : 'Contact Sales'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section id="future" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Future Roadmap</h2>
            <p className="text-[#8b949e]">
              Exciting features and expansions coming to Let's Connect.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { quarter: 'Q2 2025', icon: 'fa-brain', title: 'AI-Powered Journey Optimization', desc: 'Smart route recommendations based on real-time traffic, weather, and crowd data using machine learning algorithms.' },
              { quarter: 'Q3 2025', icon: 'fa-globe', title: 'Multi-Language Support', desc: 'Full localization in 8 Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, and Malayalam.' },
              { quarter: 'Q4 2025', icon: 'fa-mobile-alt', title: 'Offline Mode & PWA', desc: 'Download journey plans, access tickets offline, and enjoy a native app experience with our Progressive Web App.' },
              { quarter: 'Q1 2026', icon: 'fa-robot', title: 'Voice Assistant Integration', desc: 'Book tickets, check PNR status, and get journey updates through voice commands in multiple Indian languages.' }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-xl flex items-center justify-center text-2xl">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.quarter}</h3>
                  <h4 className="text-lg font-semibold text-[#238636] mb-2">{item.title}</h4>
                  <p className="text-[#8b949e]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-[#8b949e]">
              Have questions or suggestions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                { icon: 'fa-map-marker-alt', title: 'Visit Us', content: 'IIT Patna\nBihta, Patna - 801106\nBihar, India' },
                { icon: 'fa-phone', title: 'Call Us', content: '+91 12345 67890\n+91 98765 43210' },
                { icon: 'fa-envelope', title: 'Email Us', content: 'support@letsconnect.in\nhello@letsconnect.in' }
              ].map((item, index) => (
                <div key={index} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 flex gap-4">
                  <div className="text-3xl text-[#238636]">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-[#8b949e] whitespace-pre-line">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-8">
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                    <input type="email" className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Subject</label>
                  <select className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]">
                    <option>Choose a subject</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Feature Request</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea rows={6} className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]" placeholder="Tell us how we can help you..."></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-[#30363d] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <i className="fas fa-route text-[#238636]"></i>
                <span>Let's Connect</span>
              </div>
              <p className="text-[#8b949e] mb-4">
                Revolutionizing Indian travel with seamless journey connections and intelligent transport solutions.
              </p>
              <div className="flex gap-3">
                {['fa-twitter', 'fa-linkedin', 'fa-github', 'fa-instagram'].map((icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-[#161b22] rounded-lg flex items-center justify-center hover:bg-[#238636] transition-all">
                    <i className={`fab ${icon}`}></i>
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Quick Links', links: ['Home', 'PNR Search', 'Features', 'Pricing'] },
              { title: 'Services', links: ['Train Booking', 'Local Transit', 'Cab Services', 'Bus Booking'] },
              { title: 'Support', links: ['Contact Us', 'Help Center', 'Privacy Policy', 'Terms of Service'] }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-[#8b949e] hover:text-[#238636] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#30363d] pt-8 text-center text-[#8b949e]">
            <p>&copy; 2025 Let's Connect. Made with ❤️ by IIT Patna Students.</p>
          </div>
        </div>
      </footer>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-[#0d1117] rounded-lg transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            {!showWelcome ? (
              <>
                <h3 className="text-2xl font-bold mb-6">Join Let's Connect</h3>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Age</label>
                    <input
                      type="number"
                      value={registerForm.age}
                      onChange={(e) => setRegisterForm({...registerForm, age: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                    <i className="fas fa-user-plus mr-2"></i>
                    Register Now
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-[80px] text-[#238636] mb-4"></i>
                <h3 className="text-2xl font-bold mb-2">Welcome {registerForm.fullName}!</h3>
                <p className="text-[#8b949e] mb-6">Travel with us, it's worth it!</p>
                <button
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowWelcome(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Start Your Journey
                </button>
              </div>
            )}
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