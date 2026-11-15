import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Bot,
  Zap,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../categories';
import { CategoryIcon } from '../components/CategoryIcon';
import { api, setToken } from '../api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State - 100% Original User Information
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    ownerName: '',
    mobile: '',
    email: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    gstin: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  // Preload authenticated user's real name and email
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setBusinessInfo((prev) => ({
            ...prev,
            ownerName: res.user.fullName || prev.ownerName,
            email: res.user.email || prev.email,
            mobile: res.user.mobile || prev.mobile,
          }));
        }
      } catch (err) {
        // User session will be verified upon onboarding submit
      }
    }
    loadCurrentUser();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('grocery');
  const [selectedType, setSelectedType] = useState('General Grocery');
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
    offersDelivery: false,
  });
  const [seedDemo, setSeedDemo] = useState(false);

  const categoriesList = Object.values(BUSINESS_CATEGORIES);
  const currentCategoryDef = BUSINESS_CATEGORIES[selectedCategory] || BUSINESS_CATEGORIES.grocery;

  const handleNext = () => setStep((s) => Math.min(6, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      const payload = {
        businessInfo,
        category: selectedCategory,
        businessType: selectedType,
        operations,
        seedDemo,
      };
      const res = await api.completeOnboarding(payload);
      if (res.token) setToken(res.token);
      navigate('/');
    } catch (err) {
      alert(`Onboarding error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-violet-600 selection:text-white">
      {/* Top Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 flex items-center justify-center">
            <div className="h-full w-full bg-[#070B14] rounded-md flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
          <span className="font-extrabold text-lg text-white">BizPilot AI Onboarding</span>
        </div>
        <div className="text-xs font-mono text-cyan-400">Step {step} of 6</div>
      </header>

      {/* Progress Track */}
      <div className="max-w-4xl mx-auto w-full my-4">
        <div className="grid grid-cols-6 gap-2">
          {['Business Info', 'Category', 'Industry Type', 'Operations', 'Preferences', 'AI Launch'].map((label, idx) => (
            <div key={idx} className="space-y-1 text-center">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  idx + 1 <= step ? 'bg-gradient-to-r from-violet-500 to-cyan-400' : 'bg-slate-800'
                }`}
              />
              <span className="text-[10px] hidden sm:block text-slate-400 truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Step Body */}
      <main className="max-w-4xl mx-auto w-full flex-1 my-4 flex flex-col justify-center">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/60 backdrop-blur-xl">
          {/* STEP 1: Business Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Tell us about your business</h3>
                <p className="text-xs text-slate-400">General business identity, contact and location information.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Enterprises or Metro Cafe"
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Owner / Proprietor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={businessInfo.ownerName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Business Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={businessInfo.mobile}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Business Email</label>
                  <input
                    type="email"
                    placeholder="contact@business.com"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Business Address</label>
                  <input
                    type="text"
                    placeholder="Shop/Office number, building, street, area"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Bengaluru, Delhi"
                    value={businessInfo.city}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 27ABCDE1234F1Z5 (Optional)"
                    value={businessInfo.gstin}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, gstin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Category Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Select Your Business Category</h3>
                <p className="text-xs text-slate-400">BizPilot configures specialized terminology, stock units, and agent rules.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <div
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setSelectedType(cat.subcategories[0]);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 shadow-glow'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2.5 ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-slate-800 text-violet-400'
                        }`}>
                          <CategoryIcon name={cat.icon} className="h-4 w-4" />
                        </div>
                        <h4 className="font-bold text-xs text-white">{cat.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{cat.tagline}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-violet-500/30 flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                          <span>Selected</span>
                          <CheckCircle className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Subcategory / Type */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Choose Your Specific Industry Segment</h3>
                <p className="text-xs text-slate-400">Fine-tune workflows for {currentCategoryDef.name}.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {currentCategoryDef.subcategories.map((sub) => {
                  const isSelected = selectedType === sub;
                  return (
                    <div
                      key={sub}
                      onClick={() => setSelectedType(sub)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-glow-cyan'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-xs">{sub}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-cyan-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Operational Profile */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-xl font-bold text-white">Daily Operational Profile</h3>
                <p className="text-xs text-slate-400">Configure how orders, payments, and stock flow in your store.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  { key: 'sellsProducts', label: 'Sells Physical Products & Items' },
                  { key: 'providesServices', label: 'Provides Appointments or Services' },
                  { key: 'managesInventory', label: 'Tracks Real-Time Stock & Low-Stock Alerts' },
                  { key: 'hasEmployees', label: 'Has Staff / Cashiers / Managers' },
                  { key: 'offersDelivery', label: 'Provides Home Delivery / Pickup' },
                  { key: 'acceptsUpi', label: 'Accepts Instant UPI QR Payments' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
                  >
                    <span className="text-slate-200 font-medium">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(operations[key])}
                      onChange={(e) => setOperations({ ...operations, [key]: e.target.checked })}
                      className="h-4 w-4 accent-violet-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Preferences */}
          {step === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-xl font-bold text-white">Preferences & Tax Defaults</h3>
                <p className="text-xs text-slate-400">Set default currency, invoices, and timezone.</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Currency</label>
                  <input
                    type="text"
                    value={businessInfo.currency}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Time Zone</label>
                  <input
                    type="text"
                    value={businessInfo.timezone}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: AI Workspace Generation */}
          {step === 6 && (
            <div className="space-y-5 text-center py-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 flex items-center justify-center animate-pulse">
                <div className="h-full w-full bg-[#070B14] rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-cyan-300" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Deploy AI Multi-Agent Workspace</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Ready to provision <span className="text-cyan-400 font-semibold">{businessInfo.name}</span> in the <span className="text-violet-400 font-semibold">{currentCategoryDef.name}</span> industry.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white font-semibold">{currentCategoryDef.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-semibold">{selectedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inventory Unit</span>
                  <span className="text-cyan-400 font-mono font-bold">{currentCategoryDef.stockUnit}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Seed Realistic Demo Data</p>
                    <p className="text-[10px] text-slate-500">Includes domain products, sample sales & suppliers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={seedDemo}
                    onChange={(e) => setSeedDemo(e.target.checked)}
                    className="h-4 w-4 accent-violet-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all active:scale-95"
              >
                <span>{loading ? 'Generating Workspace...' : 'Launch BizPilot AI Dashboard'}</span>
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-[11px] text-slate-500 pt-2">
        BizPilot AI • Multi-Business Architecture
      </footer>
    </div>
  );
}
