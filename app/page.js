'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status, update } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const [demoPNRs, setDemoPNRs] = useState([]);
  const [pnrInput, setPnrInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pnrMessage, setPnrMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentPNRData, setCurrentPNRData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    preferences: 'economy'
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Generate demo PNRs
  useEffect(() => {
    // Generate 5 random demo PNRs
    const generateDemoPNRs = () => {
      const pnrs = [];
      for (let i = 0; i < 5; i++) {
        pnrs.push({
          pnr: Math.random().toString().slice(2, 12)
        });
      }
      setDemoPNRs(pnrs);
    };
    
    generateDemoPNRs();
  }, []);

  // Fetch user details from database when session exists
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.email && status === 'authenticated') {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUserDetails(data.user);
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [session?.user?.email, status]); // Removed 'update' from dependencies

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.relative')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  const handlePNRInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPnrInput(value);

    if (value.length === 0) {
      setPnrMessage('');
    } else if (value.length < 10) {
      setPnrMessage(`Enter ${10 - value.length} more digits`);
      setMessageType('info');
    } else if (value.length === 10) {
      setPnrMessage('✓ PNR ready to search');
      setMessageType('success');
    }
  };

  const handleDemoPNRClick = (pnr) => {
    setPnrInput(pnr);
    setTimeout(() => searchPNR(pnr), 300);
  };

  const searchPNR = async (pnr = pnrInput) => {
    if (isSearching) return;

    if (!pnr || pnr.length !== 10) {
      setPnrMessage('PNR must be exactly 10 digits');
      setMessageType('error');
      return;
    }

    setIsSearching(true);
    setPnrMessage('Searching PNR...');
    setMessageType('info');

    try {
      const response = await fetch(`/api/pnr/${pnr}`);
      const data = await response.json();

      if (response.ok) {
        setCurrentPNRData(data);
        setPnrMessage('✓ PNR found successfully!');
        setMessageType('success');
        setShowResults(true);
        setSelectedPassengers([]);
        
        setTimeout(() => {
          document.getElementById('journey-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      } else {
        setPnrMessage('PNR not found. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error searching PNR:', error);
      setPnrMessage('Error searching PNR. Please try again.');
      setMessageType('error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });

      const data = await response.json();

      if (data.success) {
        setShowWelcome(true);
        setTimeout(() => {
          setShowRegisterModal(false);
          setShowWelcome(false);
          setShowLoginModal(true);
          setRegisterForm({ fullName: '', age: '', phone: '', email: '', password: '', preferences: 'economy' });
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false
      });

      if (result?.ok) {
        setShowLoginModal(false);
        setLoginForm({ email: '', password: '' });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleConnectionBooking = (connection) => {
    if (selectedPassengers.length === 0) {
      return;
    }

    const passengerNames = selectedPassengers.map(index => currentPNRData.passengers[index].name).join(', ');
    
    if (currentPNRData) {
      const bookingData = {
        ...currentPNRData,
        selectedPassengers: selectedPassengers.map(index => currentPNRData.passengers[index])
      };
      sessionStorage.setItem('currentPNRData', JSON.stringify(bookingData));
    }
    window.location.href = `/booking?type=${encodeURIComponent(connection.type)}&service=${encodeURIComponent(connection.description)}&pnr=${currentPNRData?.pnr || ''}&passengers=${selectedPassengers.length}`;
  };

  const togglePassengerSelection = (index) => {
    setSelectedPassengers(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const selectAllPassengers = () => {
    if (selectedPassengers.length === currentPNRData.passengers.length) {
      setSelectedPassengers([]);
    } else {
      setSelectedPassengers(currentPNRData.passengers.map((_, index) => index));
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
      <header className="fixed top-0 w-full bg-[rgba(13,17,23,0.95)] backdrop-blur-md border-b border-[#30363d] z-50 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[70px]">
          <div className="flex items-center gap-2 text-xl font-bold">
            <i className="fas fa-route text-[#238636] text-2xl"></i>
            <span>Let's Connect</span>
          </div>

          <ul className={`md:flex md:gap-6 md:items-center ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex-row flex-col absolute md:relative top-[70px] md:top-0 left-0 w-full md:w-auto bg-[#161b22] md:bg-transparent p-4 md:p-0`}>
            <li><a href="#home" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Home</a></li>
            <li><a href="#pnr-section" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">PNR Search</a></li>
            {session?.user && (
              <li><Link href="/history" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all flex items-center gap-2"><i className="fas fa-history"></i>My Bookings</Link></li>
            )}
            <li><a href="#features" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Features</a></li>
            <li><a href="#about" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">About</a></li>
            {session?.user && (
              <li><Link href="/admin" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all flex items-center gap-2"><i className="fas fa-cog"></i>Admin</Link></li>
            )}
            <li><a href="#contact" className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[rgba(35,134,54,0.1)] px-4 py-2 rounded-lg transition-all">Contact</a></li>
          </ul>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#238636] transition-all"
                  >
                    <i className={`fas fa-user-circle ${(userDetails?.isVerified || session.user.isVerified) ? 'text-[#238636]' : 'text-[#8b949e]'}`}></i>
                    <span className="text-sm">{session.user.name}</span>
                    {(userDetails?.isVerified || session.user.isVerified) && (
                      <i className="fas fa-badge-check text-[#238636] ml-1" title="Verified User"></i>
                    )}
                    <i className={`fas fa-chevron-down text-xs transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}></i>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-[#30363d]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full ${(userDetails?.isVerified || session.user.isVerified) ? 'bg-[#238636]' : 'bg-[#8b949e]'} flex items-center justify-center text-white text-xl`}>
                            {session.user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold flex items-center gap-2">
                              {session.user.name}
                              {(userDetails?.isVerified || session.user.isVerified) && (
                                <i className="fas fa-badge-check text-[#238636]" title="Verified User"></i>
                              )}
                            </div>
                            <div className="text-xs text-[#8b949e]">{session.user.email}</div>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-2 mb-3 text-sm">
                          <div className="flex items-center gap-2 text-[#8b949e]">
                            <i className="fas fa-phone w-4"></i>
                            <span>{userDetails?.phone || session.user.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#8b949e]">
                            <i className="fas fa-birthday-cake w-4"></i>
                            <span>Age: {userDetails?.age || session.user.age || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#8b949e]">
                            <i className="fas fa-tag w-4"></i>
                            <span className="capitalize">{userDetails?.preferences || session.user.preferences || 'Standard'} Preference</span>
                          </div>
                        </div>

                        {(userDetails?.isVerified || session.user.isVerified) ? (
                          <div className="px-3 py-2 bg-[#238636]/10 border border-[#238636]/30 rounded-lg text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#238636]">
                              <i className="fas fa-shield-check"></i>
                              <span>Verified via {userDetails?.verificationMethod || 'Document'}</span>
                            </div>
                            {userDetails?.verifiedAt && (
                              <span className="text-[#8b949e]">
                                {new Date(userDetails.verifiedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Link
                            href="/verify"
                            onClick={() => setShowProfileDropdown(false)}
                            className="block w-full px-3 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-center rounded-lg text-sm font-semibold transition-all"
                          >
                            <i className="fas fa-shield-check mr-2"></i>
                            Verify Account
                          </Link>
                        )}
                      </div>
                      
                      <div className="p-2">
                        <Link
                          href="/history"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0d1117] transition-all"
                        >
                          <i className="fas fa-history w-5 text-[#8b949e]"></i>
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0d1117] transition-all"
                        >
                          <i className="fas fa-cog w-5 text-[#8b949e]"></i>
                          <span>Admin Panel</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0d1117] text-[#da3633] transition-all"
                        >
                          <i className="fas fa-sign-out-alt w-5"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {!(userDetails?.isVerified || session.user.isVerified) && (
                  <Link href="/verify" className="md:hidden items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200">
                    <i className="fas fa-shield-check"></i>
                    Verify Now
                  </Link>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#8b949e] hover:bg-[#161b22] transition-all">
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </button>
                <button onClick={() => setShowRegisterModal(true)} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200">
                  <i className="fas fa-user-plus"></i>
                  Register
                </button>
              </>
            )}
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
          <div className="space-y-6">
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

          <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-8 shadow-xl transition-all duration-300">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e] transition-colors duration-200"></i>
                <input
                  type="text"
                  value={pnrInput}
                  onChange={handlePNRInput}
                  onKeyPress={(e) => e.key === 'Enter' && !isSearching && searchPNR()}
                  placeholder="Enter 10-digit PNR (e.g., 6223456789)"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-4 bg-[#161b22] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                />
              </div>
              <button
                onClick={() => searchPNR()}
                disabled={isSearching}
                className="px-8 py-4 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Searching...</>
                ) : (
                  <><i className="fas fa-arrow-right mr-2"></i>Search</>
                )}
              </button>
            </div>

            {pnrMessage && (
              <div className={`text-sm mt-2 animate-fade-in ${messageType === 'success' ? 'text-[#2ea043]' : messageType === 'error' ? 'text-[#da3633]' : 'text-[#8b949e]'}`}>
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
              {demoPNRs.map((pnr) => (
                <div
                  key={pnr._id || pnr.pnr}
                  onClick={() => handleDemoPNRClick(pnr.pnr)}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200"
                >
                  <h4 className="font-bold text-[#238636] mb-2">{pnr.pnr}</h4>
                  <p className="font-semibold text-sm mb-1">{pnr.train}</p>
                  <p className="text-sm text-[#8b949e] mb-2">{pnr.route}</p>
                  <p className="text-xs text-[#6e7681]">
                    <i className="fas fa-route mr-1"></i>{pnr.distance} • 
                    <i className="fas fa-users ml-2 mr-1"></i>{pnr.passengers?.length || 0} passenger{pnr.passengers?.length > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Results */}
      {showResults && currentPNRData && (
        <section id="journey-results" className="py-20 animate-fade-in">
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
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{currentPNRData.train_name}</h3>
                  <p className="text-[#8b949e] font-mono">Train #{currentPNRData.train_number}</p>
                </div>
                <div className="text-right">
                  <div className="px-4 py-2 bg-[#238636]/20 border border-[#238636] rounded-lg">
                    <span className="text-sm text-[#8b949e]">PNR</span>
                    <p className="font-mono font-bold text-[#238636]">{currentPNRData.pnr}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                    <i className="fas fa-map-marker-alt"></i>
                    <span className="text-xs">From</span>
                  </div>
                  <p className="font-bold text-lg">{currentPNRData.from_station}</p>
                </div>
                
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                    <i className="fas fa-map-marker-alt"></i>
                    <span className="text-xs">To</span>
                  </div>
                  <p className="font-bold text-lg">{currentPNRData.to_station}</p>
                </div>
                
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                    <i className="fas fa-clock"></i>
                    <span className="text-xs">Arrival Time</span>
                  </div>
                  <p className="font-bold text-lg">{currentPNRData.boarding_time}</p>
                </div>
                
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                    <i className="fas fa-calendar"></i>
                    <span className="text-xs">Journey Date</span>
                  </div>
                  <p className="font-bold text-sm">{currentPNRData.journey_date}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <i className="fas fa-route text-[#238636] text-xl"></i>
                  <div>
                    <p className="text-xs text-[#8b949e]">Distance</p>
                    <p className="font-semibold">{currentPNRData.distance}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <i className="fas fa-hourglass-half text-[#1f6feb] text-xl"></i>
                  <div>
                    <p className="text-xs text-[#8b949e]">Duration</p>
                    <p className="font-semibold">{currentPNRData.journey_duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <i className="fas fa-chair text-[#da3633] text-xl"></i>
                  <div>
                    <p className="text-xs text-[#8b949e]">Class</p>
                    <p className="font-semibold">{currentPNRData.class}</p>
                  </div>
                </div>
              </div>

              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-users text-[#238636]"></i>
                Passengers
                <button
                  onClick={selectAllPassengers}
                  className="ml-auto text-sm px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#238636] hover:bg-[#161b22] active:scale-95 transition-all duration-200"
                >
                  {selectedPassengers.length === currentPNRData.passengers.length ? (
                    <><i className="fas fa-times mr-2"></i>Deselect All</>
                  ) : (
                    <><i className="fas fa-check-double mr-2"></i>Select All</>
                  )}
                </button>
              </h4>
              <p className="text-[#8b949e] mb-4 text-sm">
                {selectedPassengers.length > 0 ? (
                  <span className="text-[#238636]">
                    <i className="fas fa-check-circle mr-2"></i>
                    {selectedPassengers.length} passenger{selectedPassengers.length > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span>Select passengers to book connections</span>
                )}
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {currentPNRData.passengers.map((passenger, index) => (
                  <div
                    key={index}
                    onClick={() => togglePassengerSelection(index)}
                    className={`bg-[#0d1117] border ${selectedPassengers.includes(index) ? 'border-[#238636] shadow-lg shadow-[#238636]/30' : 'border-[#30363d]'} rounded-xl p-4 cursor-pointer hover:border-[#238636] hover:-translate-y-1 active:scale-98 transition-all duration-200 relative`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 rounded border-2 ${selectedPassengers.includes(index) ? 'bg-[#238636] border-[#238636] scale-110' : 'border-[#30363d]'} flex items-center justify-center transition-all duration-200 hover:scale-110`}>
                        {selectedPassengers.includes(index) && (
                          <i className="fas fa-check text-white text-xs"></i>
                        )}
                      </div>
                    </div>
                    <h5 className="font-bold mb-2 pr-8">{passenger.name}</h5>
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
              <p className="text-[#8b949e] mb-6">
                {selectedPassengers.length > 0 ? (
                  <span>Choose your next mode of transport for selected passengers</span>
                ) : (
                  <span className="text-[#da3633]">⚠️ Please select at least one passenger first</span>
                )}
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                {(() => {
                  // Filter connections based on train type
                  let availableConnections = [];
                  const trainType = currentPNRData.train_type;
                  
                  if (trainType === 'Metro') {
                    availableConnections = [
                      { type: 'Metro', icon: 'fa-subway', description: 'Quick metro connections' }
                    ];
                  } else if (trainType === 'Local Train') {
                    availableConnections = [
                      { type: 'Local Train', icon: 'fa-train', description: 'Local train services' }
                    ];
                  } else {
                    // Express, Mail, Shatabdi trains can connect to both
                    availableConnections = [
                      { type: 'Metro', icon: 'fa-subway', description: 'Quick metro connections' },
                      { type: 'Local Train', icon: 'fa-train', description: 'Local train services' }
                    ];
                  }
                  
                  return availableConnections.map((connection, index) => (
                    <div
                      key={index}
                      onClick={() => handleConnectionBooking(connection)}
                      className={`bg-[#0d1117] border border-[#30363d] rounded-xl p-6 ${selectedPassengers.length > 0 ? 'cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/30 hover:-translate-y-2 active:scale-95' : 'opacity-50 cursor-not-allowed'} transition-all duration-200 text-center`}
                    >
                      <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 hover:scale-110">
                        <i className={`fas ${connection.icon}`}></i>
                      </div>
                      <h4 className="font-bold mb-2">{connection.type}</h4>
                      <p className="text-sm text-[#8b949e]">{connection.description}</p>
                    </div>
                  ));
                })()}
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
              <div 
                key={index}
                className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="text-4xl text-[#238636] mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
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
              
              {/* <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#238636]">5</div>
                  <div className="text-sm text-[#8b949e]">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#238636]">1</div>
                  <div className="text-sm text-[#8b949e]">Days Development</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#238636]">10K+</div>
                  <div className="text-sm text-[#8b949e]">Lines of Code</div>
                </div>
              </div> */}
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center">
              <i className="fas fa-users-cog text-[100px] text-[#238636] mb-4"></i>
              <h3 className="text-2xl font-bold mb-4">IIT Patna MindMesh Team</h3>
              <p className="text-[#8b949e]">
                Transforming India's travel experience with cutting-edge technology and innovative solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20 bg-[#161b22]">
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
              <div 
                key={index}
                className={`bg-[#0d1117] border ${plan.featured ? 'border-[#238636] shadow-lg shadow-[#238636]/20' : 'border-[#30363d]'} rounded-xl p-8 relative ${plan.featured ? 'scale-105' : ''} hover:-translate-y-3 hover:shadow-xl transition-all duration-300`}
              >
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
                <button 
                  className={`w-full py-3 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-200 ${plan.featured ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] text-white hover:shadow-lg hover:shadow-[#238636]/50' : 'border border-[#238636] text-[#238636] hover:bg-[#238636] hover:text-white'}`}
                >
                  {plan.name === 'Basic' ? 'Get Started' : plan.name === 'Premium' ? 'Choose Premium' : 'Contact Sales'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section> */}

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
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowRegisterModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-8 relative animate-scale-in max-h-[90vh] overflow-y-auto"
          >
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
                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Age</label>
                      <input
                        type="number"
                        value={registerForm.age}
                        onChange={(e) => setRegisterForm({...registerForm, age: e.target.value})}
                        required
                        min={1}
                        max={120}
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
                        pattern="[0-9]{10}"
                        placeholder="10 digits"
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Travel Preference</label>
                    <select
                      value={registerForm.preferences}
                      onChange={(e) => setRegisterForm({...registerForm, preferences: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    >
                      <option value="economy">Economy - Budget-friendly travel</option>
                      <option value="premium">Premium - Comfortable journey</option>
                      <option value="luxury">Luxury - First-class experience</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Registering...</>
                    ) : (
                      <><i className="fas fa-user-plus mr-2"></i>Register Now</>
                    )}
                  </button>
                  <p className="text-center text-sm text-[#8b949e]">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                      }}
                      className="text-[#238636] hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-[80px] text-[#238636] mb-4 animate-bounce"></i>
                <h3 className="text-2xl font-bold mb-2">Welcome {registerForm.fullName}!</h3>
                <p className="text-[#8b949e] mb-6">Registration successful! Please login to continue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-8 relative animate-scale-in"
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-[#0d1117] rounded-lg transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            <h3 className="text-2xl font-bold mb-6">Welcome Back!</h3>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Logging in...</>
                ) : (
                  <><i className="fas fa-sign-in-alt mr-2"></i>Login</>
                )}
              </button>
              <p className="text-center text-sm text-[#8b949e]">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }}
                  className="text-[#238636] hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
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