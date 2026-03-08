import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/index';
import { Button, Input, Checkbox } from '@components/ui/index';
import { MailIcon, KeyIcon, EyeIcon, EyeOffIcon, UserIcon, PhoneIcon } from '@components/layout/icons';

interface RegisterFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function RegisterForm({ currentStep, setCurrentStep }: RegisterFormProps) {
  const navigate = useNavigate();
  const { registerPatient, isLoading, error, clearError } = useAuth();
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      return;
    }

    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ');

    if (!firstName || !lastName) {
      return;
    }

    await registerPatient({
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
      emergencyContact: {
        name: emergencyContactName,
        relationship: emergencyContactRelationship,
        phone: emergencyContactPhone,
      },
    });

    navigate('/patient/dashboard');
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/50 overflow-hidden">
      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-100">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="p-8 lg:p-10">
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    step < currentStep 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
                      : step === currentStep 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50 scale-110' 
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {step < currentStep ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${step === currentStep ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {step === 1 ? 'Account' : step === 2 ? 'Personal' : 'Verify'}
                </span>
              </div>
              {step < 3 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${step < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {currentStep === 1 && 'Create Your Account'}
            {currentStep === 2 && 'Personal Information'}
            {currentStep === 3 && 'Complete Registration'}
          </h2>
          <p className="text-slate-600 text-sm">
            {currentStep === 1 && 'Enter your email and create a secure password'}
            {currentStep === 2 && 'Help us personalize your healthcare experience'}
            {currentStep === 3 && 'Review and confirm your details'}
          </p>
        </div>

        {/* Form Steps */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                required
                icon={<UserIcon />}
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                autoComplete="email"
                required
                icon={<MailIcon />}
              />

              <div>
                <Input
                  label="Create Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                  icon={<KeyIcon />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Must include 8+ characters, uppercase letter, and number
                </p>
              </div>

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                icon={<KeyIcon />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 -mt-3">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                autoComplete="tel"
                required
                icon={<PhoneIcon />}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <Input
                label="Emergency Contact Name"
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Jane Doe"
                required
                icon={<UserIcon />}
              />

              <Input
                label="Emergency Contact Relationship"
                type="text"
                value={emergencyContactRelationship}
                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                placeholder="Spouse, Parent, Sibling..."
                required
                icon={<UserIcon />}
              />

              <Input
                label="Emergency Contact Phone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="(555) 000-0000"
                required
                icon={<PhoneIcon />}
              />

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Why we need this</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your information helps us provide personalized care and connect you with nearby healthcare providers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Terms & Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Full Name</span>
                  <span className="text-sm font-semibold text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Email</span>
                  <span className="text-sm font-semibold text-slate-900">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Phone</span>
                  <span className="text-sm font-semibold text-slate-900">{phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Date of Birth</span>
                  <span className="text-sm font-semibold text-slate-900">{dateOfBirth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Gender</span>
                  <span className="text-sm font-semibold text-slate-900 capitalize">{gender}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Emergency Contact</span>
                  <span className="text-sm font-semibold text-slate-900">{emergencyContactName}</span>
                </div>
              </div>

              <Checkbox
                label={
                  <span className="text-sm">
                    I agree to the{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                      Privacy Policy
                    </a>
                  </span>
                }
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Your data is secure</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      We use bank-level encryption and are fully HIPAA compliant to protect your health information.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                variant="primary"
                size="md"
                className="flex-1"
              >
                Continue
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1"
                disabled={!acceptedTerms}
                isLoading={isLoading}
              >
                Create Account
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            )}
          </div>
        </form>

        {/* Footer */}
        {currentStep === 1 && (
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
