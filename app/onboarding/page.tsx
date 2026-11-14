'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';
import { BusinessCategoryKey } from '@/lib/types';
import { CategoryIcon } from '@/components/CategoryIcon';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Shree Balaji Enterprises',
    ownerName: 'Sunil Kumar',
    mobile: '+91 98765 43210',
    email: 'sunil@balajienterprises.com',
    address: 'Shop 12, Market Complex, Station Road',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400001',
    gstin: '27AAAAA0000A1Z5',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    openingDate: new Date().toISOString().split('T')[0],
  });

  const [selectedCategory, setSelectedCategory] = useState<BusinessCategoryKey>('grocery');
  const [selectedSubType, setSelectedSubType] = useState<string>('Supermarket');
  const [additionalTypes, setAdditionalTypes] = useState<string[]>([]);

  const [operations, setOperations] = useState({
    sellsProducts: true,
    providesServices: false,
    managesInventory: true,
    hasEmployees: true,
    hasMultipleBranches: false,
    acceptsCash: true,
    acceptsUpi: true,
    acceptsCards: true,
    acceptsBankTransfer: true,
    offersDelivery: true,
    openingHours: '09:00 AM - 09:30 PM',
  });

  const [seedDemoData, setSeedDemoData] = useState(true);

  // Update subcategory whenever category changes
  const handleCategorySelect = (catKey: BusinessCategoryKey) => {
    setSelectedCategory(catKey);
    const subcats = BUSINESS_CATEGORIES[catKey].subcategories;
    setSelectedSubType(subcats[0] || 'General Store');
  };

  const handleNext = () => {
    if (currentStep === 1 && !businessInfo.name) {
      alert('Please enter a business name');
      return;
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo,
          category: selectedCategory,
          businessType: selectedSubType,
          additionalTypes,
          operations,
          seedDemo: seedDemoData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        alert(data.error || 'Failed to create workspace');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    'Business Info',
    'Category',
    'Business Type',
    'Operations',
    'Initial Setup',
    'Ready!',
  ];

  const currentCategoryDef = BUSINESS_CATEGORIES[selectedCategory];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-navy-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
            <div className="h-full w-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">BizPilot AI</span>
          <span className="text-xs text-slate-400">• Onboarding Wizard</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Step {currentStep} of {steps.length}
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((st, i) => (
              <div
                key={i}
                className={`text-[11px] font-semibold transition-colors ${
                  i + 1 <= currentStep ? 'text-cyan-400' : 'text-slate-600'
                }`}
              >
                {st}
              </div>
            ))}
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Business Information */}
        {currentStep === 1 && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Tell us about your business</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered or commercial details. You can configure GST & currencies at any time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Ganesh Supermarket"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Owner / Representative Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kumar"
                  value={businessInfo.ownerName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, ownerName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Business Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={businessInfo.mobile}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, mobile: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Business Email</label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300">Business Address / Shop No.</label>
                <input
                  type="text"
                  placeholder="Shop No. 14, Commercial Plaza, M.G. Road"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">City & State</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <input
                    type="text"
                    placeholder="City"
                    value={businessInfo.city}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={businessInfo.state}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, state: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">GSTIN (Optional)</label>
                <input
                  type="text"
                  placeholder="27AAAAA0000A1Z5"
                  value={businessInfo.gstin}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, gstin: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Select Your Business Category (13 Cards) */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Select your business category</h2>
              <p className="text-xs text-slate-400 mt-1">
                BizPilot dynamically configures its modules, data fields, terminology, and AI agents for your industry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {Object.values(BUSINESS_CATEGORIES).map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleCategorySelect(cat.key)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-violet-500 bg-gradient-to-tr from-violet-950/60 via-slate-900 to-indigo-950/60 shadow-glow'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-glow'
                            : 'bg-slate-900 text-violet-400 border border-slate-800'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} className="h-5 w-5" />
                      </div>
                      {isSelected && (
                        <span className="h-5 w-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-white mt-3 group-hover:text-cyan-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Select Specific Business Type */}
        {currentStep === 3 && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                  {currentCategoryDef.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Select your specific business type
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose the primary model that matches how your shop operates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCategoryDef.subcategories.map((sub) => {
                const isSelected = selectedSubType === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubType(sub)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 text-white shadow-glow-cyan'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{sub}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Business Operations Setup */}
        {currentStep === 4 && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Operations & Workflow Setup</h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize payment channels, employee roles, and delivery features.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={operations.managesInventory}
                    onChange={(e) => setOperations({ ...operations, managesInventory: e.target.checked })}
                    className="rounded border-slate-800 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className="font-bold text-slate-200">Track Real Inventory & Expiry</p>
                    <p className="text-slate-500 text-[11px]">Automatic deductions upon billing</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={operations.hasEmployees}
                    onChange={(e) => setOperations({ ...operations, hasEmployees: e.target.checked })}
                    className="rounded border-slate-800 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className="font-bold text-slate-200">Multiple Staff & Roles</p>
                    <p className="text-slate-500 text-[11px]">Cashier, manager & permissions</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={operations.acceptsUpi}
                    onChange={(e) => setOperations({ ...operations, acceptsUpi: e.target.checked })}
                    className="rounded border-slate-800 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className="font-bold text-slate-200">Accept Instant UPI Payments</p>
                    <p className="text-slate-500 text-[11px]">Google Pay, PhonePe, Paytm QR</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={operations.offersDelivery}
                    onChange={(e) => setOperations({ ...operations, offersDelivery: e.target.checked })}
                    className="rounded border-slate-800 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className="font-bold text-slate-200">Local Delivery & Shipping</p>
                    <p className="text-slate-500 text-[11px]">Doorstep dispatch tracking</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-300">Business Operating Hours</label>
                <input
                  type="text"
                  value={operations.openingHours}
                  onChange={(e) => setOperations({ ...operations, openingHours: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Initial Setup & Demo Data */}
        {currentStep === 5 && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">How would you like to start?</h2>
              <p className="text-xs text-slate-400 mt-1">
                You can start fresh or populate realistic sample items and AI workflows to explore immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSeedDemoData(true)}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  seedDemoData
                    ? 'border-violet-500 bg-violet-950/20 shadow-glow'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      Recommended
                    </span>
                    {seedDemoData && <CheckCircle className="h-5 w-5 text-violet-400" />}
                  </div>
                  <h3 className="font-bold text-base text-white mt-3">
                    Start with Realistic Sample Data
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Instantly populates products, customers, suppliers, POS bills, and AI tasks tailored to{' '}
                    <span className="text-cyan-300 font-semibold">{currentCategoryDef.name}</span>.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeedDemoData(false)}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  !seedDemoData
                    ? 'border-violet-500 bg-violet-950/20 shadow-glow'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      Blank Slate
                    </span>
                    {!seedDemoData && <CheckCircle className="h-5 w-5 text-violet-400" />}
                  </div>
                  <h3 className="font-bold text-base text-white mt-3">Empty Business Workspace</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Start completely clean and enter products, services, and inventory manually or via CSV.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Workspace Ready Screen */}
        {currentStep === 6 && (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="h-full w-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-cyan-400" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your Business Workspace is Ready!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                All 8 autonomous AI agents and specialized modules have been provisioned for{' '}
                <span className="text-cyan-300 font-bold">{businessInfo.name}</span>.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl border border-slate-800 bg-slate-950 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Business Name:</span>
                <span className="text-white font-bold">{businessInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-cyan-400 font-bold">{currentCategoryDef.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-slate-300">{selectedSubType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-300">
                  {businessInfo.city}, {businessInfo.country}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full max-w-md mx-auto py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Launching Workspace...' : 'Enter Business Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        {currentStep < 6 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-3 text-center text-[10px] text-slate-500 font-mono">
        BizPilot AI • Multi-Business Intelligent SaaS Platform
      </footer>
    </div>
  );
}
