import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import Users from './pages/Users'
import Categories from './pages/Categories'
import Products from './pages/Products'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import Blogs from './pages/Blogs'
import CaseStudies from './pages/CaseStudies'
import Events from './pages/Events'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="contact" element={<Contact />} />
              <Route path="blogs" element={<Blogs />} />
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
