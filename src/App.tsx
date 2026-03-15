import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hostels from "./pages/Hostels";
import HostelDetail from "./pages/HostelDetail";
import ListHostel from "./pages/ListHostel";
import Dashboard from "./pages/Dashboard";
import HostelForm from "./pages/HostelForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import StudentFAQs from "./pages/StudentFAQs";
import SafetyTips from "./pages/SafetyTips";
import EditHostel from "./pages/EditHostel";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AgentInquiries from "./pages/AgentInquiries";
import InquirySent from "./pages/InquirySent";
import AgentReviews from "./pages/AgentReviews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hostels" element={<Hostels />} />
          <Route path="/hostels/:id" element={<HostelDetail />} />
          <Route path="/list-hostel" element={<ListHostel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/hostel/new" element={<HostelForm />} />
          <Route path="/dashboard/hostel/edit/:id" element={<HostelForm />} />
          <Route path="/dashboard/edit/:id" element={<EditHostel />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/faqs" element={<StudentFAQs />} />
          <Route path="/safety-tips" element={<SafetyTips />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/inquiries" element={<AgentInquiries />} />
          <Route path="/inquiry-sent/:id" element={<InquirySent />} />
          <Route path="/dashboard/reviews" element={<AgentReviews />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
