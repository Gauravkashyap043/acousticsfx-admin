import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import RequireTab from './components/RequireTab'
import DashboardHome from './pages/DashboardHome'
import Users from './pages/Users'
import Categories from './pages/Categories'
import Products from './pages/Products'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import Newsletter from './pages/Newsletter'
import Blogs from './pages/Blogs'
import Content from './pages/Content'
import CaseStudies from './pages/CaseStudies'
import Events from './pages/Events'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route element={<RequireTab tabKey="users" />}>
                <Route path="users" element={<Users />} />
              </Route>
              <Route element={<RequireTab tabKey="categories" />}>
                <Route path="categories" element={<Categories />} />
              </Route>
              <Route element={<RequireTab tabKey="products" />}>
                <Route path="products" element={<Products />} />
              </Route>
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="contact" element={<Contact />} />
              <Route element={<RequireTab tabKey="newsletter" />}>
                <Route path="newsletter" element={<Newsletter />} />
              </Route>
              <Route path="blogs" element={<Blogs />} />
              <Route path="content" element={<Content />} />
              <Route path="case-studies" element={<CaseStudies />} />
              <Route path="events" element={<Events />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
