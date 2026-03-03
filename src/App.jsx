import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import EmployerHome from "./pages/EmployerHome";
import FindCVs from "./pages/FindCVs";
import Jobs from "./pages/Jobs";
import EmployerProducts from "./pages/EmployerProducts";
import EmployerResources from "./pages/EmployerResources";
import About from "./pages/About";
import Profile from "./pages/Profile";
import AIResumeBuilder from "./pages/AIResumeBuilder";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
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
import CustomCursor from "./components/CustomCursor";
import Preloader from "./components/Preloader";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { useState } from "react";
import { useThemeColor } from "./hooks/useThemeColor";

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;

  if (children) return children;

  if (user.role === "employer") return <EmployerDashboard />;
  // 'student' or 'guest' routes appropriately navigate here
  return <StudentDashboard />;
}

function Layout() {
  const location = useLocation();
  const hideFooter = ["/login", "/register"].includes(location.pathname);
  const { themeBg } = useThemeColor();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <CustomCursor />

      {/* 🌑 Dark Gradient Overlay + Dynamic Ambient Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] ${themeBg} opacity-[0.03] blur-[120px] rounded-full pointer-events-none transition-colors duration-[2000ms]`}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111] z-10 opacity-80 pointer-events-none" />

      {/* 🌟 Routes Layer */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/employer" element={<EmployerHome />} />
            <Route path="/find-cvs" element={<FindCVs />} />
            <Route path="/products" element={<EmployerProducts />} />
            <Route path="/resources" element={<EmployerResources />} />

            <Route path="/careers" element={<Careers />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/press" element={<Press />} />
            <Route path="/salary-tool" element={<SalaryTool />} />
            <Route path="/career-advice" element={<CareerAdvice />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />

            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/build-resume" element={<PrivateRoute><AIResumeBuilder /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute />} />
            <Route path="/my-jobs" element={<PrivateRoute />} />
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