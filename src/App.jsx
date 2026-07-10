import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Toaster from './components/ui/Toaster'

import Login from './pages/public/Login'
import Dashboard from './pages/admin/Dashboard'
import AgencyList from './pages/admin/AgencyList'
import AgencyCreate from './pages/admin/AgencyCreate'
import AgencyDetail from './pages/admin/AgencyDetail'
import AgencyEdit from './pages/admin/AgencyEdit'
import AgencyPayment from './pages/admin/AgencyPayment'
import Plans from './pages/admin/Plans'
import FeatureCatalog from './pages/admin/FeatureCatalog'
import Transactions from './pages/admin/Transactions'
import InvoiceView from './pages/admin/InvoiceView'
import Subscriptions from './pages/admin/Subscriptions'
import DemoRequests from './pages/admin/DemoRequests'
import DemoCreate from './pages/admin/DemoCreate'
import Settings from './pages/admin/Settings'
import SupportCenter from './pages/admin/SupportCenter'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="agencies" element={<AgencyList />} />
          <Route path="agencies/new" element={<AgencyCreate />} />
          <Route path="agencies/:id" element={<AgencyDetail />} />
          <Route path="agencies/:id/edit" element={<AgencyEdit />} />
          <Route path="agencies/:id/activate" element={<AgencyPayment mode="activate" />} />
          <Route path="agencies/:id/renew" element={<AgencyPayment mode="renew" />} />
          <Route path="plans" element={<Plans />} />
          <Route path="features" element={<FeatureCatalog />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions/:id" element={<InvoiceView />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="demo-requests" element={<DemoRequests />} />
          <Route path="demo-requests/new" element={<DemoCreate />} />
          <Route path="support" element={<SupportCenter />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
