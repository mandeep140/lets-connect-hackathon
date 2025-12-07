'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyPage() {
  const [step, setStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    aadhaar: '',
    pan: '',
    email: '',
    fullName: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleMethodSelect = (method) => {
    setVerificationMethod(method);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendOTP = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
    }, 2000);
  };

  const verifyOTP = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
    }, 2000);
  };

  const resetVerification = () => {
    setStep(1);
    setVerificationMethod('');
    setFormData({
      phoneNumber: '',
      otp: '',
      aadhaar: '',
      pan: '',
      email: '',
      fullName: ''
    });
    setVerificationSuccess(false);
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
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <i className="fas fa-route text-[#238636] text-2xl"></i>
            <span>Let's Connect</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#8b949e] hover:bg-[#161b22] transition-all">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="pt-[100px] min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {!verificationSuccess ? (
            <>
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        step >= s 
                          ? 'bg-[#238636] text-white scale-110' 
                          : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && (
                        <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                          step > s ? 'bg-[#238636]' : 'bg-[#30363d]'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 text-[#8b949e]">
                  {step === 1 && 'Choose Verification Method'}
                  {step === 2 && 'Enter Details'}
                  {step === 3 && 'Verify OTP'}
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-xl">
                {/* Step 1: Choose Method */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold mb-2">Verify Your Identity</h1>
                      <p className="text-[#8b949e]">Choose your preferred verification method</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div
                        onClick={() => handleMethodSelect('phone')}
                        className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200 text-center group"
                      >
                        <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 group-hover:scale-110">
                          <i className="fas fa-mobile-alt"></i>
                        </div>
                        <h3 className="font-bold mb-2">Phone Number</h3>
                        <p className="text-sm text-[#8b949e]">Verify via OTP</p>
                      </div>

                      <div
                        onClick={() => handleMethodSelect('aadhaar')}
                        className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200 text-center group"
                      >
                        <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 group-hover:scale-110">
                          <i className="fas fa-id-card"></i>
                        </div>
                        <h3 className="font-bold mb-2">Aadhaar</h3>
                        <p className="text-sm text-[#8b949e]">UIDAI Verification</p>
                      </div>

                      <div
                        onClick={() => handleMethodSelect('digilocker')}
                        className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200 text-center group"
                      >
                        <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 group-hover:scale-110">
                          <i className="fas fa-lock"></i>
                        </div>
                        <h3 className="font-bold mb-2">DigiLocker</h3>
                        <p className="text-sm text-[#8b949e]">Digital Documents</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-shield-alt text-[#238636] text-xl mt-1"></i>
                        <div>
                          <h4 className="font-semibold mb-1">Secure & Private</h4>
                          <p className="text-sm text-[#8b949e]">
                            Your data is encrypted end-to-end and never shared with third parties. 
                            We comply with all government regulations and data protection laws.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Enter Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold mb-2">Enter Your Details</h1>
                      <p className="text-[#8b949e]">
                        {verificationMethod === 'phone' && 'We\'ll send you an OTP to verify'}
                        {verificationMethod === 'aadhaar' && 'Enter your Aadhaar details'}
                        {verificationMethod === 'digilocker' && 'Connect with DigiLocker'}
                      </p>
                    </div>

                    {verificationMethod === 'phone' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Phone Number</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]">+91</span>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="Enter 10-digit mobile number"
                              maxLength={10}
                              className="w-full pl-14 pr-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationMethod === 'aadhaar' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Aadhaar Number</label>
                          <input
                            type="text"
                            name="aadhaar"
                            value={formData.aadhaar}
                            onChange={handleInputChange}
                            placeholder="Enter 12-digit Aadhaar number"
                            maxLength={12}
                            className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Phone Number (Linked with Aadhaar)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]">+91</span>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="Enter registered mobile number"
                              maxLength={10}
                              className="w-full pl-14 pr-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationMethod === 'digilocker' && (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <i className="fas fa-lock text-6xl text-[#238636] mb-4"></i>
                          <h3 className="text-xl font-bold mb-3">Connect with DigiLocker</h3>
                          <p className="text-[#8b949e] mb-6">
                            You'll be redirected to DigiLocker to securely verify your identity
                          </p>
                          <div className="space-y-3 text-left max-w-md mx-auto">
                            <div className="flex items-center gap-3 text-sm">
                              <i className="fas fa-check text-[#238636]"></i>
                              <span>Instant verification</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <i className="fas fa-check text-[#238636]"></i>
                              <span>Government authorized</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <i className="fas fa-check text-[#238636]"></i>
                              <span>Secure document access</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border border-[#30363d] text-[#8b949e] rounded-xl hover:border-[#238636] hover:text-[#238636] active:scale-95 transition-all duration-200"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back
                      </button>
                      <button
                        onClick={sendOTP}
                        disabled={isVerifying || (verificationMethod !== 'digilocker' && (!formData.phoneNumber || formData.phoneNumber.length !== 10))}
                        className="flex-1 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Sending...</>
                        ) : verificationMethod === 'digilocker' ? (
                          <><i className="fas fa-external-link-alt mr-2"></i>Connect DigiLocker</>
                        ) : (
                          <><i className="fas fa-paper-plane mr-2"></i>Send OTP</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Verify OTP */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#238636]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-sms text-3xl text-[#238636]"></i>
                      </div>
                      <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
                      <p className="text-[#8b949e]">
                        We've sent a 6-digit code to +91 {formData.phoneNumber}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Enter OTP</label>
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                      />
                    </div>

                    <div className="text-center">
                      <button className="text-[#238636] hover:text-[#2ea043] text-sm transition-colors">
                        Didn't receive? <span className="underline">Resend OTP</span>
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 px-6 py-3 border border-[#30363d] text-[#8b949e] rounded-xl hover:border-[#238636] hover:text-[#238636] active:scale-95 transition-all duration-200"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back
                      </button>
                      <button
                        onClick={verifyOTP}
                        disabled={isVerifying || formData.otp.length !== 6}
                        className="flex-1 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying...</>
                        ) : (
                          <><i className="fas fa-check mr-2"></i>Verify</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Success Screen */
            <div className="bg-[#161b22] border border-[#238636] rounded-2xl p-8 shadow-xl shadow-[#238636]/20 animate-scale-in">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-[#238636] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <i className="fas fa-check text-4xl text-white"></i>
                </div>
                <h1 className="text-3xl font-bold mb-3">Verification Successful!</h1>
                <p className="text-[#8b949e] mb-8">
                  Your identity has been verified successfully. You can now access all features.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                    <i className="fas fa-user-check text-2xl text-[#238636] mb-2"></i>
                    <h3 className="font-semibold">Verified User</h3>
                    <p className="text-sm text-[#8b949e]">Full access granted</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                    <i className="fas fa-shield-check text-2xl text-[#238636] mb-2"></i>
                    <h3 className="font-semibold">Secure Account</h3>
                    <p className="text-sm text-[#8b949e]">Protected profile</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                    <i className="fas fa-bolt text-2xl text-[#238636] mb-2"></i>
                    <h3 className="font-semibold">Quick Booking</h3>
                    <p className="text-sm text-[#8b949e]">Priority access</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/"
                    className="flex-1 px-6 py-3 border border-[#238636] text-[#238636] rounded-xl hover:bg-[#238636] hover:text-white active:scale-95 transition-all duration-200 text-center"
                  >
                    <i className="fas fa-home mr-2"></i>
                    Go to Home
                  </Link>
                  <button
                    onClick={resetVerification}
                    className="flex-1 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 active:scale-95 transition-all duration-200"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Verify Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </div>
  );
}
