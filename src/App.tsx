import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { Batch } from './pages/Batch';
import { Settings } from './pages/Settings';
import { Assets } from './pages/Assets';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import { GuestReviewSession } from './pages/GuestReviewSession';

// Components
import { AgentDashboard } from './components/AgentDashboard';
import { TrainingCenter } from './components/TrainingCenter';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReviewSessionManager } from './components/ReviewSessionManager';
import { ReviewSession } from './pages/ReviewSession';
import { ChatDemo } from './pages/ChatDemo';
import { CustomerDashboard } from './components/CustomerDashboard';
import { DesignerDashboard } from './components/DesignerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderHistory } from './components/OrderHistory';
import { BatchProcessing } from './components/BatchProcessing';
import { ApprovalWorkflowManager } from './components/ApprovalWorkflowManager';
import { SideBySideComparison } from './components/SideBySideComparison';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/guest/:sessionId" element={<GuestReviewSession />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="editor/:id" element={<Editor />} />
            <Route path="batch" element={<Batch />} />
            <Route path="settings" element={<Settings />} />
            <Route path="assets" element={<Assets />} />
            <Route
              path="agent"
              element={
                <ProtectedRoute requiredRoles={['agent', 'admin']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="training" element={<TrainingCenter />} />
            <Route
              path="analytics"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="reviews" element={<ReviewSessionManager />} />
            <Route path="review/:sessionId" element={<ReviewSession />} />
            <Route path="chat-demo" element={<ChatDemo />} />

            {/* Role-Specific Dashboards */}
            <Route path="customer-dashboard" element={<CustomerDashboard user={null} />} />
            <Route path="designer-dashboard" element={<DesignerDashboard user={null} />} />
            <Route path="admin-dashboard" element={<AdminDashboard user={null} />} />

            {/* Additional Features */}
            <Route path="orders" element={<OrderHistory customerId="" onReorder={() => { }} onViewProof={() => { }} onDownloadFiles={() => { }} />} />
            <Route path="batch-processing" element={<BatchProcessing onStartBatch={() => { }} onPauseBatch={() => { }} onResumeBatch={() => { }} onCancelBatch={() => { }} onDownloadResults={() => { }} />} />
            <Route path="approval/:jobId" element={<div>Approval Workflow Page</div>} />
            <Route path="comparison/:jobId" element={<div>Comparison Page</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
