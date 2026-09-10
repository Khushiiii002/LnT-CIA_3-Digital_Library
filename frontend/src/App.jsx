import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { BookCatalog } from './components/Catalog/BookCatalog';
import { MemberDashboard } from './components/Member/MemberDashboard';
import { IssueReturnWorkflow } from './components/Librarian/IssueReturnWorkflow';
import { HoldsManagement } from './components/Holds/HoldsManagement';
import { FinesManagement } from './components/Fines/FinesManagement';
import { ReportsView } from './components/Reports/ReportsView';
import { UserAdmin } from './components/Admin/UserAdmin';
import { MembershipPlansView } from './components/Admin/MembershipPlansView';

export function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('catalog');
  const [toast, setToast] = useState(null);

  const showToast = (toastData) => {
    setToast(toastData);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading Digital Library...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setAuthMode('register')}
            setToast={showToast}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setAuthMode('login')}
            setToast={showToast}
          />
        )}
        <Toast
          type={toast?.type}
          message={toast?.message}
          onClose={() => setToast(null)}
        />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return <BookCatalog setToast={showToast} />;
      case 'dashboard':
        return <MemberDashboard setToast={showToast} />;
      case 'issues_returns':
        return <IssueReturnWorkflow setToast={showToast} />;
      case 'holds':
        return <HoldsManagement setToast={showToast} />;
      case 'fines':
        return <FinesManagement setToast={showToast} />;
      case 'reports':
        return <ReportsView setToast={showToast} />;
      case 'users':
        return <UserAdmin setToast={showToast} />;
      case 'memberships':
        return <MembershipPlansView setToast={showToast} />;
      default:
        return <BookCatalog setToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderTabContent()}
        </main>
      </div>

      <Toast
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default App;
