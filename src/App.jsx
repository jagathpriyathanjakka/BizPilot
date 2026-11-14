import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QuickPOSModal from './components/QuickPOSModal';
import AICommandModal from './components/AICommandModal';
import NewProductModal from './components/NewProductModal';

// Pages
import WelcomePage from './pages/Welcome';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import OnboardingPage from './pages/Onboarding';
import DashboardPage from './pages/Dashboard';
import ProductsPage from './pages/Products';
import SalesPage from './pages/Sales';
import CustomersPage from './pages/Customers';
import SuppliersPage from './pages/Suppliers';
import ExpensesPage from './pages/Expenses';
import StaffPage from './pages/Staff';
import ReportsPage from './pages/Reports';
import AIPage from './pages/AI';
import ApprovalsPage from './pages/Approvals';
import SpecializedPage from './pages/Specialized';
import SettingsPage from './pages/Settings';

import { api, getToken } from './api';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isQuickPOSOpen, setIsQuickPOSOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const isAuthPage = ['/welcome', '/signin', '/signup', '/onboarding'].includes(location.pathname);

  const loadInitialData = async () => {
    try {
      const meRes = await api.getMe();
      if (meRes.business) {
        setCurrentBusiness(meRes.business);
      }
      const bizRes = await api.getBusinesses();
      setAllBusinesses(bizRes.businesses || []);

      // If business loaded, fetch supplementary data for modals
      const activeId = meRes.business?.id;
      if (activeId) {
        const [prodRes, custRes, apprRes] = await Promise.all([
          api.getProducts(activeId).catch(() => ({ products: [] })),
          api.getCustomers(activeId).catch(() => ({ customers: [] })),
          api.getApprovals(activeId, 'Pending').catch(() => ({ approvals: [] })),
        ]);
        setProducts(prodRes.products || []);
        setCustomers(custRes.customers || []);
        setPendingApprovalsCount(apprRes.approvals?.length || 0);
      }
    } catch (err) {
      console.warn('Initial session check:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [location.pathname]);

  const handleBusinessSwitch = async (bId) => {
    try {
      const res = await api.switchBusiness(bId);
      setCurrentBusiness(res.business);
      loadInitialData();
    } catch (err) {
      alert(`Switch business failed: ${err.message}`);
    }
  };

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      <Navbar
        currentBusiness={currentBusiness}
        allBusinesses={allBusinesses}
        onBusinessSwitch={handleBusinessSwitch}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenQuickSale={() => setIsQuickPOSOpen(true)}
        onOpenAIChat={() => setIsAIModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentBusiness={currentBusiness} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  business={currentBusiness}
                  onOpenQuickSale={() => setIsQuickPOSOpen(true)}
                  onOpenAIChat={() => setIsAIModalOpen(true)}
                  onOpenAddProduct={() => setIsAddProductOpen(true)}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  business={currentBusiness}
                  onOpenAddProduct={() => setIsAddProductOpen(true)}
                />
              }
            />
            <Route
              path="/sales"
              element={
                <SalesPage
                  business={currentBusiness}
                  onOpenQuickSale={() => setIsQuickPOSOpen(true)}
                />
              }
            />
            <Route path="/customers" element={<CustomersPage business={currentBusiness} />} />
            <Route path="/suppliers" element={<SuppliersPage business={currentBusiness} />} />
            <Route path="/expenses" element={<ExpensesPage business={currentBusiness} />} />
            <Route path="/staff" element={<StaffPage business={currentBusiness} />} />
            <Route path="/reports" element={<ReportsPage business={currentBusiness} />} />
            <Route
              path="/ai"
              element={
                <AIPage
                  business={currentBusiness}
                  onOpenAIChat={() => setIsAIModalOpen(true)}
                />
              }
            />
            <Route path="/approvals" element={<ApprovalsPage business={currentBusiness} />} />
            <Route path="/specialized" element={<SpecializedPage business={currentBusiness} />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  business={currentBusiness}
                  onBusinessSwitched={handleBusinessSwitch}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Modals */}
      <QuickPOSModal
        isOpen={isQuickPOSOpen}
        onClose={() => setIsQuickPOSOpen(false)}
        products={products}
        customers={customers}
        businessId={currentBusiness?.id || 'biz-grocery-demo'}
        currency={currentBusiness?.currency === 'INR' ? '₹' : (currentBusiness?.currency || '₹')}
        onSaleCreated={() => loadInitialData()}
      />

      <AICommandModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        businessId={currentBusiness?.id || 'biz-grocery-demo'}
        categoryKey={currentBusiness?.category || 'grocery'}
        onActionApproved={() => loadInitialData()}
      />

      <NewProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        businessId={currentBusiness?.id || 'biz-grocery-demo'}
        currency={currentBusiness?.currency === 'INR' ? '₹' : (currentBusiness?.currency || '₹')}
        onProductCreated={() => loadInitialData()}
      />
    </div>
  );
}
