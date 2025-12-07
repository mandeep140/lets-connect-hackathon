'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMethodSelect = (method) => {
    setVerificationMethod(method);
    setDocumentNumber('');
    setErrorMessage('');
    setStep(2);
  };

  const handleVerify = async () => {
    if (!documentNumber.trim()) {
      setErrorMessage('Please enter document number');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationType: verificationMethod,
          documentNumber: documentNumber.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setVerificationSuccess(true);
        // Update session to reflect verification status
        await update({
          ...session,
          user: {
            ...session.user,
            isVerified: true,
            verificationMethod: verificationMethod,
            verifiedAt: new Date().toISOString()
          }
        });
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setIsVerifying(false);
    }
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
                        onClick={() => handleMethodSelect('aadhaar')}
                        className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200 text-center group"
                      >
                        <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 group-hover:scale-110">
                          <i className="fas fa-id-card"></i>
                        </div>
                        <h3 className="font-bold mb-2">Aadhaar</h3>
                        <p className="text-sm text-[#8b949e]">12-digit UIDAI Number</p>
                      </div>

                      <div
                        onClick={() => handleMethodSelect('pan')}
                        className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200 text-center group"
                      >
                        <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 group-hover:scale-110">
                          <i className="fas fa-credit-card"></i>
                        </div>
                        <h3 className="font-bold mb-2">PAN Card</h3>
                        <p className="text-sm text-[#8b949e]">Permanent Account Number</p>
                      </div>

                      <div
                        onClick={() => handleMethodSelect('passport')}
                        className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 cursor-pointer hover:border-[#238636] hover:shadow-lg hover:shadow-[#238636]/20 hover:-translate-y-1 active:scale-98 transition-all duration-200 text-center group"
                      >
                        <div className="text-4xl text-[#238636] mb-3 transition-transform duration-200 group-hover:scale-110">
                          <i className="fas fa-passport"></i>
                        </div>
                        <h3 className="font-bold mb-2">Passport</h3>
                        <p className="text-sm text-[#8b949e]">Indian Passport</p>
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
                      <h1 className="text-3xl font-bold mb-2">
                        {verificationMethod === 'aadhaar' && 'Enter Aadhaar Number'}
                        {verificationMethod === 'pan' && 'Enter PAN Number'}
                        {verificationMethod === 'passport' && 'Enter Passport Number'}
                      </h1>
                      <p className="text-[#8b949e]">
                        {verificationMethod === 'aadhaar' && '12-digit Aadhaar number (e.g., 123456789012)'}
                        {verificationMethod === 'pan' && '10-character PAN (e.g., ABCDE1234F)'}
                        {verificationMethod === 'passport' && '8-character Passport (e.g., A1234567)'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {verificationMethod === 'aadhaar' && 'Aadhaar Number'}
                        {verificationMethod === 'pan' && 'PAN Number'}
                        {verificationMethod === 'passport' && 'Passport Number'}
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value.toUpperCase())}
                        placeholder={
                          verificationMethod === 'aadhaar' ? '123456789012' :
                          verificationMethod === 'pan' ? 'ABCDE1234F' :
                          'A1234567'
                        }
                        maxLength={verificationMethod === 'aadhaar' ? 12 : verificationMethod === 'pan' ? 10 : 8}
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white text-lg tracking-wider focus:outline-none focus:border-[#238636] focus:ring-2 focus:ring-[#238636]/20 transition-all duration-200 hover:border-[#238636]/50"
                      />
                    </div>

                    {errorMessage && (
                      <div className="p-4 bg-[#da3633]/10 border border-[#da3633] rounded-xl">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-exclamation-circle text-[#da3633]"></i>
                          <p className="text-sm text-[#da3633]">{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setStep(1); setErrorMessage(''); }}
                        className="flex-1 px-6 py-3 border border-[#30363d] text-[#8b949e] rounded-xl hover:border-[#238636] hover:text-[#238636] active:scale-95 transition-all duration-200"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back
                      </button>
                      <button
                        onClick={handleVerify}
                        disabled={isVerifying || !documentNumber.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying...</>
                        ) : (
                          <><i className="fas fa-check-circle mr-2"></i>Verify Now</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 removed - direct verification */}
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
                  Your identity has been verified successfully. Redirecting to home...
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
                    className="flex-1 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#238636]/50 active:scale-95 transition-all duration-200 text-center"
                  >
                    <i className="fas fa-home mr-2"></i>
                    Go to Home
                  </Link>
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
