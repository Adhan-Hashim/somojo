import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import EmployerHome from "./pages/EmployerHome";
import FindCVs from "./pages/FindCVs";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import EmployerProducts from "./pages/EmployerProducts";
import EmployerResources from "./pages/EmployerResources";
import About from "./pages/About";
import Profile from "./pages/Profile";
import AIResumeBuilder from "./pages/AIResumeBuilder";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerApplications from './pages/EmployerApplications';
import SmartInterview from "./pages/SmartInterview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Careers from "./pages/Careers";
import Pricing from "./pages/Pricing";
import Press from "./pages/Press";
import SalaryTool from "./pages/SalaryTool";
import CareerAdvice from "./pages/CareerAdvice";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import JobApplication from "./pages/JobApplication";
import EmployerJobDetails from "./pages/EmployerJobDetails";
import MyApplications from "./pages/MyApplications";
import MyJobs from "./pages/MyJobs";
import AdminPage from "./pages/AdminPage";
import CustomCursor from "./components/CustomCursor";
import Preloader from "./components/Preloader";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { useState } from "react";
import { useThemeColor } from "./hooks/useThemeColor";

function PrivateRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;

  // Admins can access everything
  if (user.role === "admin" && !allowedRole) return children || <AdminPage />;

  // enforce explicit role if requested (admins bypass)
  if (allowedRole && user.role !== allowedRole && user.role !== "admin") {
    // redirect to the appropriate dashboard based on role
    if (user.role === "employer") return <Navigate to="/employer" replace />;
    return <Navigate to="/home" replace />;
  }

  if (children) return children;

  if (user.role === "employer") return <EmployerDashboard />;
  if (user.role === "admin") return <AdminPage />;
  return <StudentDashboard />;
}

function Layout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const hideFooter = ["/login", "/register"].includes(location.pathname) || isAdminPath;
  const hideNavbar = isAdminPath;
  const { themeBg } = useThemeColor();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <CustomCursor />

      {/* 🌑 Dark Gradient Overlay + Dynamic Ambient Glow */}
      {!isAdminPath && (
        <>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] ${themeBg} opacity-[0.03] blur-[120px] rounded-full pointer-events-none transition-colors duration-[2000ms]`}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111] z-10 opacity-80 pointer-events-none" />
        </>
      )}

      {/* 🌟 Routes Layer */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {!hideNavbar && <Navbar />}
        <main className="flex-grow flex flex-col">
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/press" element={<Press />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />

            {/* Private Routes */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/jobs/:id" element={<PrivateRoute><JobDetails /></PrivateRoute>} />
            <Route path="/apply/:id" element={<PrivateRoute><JobApplication /></PrivateRoute>} />
            <Route path="/my-applications" element={<PrivateRoute><MyApplications /></PrivateRoute>} />
            <Route path="/employer" element={<PrivateRoute allowedRole="employer"><EmployerHome /></PrivateRoute>} />
            <Route path="/employer/job/:jobId" element={<PrivateRoute allowedRole="employer"><EmployerJobDetails /></PrivateRoute>} />
            <Route path="/find-cvs" element={<PrivateRoute allowedRole="employer"><FindCVs /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute allowedRole="employer"><EmployerProducts /></PrivateRoute>} />
            <Route path="/resources" element={<PrivateRoute allowedRole="employer"><EmployerResources /></PrivateRoute>} />
            <Route path="/careers" element={<PrivateRoute><Careers /></PrivateRoute>} />
            <Route path="/salary-tool" element={<PrivateRoute><SalaryTool /></PrivateRoute>} />
            <Route path="/career-advice" element={<PrivateRoute><CareerAdvice /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/build-resume" element={<PrivateRoute><AIResumeBuilder /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute allowedRole="employer" />} />
            <Route path="/dashboard/applications/:jobId" element={<PrivateRoute allowedRole="employer"><EmployerApplications /></PrivateRoute>} />
            <Route path="/interview" element={<PrivateRoute><SmartInterview /></PrivateRoute>} />
            <Route path="/my-jobs" element={<PrivateRoute><MyJobs /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute allowedRole="admin"><AdminPage /></PrivateRoute>} />
          </Routes>
        </main>
        {!hideFooter && <Footer />}
      </div>

    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <Layout />
    </BrowserRouter>
  );
}

export default App;