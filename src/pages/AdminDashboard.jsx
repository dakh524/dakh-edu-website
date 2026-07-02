import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Map as MapIcon, Loader2, Download, FileText, FileBadge, Mail, Phone, Globe, User, BookOpen, Clock, Calendar, Monitor, Building, ClipboardList, AlertCircle, Award, PhoneCall, Briefcase, Trash2, ShoppingBag, Image as ImageIcon, Handshake, TrendingUp, CheckCircle2, CheckSquare, ListTodo, BarChart2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { flushSync } from 'react-dom';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');
  const [registrations, setRegistrations] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [internProjects, setInternProjects] = useState([]);
  const [ipTitle, setIpTitle] = useState('');
  const [ipVercelLink, setIpVercelLink] = useState('');
  const [ipGithubLink, setIpGithubLink] = useState('');
  const [ipLinkedinImageLink, setIpLinkedinImageLink] = useState('');
  const [isSubmittingIp, setIsSubmittingIp] = useState(false);
  
  const [certificates, setCertificates] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [coldLeads, setColdLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Team dashboard sub-tabs & actions state
  const [teamSubTab, setTeamSubTab] = useState('tracker'); // 'tracker' or 'directory'
  const [selectedMemberForLog, setSelectedMemberForLog] = useState(null);
  const [editingTargetMemberId, setEditingTargetMemberId] = useState(null);
  const [newWeeklyTargetInput, setNewWeeklyTargetInput] = useState('');
  
  // Certificate management state
  const [certName, setCertName] = useState('');
  const [certEmail, setCertEmail] = useState('');
  const [certCode, setCertCode] = useState('');
  const [certDomain, setCertDomain] = useState('');
  const [certLink, setCertLink] = useState('');
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // Team management state
  const [teamName, setTeamName] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamRole, setTeamRole] = useState('Member');
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  const [eventTitle, setEventTitle] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  const [productTitle, setProductTitle] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const [partners, setPartners] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [partnerDescription, setPartnerDescription] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Community');
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);

  const [currentAd, setCurrentAd] = useState(null);
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);

  const [seenCounts, setSeenCounts] = useState(() => {
    return {
      registrations: parseInt(localStorage.getItem('seen_registrations') || '0'),
      blogs: parseInt(localStorage.getItem('seen_blogs') || '0'),
      freelancers: parseInt(localStorage.getItem('seen_freelancers') || '0'),
      products: parseInt(localStorage.getItem('seen_products') || '0'),
    };
  });

  useEffect(() => {
    if (activeTab === 'registrations') {
      localStorage.setItem('seen_registrations', registrations.length.toString());
      setSeenCounts(prev => ({ ...prev, registrations: registrations.length }));
    }
    if (activeTab === 'blogs') {
      localStorage.setItem('seen_blogs', blogs.length.toString());
      setSeenCounts(prev => ({ ...prev, blogs: blogs.length }));
    }
    if (activeTab === 'freelancers') {
      localStorage.setItem('seen_freelancers', freelancers.length.toString());
      setSeenCounts(prev => ({ ...prev, freelancers: freelancers.length }));
    }
    if (activeTab === 'products') {
      localStorage.setItem('seen_products', products.length.toString());
      setSeenCounts(prev => ({ ...prev, products: products.length }));
    }
  }, [activeTab, registrations.length, blogs.length, freelancers.length, products.length]);

  const newRegistrationsCount = Math.max(0, registrations.length - seenCounts.registrations);
  const newBlogsCount = Math.max(0, blogs.length - seenCounts.blogs);
  const newFreelancersCount = Math.max(0, freelancers.length - seenCounts.freelancers);
  const newProductsCount = Math.max(0, products.length - seenCounts.products);

  const navigate = useNavigate();

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventImageUrl) return;
    setIsSubmittingEvent(true);
    const { error } = await supabase.from('events').insert([{ title: eventTitle, image_url: eventImageUrl }]);
    setIsSubmittingEvent(false);
    if (error) {
      alert("Error adding event: " + error.message);
    } else {
      alert("Event added successfully!");
      setEventTitle('');
      setEventImageUrl('');
      fetchEvents();
    }
  };

  const generatePDF = async (student, type) => {
    let finalStudent = { ...student };

    // 1. Check for Intern Number
    if (!finalStudent.intern_number) {
      const manualNum = window.prompt(`Please enter the manual Intern Number for ${student.full_name}:`, "DES/INT/2026/001");
      if (!manualNum) {
        return; // User cancelled
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('registrations')
        .update({ intern_number: manualNum })
        .eq('id', student.id);
        
      if (error) {
        alert(`Failed to save Intern Number to database! Error: ${error.message}`);
        console.error("Supabase update error:", error);
        return;
      }
      
      finalStudent.intern_number = manualNum;
      
      // Update local state so it shows in the table immediately
      setRegistrations(prev => prev.map(r => r.id === student.id ? { ...r, intern_number: manualNum } : r));
    }

    // Force sync update of selected student so the template is ready in the DOM
    flushSync(() => {
      setSelectedStudent({ ...finalStudent, type });
      setGeneratingPdf(true);
    });

    try {
      // Small delay to ensure images/fonts are fully rendered in the DOM before snapshot
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let pdfBase64 = null;
      let fileName = `${student.full_name}_${type === 'offer' ? 'Offer_Letter' : 'Certificate'}.pdf`;

      if (type === 'offer') {
        const page1 = document.getElementById('offer-page-1');
        const page2 = document.getElementById('offer-page-2');
        
        if (!page1 || !page2) throw new Error("Template not found");

        const imgData1 = await toJpeg(page1, { quality: 0.95, pixelRatio: 2 });
        const imgData2 = await toJpeg(page2, { quality: 0.95, pixelRatio: 2 });
        
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.addPage();
        pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        pdf.save(fileName);
      } else {
        const element = document.getElementById('certificate-template');
        if (!element) throw new Error("Template not found");

        const imgData = await toJpeg(element, { quality: 0.95, pixelRatio: 3 });
        
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(fileName);
      }

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to process request: " + (error.message || error));
    } finally {
      setSelectedStudent(null);
      setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setSession(session);
        fetchRegistrations();
        fetchFreelancers();
        fetchBlogs();
        fetchEvents();
        fetchProducts();
        fetchAdvertisement();
        fetchPartners();
        fetchCertificates();
        fetchTeamMembers();
        fetchColdLeads();
        fetchTeamTasks();
        fetchInternProjects();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchInternProjects = async () => {
    const { data, error } = await supabase
      .from('intern_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setInternProjects(data);
  };

  const handleAddInternProject = async (e) => {
    e.preventDefault();
    if (!ipTitle || !ipVercelLink || !ipGithubLink || !ipLinkedinImageLink) return;
    setIsSubmittingIp(true);
    const { error } = await supabase.from('intern_projects').insert([{
      title: ipTitle,
      vercel_link: ipVercelLink,
      github_link: ipGithubLink,
      linkedin_image_link: ipLinkedinImageLink
    }]);
    setIsSubmittingIp(false);
    if (error) {
      alert("Error adding intern project: " + error.message);
    } else {
      alert("Intern project added successfully!");
      setIpTitle('');
      setIpVercelLink('');
      setIpGithubLink('');
      setIpLinkedinImageLink('');
      fetchInternProjects();
    }
  };

  const handleDeleteInternProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase.from('intern_projects').delete().eq('id', id);
      if (!error) {
        setInternProjects(internProjects.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete project: " + error.message);
      }
    }
  };

  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCertificates(data);
  };

  const fetchColdLeads = async () => {
    const { data, error } = await supabase
      .from('cold_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setColdLeads(data);
  };

  const fetchTeamTasks = async () => {
    const { data, error } = await supabase
      .from('team_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTasks(data);
  };

  const formatSeconds = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '0 mins';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} mins`;
  };

  const getActiveStatus = (lastActiveAt) => {
    if (!lastActiveAt) return { label: 'Never Active', color: 'bg-gray-50 text-gray-400 border-gray-150', dotColor: 'bg-gray-300' };
    const lastActive = new Date(lastActiveAt);
    const diffMs = new Date() - lastActive;
    if (diffMs < 120000) { // 2 minutes
      return { label: 'Online Now', color: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-500', isOnline: true };
    }
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return { label: `${diffMins} mins ago`, color: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' };
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return { label: `${diffHours} hrs ago`, color: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' };
    }
    return { label: 'Offline', color: 'bg-gray-50 text-gray-400 border-gray-100', dotColor: 'bg-gray-300' };
  };

  const handleUpdateWeeklyTarget = async (memberId, newTarget) => {
    if (!newTarget || isNaN(newTarget) || parseInt(newTarget) <= 0) {
      alert("Please enter a valid target count.");
      return;
    }
    const { error } = await supabase
      .from('team_members')
      .update({ weekly_call_target: parseInt(newTarget) })
      .eq('id', memberId);
    if (error) {
      alert("Error updating weekly target: " + error.message);
    } else {
      alert("Weekly target updated successfully!");
      setEditingTargetMemberId(null);
      fetchTeamMembers();
    }
  };

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTeamMembers(data);
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!certName || !certEmail || !certCode || !certLink || !certDomain) return;
    setIsSubmittingCert(true);
    const { error } = await supabase.from('certificates').insert([{
      full_name: certName.trim(),
      email: certEmail.trim().toLowerCase(),
      certificate_code: certCode.trim(),
      domain: certDomain.trim(),
      certificate_link: certLink.trim()
    }]);
    setIsSubmittingCert(false);
    if (error) {
      alert("Error adding certificate: " + error.message);
    } else {
      alert("Certificate added successfully!");
      setCertName('');
      setCertEmail('');
      setCertCode('');
      setCertDomain('');
      setCertLink('');
      fetchCertificates();
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (!error) {
        alert("Certificate deleted!");
        fetchCertificates();
      } else {
        alert("Error deleting certificate: " + error.message);
      }
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!teamName || !teamEmail) return;
    setIsSubmittingTeam(true);
    const { error } = await supabase.from('team_members').insert([{
      full_name: teamName.trim(),
      email: teamEmail.trim().toLowerCase(),
      role: teamRole
    }]);
    setIsSubmittingTeam(false);
    if (error) {
      alert("Error adding team member: " + error.message);
    } else {
      alert("Team member added successfully!");
      setTeamName('');
      setTeamEmail('');
      setTeamRole('Member');
      fetchTeamMembers();
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (!error) {
        alert("Team member removed!");
        fetchTeamMembers();
      } else {
        alert("Error removing team member: " + error.message);
      }
    }
  };

  const handleQuickCertLink = (reg) => {
    setCertName(reg.full_name);
    setCertEmail(reg.email);
    setCertDomain(reg.domain);
    setCertCode(reg.intern_number || `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveTab('certificates');
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setRegistrations(data);
    }
  };

  const fetchFreelancers = async () => {
    const { data, error } = await supabase
      .from('freelancer_applications')
      .select('*')
      .order('applied_at', { ascending: false });
    if (!error && data) setFreelancers(data);
  };

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setBlogs(data);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setEvents(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from('partnered_companies')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPartners(data);
  };

  const fetchAdvertisement = async () => {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (!error && data && data.length > 0) {
      setCurrentAd(data[0]);
    } else {
      setCurrentAd(null);
    }
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    if (!adImageUrl) return;
    setIsSubmittingAd(true);
    const { error } = await supabase.from('advertisements').insert([{ image_url: adImageUrl, link_url: adLinkUrl }]);
    setIsSubmittingAd(false);
    if (error) {
      alert("Error updating advertisement: " + error.message);
    } else {
      alert("Advertisement updated successfully!");
      setAdImageUrl('');
      setAdLinkUrl('');
      fetchAdvertisement();
    }
  };

  const handleDeleteAd = async () => {
    if (!currentAd) return;
    if (window.confirm('Are you sure you want to delete the current advertisement?')) {
      const { error } = await supabase.from('advertisements').delete().eq('id', currentAd.id);
      if (!error) {
        setCurrentAd(null);
        alert("Advertisement removed!");
      } else {
        alert("Error removing advertisement: " + error.message);
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productTitle || !productImageUrl || !productDescription) return;
    setIsSubmittingProduct(true);
    const { error } = await supabase.from('products').insert([{ title: productTitle, image_url: productImageUrl, description: productDescription }]);
    setIsSubmittingProduct(false);
    if (error) {
      alert("Error adding product: " + error.message);
    } else {
      alert("Product added successfully!");
      setProductTitle('');
      setProductImageUrl('');
      setProductDescription('');
      fetchProducts();
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerName || !partnerLogoUrl || !partnerDescription || !partnerCategory) return;
    setIsSubmittingPartner(true);
    const { error } = await supabase.from('partnered_companies').insert([{ name: partnerName, logo_url: partnerLogoUrl, description: partnerDescription, category: partnerCategory }]);
    setIsSubmittingPartner(false);
    if (error) {
      alert("Error adding partner: " + error.message);
    } else {
      alert("Partner added successfully!");
      setPartnerName('');
      setPartnerLogoUrl('');
      setPartnerDescription('');
      setPartnerCategory('Community');
      fetchPartners();
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product: " + error.message);
      }
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) {
        setEvents(events.filter((e) => e.id !== id));
      } else {
        alert("Failed to delete event: " + error.message);
      }
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (!error) {
        setBlogs(blogs.filter((b) => b.id !== id));
      } else {
        alert("Failed to delete blog: " + error.message);
      }
    }
  };

  const handleDeletePartner = async (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      const { error } = await supabase.from('partnered_companies').delete().eq('id', id);
      if (!error) {
        setPartners(partners.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete partner: " + error.message);
      }
    }
  };

  const handleDeleteFreelancer = async (id) => {
    if (window.confirm('Are you sure you want to delete this freelancer application?')) {
      const { error } = await supabase.from('freelancer_applications').delete().eq('id', id);
      if (!error) {
        setFreelancers(freelancers.filter((f) => f.id !== id));
      } else {
        alert("Failed to delete application: " + error.message);
      }
    }
  };

  const handleUpdateFreelancerStatus = async (id, newStatus) => {
    const { error } = await supabase.from('freelancer_applications').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setFreelancers(freelancers.map((f) => f.id === id ? { ...f, status: newStatus } : f));
    } else {
      alert("Failed to update status: " + error.message);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if (window.confirm('Are you sure you want to delete this internship registration?')) {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (!error) {
        setRegistrations(registrations.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete registration: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-[#0f172a] text-white p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-xl">D</div>
            <div>
              <h1 className="font-black text-xl tracking-wide">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 font-medium">DAKH Edu Solutions</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto w-full p-6 lg:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'registrations' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users className="w-5 h-5" />
            Registrations
            {newRegistrationsCount > 0 && (
              <span className="ml-auto bg-purple-600 text-white text-xs py-0.5 px-2 rounded-full">{newRegistrationsCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'roadmap' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <MapIcon className="w-5 h-5" />
            Manage Roadmap
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'events' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Calendar className="w-5 h-5" />
            Manage Events
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'blogs' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText className="w-5 h-5" />
            Manage Blogs
            {newBlogsCount > 0 && (
              <span className="ml-auto bg-purple-600 text-white text-xs py-0.5 px-2 rounded-full">{newBlogsCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('freelancers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'freelancers' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Briefcase className="w-5 h-5" />
            Freelancers
            {newFreelancersCount > 0 && (
              <span className="ml-auto bg-purple-600 text-white text-xs py-0.5 px-2 rounded-full">{newFreelancersCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            Manage Products
            {newProductsCount > 0 && (
              <span className="ml-auto bg-purple-600 text-white text-xs py-0.5 px-2 rounded-full">{newProductsCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('advertisement')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'advertisement' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Advertisement
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'partners' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Handshake className="w-5 h-5" />
            Manage Partners
          </button>
          <button 
            onClick={() => setActiveTab('certificates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'certificates' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Award className="w-5 h-5" />
            Manage Certificates
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'team' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users className="w-5 h-5" />
            Manage Team
          </button>
          <button 
            onClick={() => setActiveTab('intern-projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'intern-projects' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <BookOpen className="w-5 h-5" />
            Intern Projects
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-grow bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 overflow-hidden">
          
          {activeTab === 'events' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Add New Event</h2>
                <p className="text-gray-500 font-medium mt-1">Publish an event image to the About Us page gallery.</p>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Event Title (Optional)</label>
                  <input 
                    type="text" 
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. DAKH Hackathon 2026"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL (Required)</label>
                  <input 
                    type="url" 
                    required
                    value={eventImageUrl}
                    onChange={(e) => setEventImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-2">Paste a direct link to the image (e.g., from Imgur, Google Drive, or Canva).</p>
                </div>
                {eventImageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                    <img src={eventImageUrl} alt="Preview" className="w-full h-auto object-cover max-h-64" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmittingEvent}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSubmittingEvent ? 'Publishing Event...' : 'Publish Event'}
                </button>
              </form>

              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Uploaded Events</h3>
                  <button onClick={fetchEvents} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4" /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {events.length === 0 ? (
                    <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">
                      No events added yet.
                    </div>
                  ) : (
                    events.map(event => (
                      <div key={event.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <img src={event.image_url} alt={event.title || 'Event'} className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                          <p className="text-white font-bold">{event.title || 'Untitled Event'}</p>
                          <p className="text-white/80 text-xs mt-1">{new Date(event.created_at).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Add New Product</h2>
                <p className="text-gray-500 font-medium mt-1">Publish a product to the "Our Products & Services" gallery.</p>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Title (Required)</label>
                  <input 
                    type="text" 
                    required
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="e.g. AI Content Generator"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL (Required)</label>
                  <input 
                    type="url" 
                    required
                    value={productImageUrl}
                    onChange={(e) => setProductImageUrl(e.target.value)}
                    placeholder="https://example.com/product-image.png"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Description (Required)</label>
                  <textarea 
                    required
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe your product or service..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none"
                  ></textarea>
                </div>
                {productImageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                    <img src={productImageUrl} alt="Preview" className="w-full h-auto object-cover max-h-64" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmittingProduct}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSubmittingProduct ? 'Publishing Product...' : 'Publish Product'}
                </button>
              </form>

              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Uploaded Products</h3>
                  <button onClick={fetchProducts} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4" /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.length === 0 ? (
                    <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">
                      No products added yet.
                    </div>
                  ) : (
                    products.map(product => (
                      <div key={product.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
                        <div className="aspect-video w-full relative bg-gray-50">
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-grow">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{product.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'partners' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Add New Partner</h2>
                <p className="text-gray-500 font-medium mt-1">Add an organization to the "Our Partnered Companies" section.</p>
              </div>

              <form onSubmit={handleAddPartner} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company/Organization Name</label>
                  <input 
                    type="text" 
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Otrumai Foundation"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={partnerDescription}
                    onChange={(e) => setPartnerDescription(e.target.value)}
                    placeholder="A short description about the partnership."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Logo URL</label>
                  <input 
                    type="url" 
                    required
                    value={partnerLogoUrl}
                    onChange={(e) => setPartnerLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select 
                    value={partnerCategory}
                    onChange={(e) => setPartnerCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-medium"
                  >
                    <option value="Community">Community (Teal)</option>
                    <option value="Tech Partner">Tech Partner (Gray)</option>
                    <option value="Placement">Placement (Red)</option>
                    <option value="EdTech">EdTech (Purple)</option>
                    <option value="Internship Partner">Internship Partner (Blue)</option>
                  </select>
                </div>
                {partnerLogoUrl && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white flex justify-center items-center h-32 w-1/2 mx-auto">
                    <img src={partnerLogoUrl} alt="Preview" className="max-w-full max-h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmittingPartner}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSubmittingPartner ? 'Adding Partner...' : 'Add Partner'}
                </button>
              </form>

              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Partners</h3>
                  <button onClick={fetchPartners} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4" /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {partners.length === 0 ? (
                    <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">
                      No partners added yet.
                    </div>
                  ) : (
                    partners.map(partner => (
                      <div key={partner.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col p-4">
                        <div className="h-20 w-full relative bg-gray-50 rounded-lg flex justify-center items-center border border-gray-100 mb-3">
                          <img src={partner.logo_url} alt={partner.name} className="max-w-[80%] max-h-[80%] object-contain" />
                        </div>
                        <div className="flex-grow">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100/50 mb-2 inline-block">
                            {partner.category}
                          </span>
                          <h4 className="font-bold text-gray-900 text-base mb-1">{partner.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{partner.description}</p>
                        </div>
                        <button 
                          onClick={() => handleDeletePartner(partner.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'intern-projects' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Manage Intern Projects</h2>
                <p className="text-gray-500 font-medium mt-1">Publish an intern's project to the Internship page.</p>
              </div>

              <form onSubmit={handleAddInternProject} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project Title</label>
                  <input 
                    type="text" 
                    required
                    value={ipTitle}
                    onChange={(e) => setIpTitle(e.target.value)}
                    placeholder="e.g. E-Commerce Dashboard"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Vercel (Live) Link</label>
                  <input 
                    type="url" 
                    required
                    value={ipVercelLink}
                    onChange={(e) => setIpVercelLink(e.target.value)}
                    placeholder="https://my-project.vercel.app"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">GitHub Repo Link</label>
                  <input 
                    type="url" 
                    required
                    value={ipGithubLink}
                    onChange={(e) => setIpGithubLink(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn Image Link</label>
                  <input 
                    type="url" 
                    required
                    value={ipLinkedinImageLink}
                    onChange={(e) => setIpLinkedinImageLink(e.target.value)}
                    placeholder="https://media.licdn.com/dms/image/..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  />
                </div>
                {ipLinkedinImageLink && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                    <img src={ipLinkedinImageLink} alt="Preview" className="w-full h-auto object-cover max-h-64" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmittingIp}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSubmittingIp ? 'Adding Project...' : 'Add Project'}
                </button>
              </form>

              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Uploaded Projects</h3>
                  <button onClick={fetchInternProjects} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4" /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {internProjects.length === 0 ? (
                    <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl text-gray-500 font-medium border border-gray-100">
                      No projects added yet.
                    </div>
                  ) : (
                    internProjects.map(project => (
                      <div key={project.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col p-4">
                        <div className="aspect-video w-full relative bg-gray-50 rounded-lg flex justify-center items-center mb-3">
                          <img src={project.linkedin_image_link} alt={project.title} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-gray-900 text-base mb-1">{project.title}</h4>
                          <div className="flex gap-2 mt-2">
                            <a href={project.vercel_link} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline">Live Demo</a>
                            <span className="text-gray-300">|</span>
                            <a href={project.github_link} target="_blank" rel="noreferrer" className="text-xs text-gray-600 hover:underline">GitHub</a>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteInternProject(project.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'advertisement' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Manage Advertisement</h2>
                <p className="text-gray-500 font-medium mt-1">Upload a 16:9 poster to display prominently on the Home page.</p>
              </div>

              {currentAd && (
                <div className="mb-10 p-6 bg-white border border-purple-200 rounded-3xl shadow-sm relative group overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Award size={20} className="text-purple-600"/> Current Live Advertisement</h3>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-4 relative">
                    <img src={currentAd.image_url} alt="Current Ad" className="w-full h-full object-cover" />
                    {currentAd.link_url && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 text-white text-sm font-medium">
                        Links to: <a href={currentAd.link_url} target="_blank" rel="noreferrer" className="text-purple-300 hover:underline">{currentAd.link_url}</a>
                      </div>
                    )}
                  </div>
                  <button onClick={handleDeleteAd} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                    <Trash2 size={18} /> Remove Live Advertisement
                  </button>
                </div>
              )}

              <div className="p-8 bg-gray-50 border border-gray-200 rounded-3xl">
                <h3 className="text-lg font-bold text-gray-900 mb-6">{currentAd ? 'Replace Advertisement' : 'Upload New Advertisement'}</h3>
                <form onSubmit={handleUpdateAd} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Image URL (Required - 16:9 Aspect Ratio)</label>
                    <input 
                      type="url" 
                      required
                      value={adImageUrl}
                      onChange={(e) => setAdImageUrl(e.target.value)}
                      placeholder="https://example.com/ad-poster.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Redirect Link (Optional)</label>
                    <input 
                      type="url" 
                      value={adLinkUrl}
                      onChange={(e) => setAdLinkUrl(e.target.value)}
                      placeholder="https://example.com/product"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                  {adImageUrl && (
                    <div className="mt-4 aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
                      <img src={adImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isSubmittingAd}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmittingAd ? 'Publishing...' : (currentAd ? 'Replace Live Advertisement' : 'Publish Advertisement')}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'blogs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Community Blogs</h2>
                  <p className="text-gray-500 font-medium mt-1">Manage all submitted blogs.</p>
                </div>
                <button onClick={fetchBlogs} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm uppercase tracking-wider">
                      <th className="p-4 font-black">Date</th>
                      <th className="p-4 font-black">Author</th>
                      <th className="p-4 font-black">Title</th>
                      <th className="p-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No blogs found.</td>
                      </tr>
                    ) : (
                      blogs.map(blog => (
                        <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-500 font-medium">{new Date(blog.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-gray-900">{blog.author_name}</td>
                          <td className="p-4 text-gray-600">{blog.title}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'freelancers' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Freelancer Applications</h2>
                  <p className="text-gray-500 font-medium mt-1">View incoming freelancer applications.</p>
                </div>
                <button onClick={fetchFreelancers} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="space-y-4">
                {freelancers.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-medium">
                    No applications yet.
                  </div>
                ) : (
                  freelancers.map(freelancer => (
                    <div key={freelancer.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{freelancer.full_name}</h3>
                          <p className="text-purple-600 font-semibold text-sm">{freelancer.college_name} ({freelancer.year_of_study}) - {freelancer.department}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <select 
                            value={freelancer.status} 
                            onChange={(e) => handleUpdateFreelancerStatus(freelancer.id, e.target.value)}
                            className={`font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider border-none cursor-pointer focus:ring-2 focus:ring-purple-300 transition-colors ${
                              freelancer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              freelancer.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                              freelancer.status === 'contacted' ? 'bg-indigo-100 text-indigo-700' :
                              freelancer.status === 'hired' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="contacted">Contacted</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button onClick={() => handleDeleteFreelancer(freelancer.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete Application">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Mail size={16} /> <a href={`mailto:${freelancer.email}`} className="hover:underline">{freelancer.email}</a></div>
                        <div className="flex items-center gap-2"><Phone size={16} /> <a href={`tel:${freelancer.phone}`} className="hover:underline">{freelancer.phone}</a></div>
                        <div className="flex items-center gap-2"><MapIcon size={16} /> {freelancer.city || 'N/A'}</div>
                        <div className="flex items-center gap-2"><Briefcase size={16} /> {freelancer.experience_level}</div>
                        <div className="flex items-center gap-2"><Clock size={16} /> {freelancer.availability}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={16} /> Applied: {new Date(freelancer.applied_at).toLocaleString()}</div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.map(s => <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">{s}</span>)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Brief Introduction:</h4>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg min-h-[4rem] whitespace-pre-wrap">{freelancer.bio || 'Not provided'}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Why DAKH?</h4>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg min-h-[4rem] whitespace-pre-wrap">{freelancer.why_dakh || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                        {freelancer.portfolio_url && <a href={freelancer.portfolio_url.startsWith('http') ? freelancer.portfolio_url : `https://${freelancer.portfolio_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"><Globe size={16} /> Portfolio</a>}
                        {freelancer.linkedin_url && <a href={freelancer.linkedin_url.startsWith('http') ? freelancer.linkedin_url : `https://${freelancer.linkedin_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"><Globe size={16} /> LinkedIn</a>}
                        {freelancer.github_url && <a href={freelancer.github_url.startsWith('http') ? freelancer.github_url : `https://${freelancer.github_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"><Globe size={16} /> GitHub</a>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'registrations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Internship Registrations</h2>
                  <p className="text-gray-500 font-medium mt-1">View and manage all student applications.</p>
                </div>
                <button onClick={fetchRegistrations} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm uppercase tracking-wider">
                      <th className="p-4 font-black">Date</th>
                      <th className="p-4 font-black">Student Name</th>
                      <th className="p-4 font-black">College</th>
                      <th className="p-4 font-black">Plan & Domain</th>
                      <th className="p-4 font-black">Contact</th>
                      <th className="p-4 font-black">UTR</th>
                      <th className="p-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No registrations found.</td>
                      </tr>
                    ) : (
                      registrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-500 font-medium">{new Date(reg.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-gray-900">{reg.full_name}</td>
                          <td className="p-4 text-sm text-gray-600">{reg.college}</td>
                          <td className="p-4">
                            <div className="text-sm font-bold text-purple-600">{reg.plan_name}</div>
                            <div className="text-xs text-gray-500 font-medium">{reg.domain}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-900">{reg.phone}</div>
                            <div className="text-xs text-gray-500">{reg.email}</div>
                          </td>
                          <td className="p-4 text-sm font-mono text-gray-600 bg-gray-50 rounded px-2">{reg.utr_number}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => generatePDF(reg, 'offer')}
                                disabled={generatingPdf}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                                title="Download Offer Letter"
                              >
                                <FileText className="w-3.5 h-3.5" /> Download
                              </button>
                              <button 
                                onClick={() => generatePDF(reg, 'certificate')}
                                disabled={generatingPdf}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                                title="Download Certificate"
                              >
                                <FileBadge className="w-3.5 h-3.5" /> Cert
                              </button>
                              <button 
                                onClick={() => handleQuickCertLink(reg)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-md transition-colors"
                                title="Add/Manage Certificate Link"
                              >
                                <Award className="w-3.5 h-3.5" /> Link
                              </button>
                              <button 
                                onClick={() => handleDeleteRegistration(reg.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-md transition-colors"
                                title="Delete Registration"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'roadmap' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Manage Roadmap</h2>
              <p className="text-gray-500 font-medium mb-6">Edit the steps displayed on the Internship page. (Coming soon)</p>
              
              <div className="p-8 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 text-center">
                <MapIcon className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-purple-900">Roadmap Editor Placeholder</h3>
                <p className="text-purple-700 mt-2">The frontend logic for editing the Roadmap steps via Supabase can be implemented here.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Manage Certificates</h2>
                  <p className="text-gray-500 font-medium mt-1">Add and manage certificate download links for interns.</p>
                </div>
                <button onClick={fetchCertificates} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4" /> Refresh
                </button>
              </div>

              {/* Form to add certificate */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Certificate Link</h3>
                <form onSubmit={handleAddCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={certEmail}
                      onChange={(e) => setCertEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Certificate Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        value={certCode}
                        onChange={(e) => setCertCode(e.target.value)}
                        placeholder="e.g. DES/INT/2026/001"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const rand = Math.floor(1000 + Math.random() * 9000);
                          setCertCode(`DES/INT/2026/${rand}`);
                        }}
                        className="px-2.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Domain / Course</label>
                    <input 
                      type="text" 
                      required
                      value={certDomain}
                      onChange={(e) => setCertDomain(e.target.value)}
                      placeholder="e.g. Web Development"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Certificate Link (URL)</label>
                    <input 
                      type="url" 
                      required
                      value={certLink}
                      onChange={(e) => setCertLink(e.target.value)}
                      placeholder="https://drive.google.com/file/... or https://supabase-storage-url.com/..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmittingCert}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingCert ? 'Adding...' : 'Add Certificate Link'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table list of certificates */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wider">
                      <th className="p-4 font-black">Name</th>
                      <th className="p-4 font-black">Email</th>
                      <th className="p-4 font-black">Code</th>
                      <th className="p-4 font-black">Domain</th>
                      <th className="p-4 font-black">Certificate Link</th>
                      <th className="p-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {certificates.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No certificates found.</td>
                      </tr>
                    ) : (
                      certificates.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{c.full_name}</td>
                          <td className="p-4 text-gray-600">{c.email}</td>
                          <td className="p-4 font-mono font-semibold text-purple-600">{c.certificate_code}</td>
                          <td className="p-4 text-gray-600">{c.domain}</td>
                          <td className="p-4">
                            <a href={c.certificate_link} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline font-medium break-all max-w-[200px] block truncate">
                              {c.certificate_link}
                            </a>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteCertificate(c.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Manage Team</h2>
                  <p className="text-gray-500 font-medium mt-1">Manage team members, monitor tracked working hours, and review cold calling progress.</p>
                </div>
                <button 
                  onClick={() => {
                    fetchTeamMembers();
                    fetchColdLeads();
                    fetchTeamTasks();
                  }} 
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-750 font-bold rounded-xl transition-colors text-sm flex items-center gap-2 cursor-pointer border border-purple-200/50"
                >
                  <Loader2 className="w-4 h-4" /> Refresh All Tracker Info
                </button>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-gray-200 mb-6 gap-2">
                <button
                  onClick={() => setTeamSubTab('tracker')}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    teamSubTab === 'tracker'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-550 hover:text-gray-900 hover:border-gray-250'
                  }`}
                >
                  <Clock className="w-4.5 h-4.5" />
                  Live Performance & Work Hours
                </button>
                <button
                  onClick={() => setTeamSubTab('directory')}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    teamSubTab === 'directory'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-555 hover:text-gray-900 hover:border-gray-250'
                  }`}
                >
                  <Users className="w-4.5 h-4.5" />
                  Team Setup & Directory
                </button>
              </div>

              {teamSubTab === 'tracker' ? (
                <div className="space-y-6">
                  {/* KPI Overview Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Members</span>
                      <h3 className="text-xl font-black text-slate-800 mt-2">{teamMembers.length} Registered</h3>
                    </div>
                    <div className="bg-green-50/40 border border-green-150 p-5 rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-green-600/80 uppercase tracking-wider block">Working Now</span>
                      <h3 className="text-xl font-black text-green-700 mt-2">
                        {teamMembers.filter(t => getActiveStatus(t.last_active_at).isOnline).length} Active
                      </h3>
                    </div>
                    <div className="bg-purple-50/40 border border-purple-150 p-5 rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-purple-600/80 uppercase tracking-wider block">Total Hours Today</span>
                      <h3 className="text-xl font-black text-purple-700 mt-2">
                        {formatSeconds(teamMembers.reduce((acc, curr) => acc + (curr.today_work_seconds || 0), 0))}
                      </h3>
                    </div>
                    <div className="bg-indigo-50/40 border border-indigo-150 p-5 rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-wider block">Logged Calls (Weekly)</span>
                      <h3 className="text-xl font-black text-indigo-700 mt-2">
                        {coldLeads.filter(l => l.status === 'Approached').length} Completed
                      </h3>
                    </div>
                  </div>

                  {/* Team Members Tracker Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teamMembers.length === 0 ? (
                      <div className="col-span-2 p-12 text-center bg-gray-50 rounded-3xl text-gray-500 font-medium border border-gray-150">
                        No team members registered yet. Set them up in the "Team Setup & Directory" tab.
                      </div>
                    ) : (
                      teamMembers.map(member => {
                        const weeklyTarget = member.weekly_call_target || 50;
                        const dailyTarget = Math.ceil(weeklyTarget / 5);

                        // Count total approached leads by this member
                        const memberCalls = coldLeads.filter(l => 
                          l.status === 'Approached' && 
                          (l.approached_by === member.full_name || l.approached_by === member.email)
                        ).length;

                        const progressPercent = Math.min(100, Math.round((memberCalls / weeklyTarget) * 100));
                        const activeInfo = getActiveStatus(member.last_active_at);

                        // Count tasks assigned to this member
                        const memberTasks = tasks.filter(t => 
                          t.assigned_to && 
                          (t.assigned_to.toLowerCase() === member.full_name.toLowerCase() || 
                           t.assigned_to.toLowerCase() === member.email.toLowerCase())
                        );
                        const completedTasks = memberTasks.filter(t => t.status === 'Completed').length;
                        const totalTasks = memberTasks.length;
                        const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                        return (
                          <div key={member.id} className="bg-white border border-gray-150 rounded-3xl p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                            <div>
                              {/* Member Header */}
                              <div className="flex justify-between items-start gap-3 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                  {/* Initials Avatar */}
                                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm uppercase transition-all ${
                                    activeInfo.isOnline 
                                      ? 'bg-green-500/10 text-green-700 ring-2 ring-green-500/30' 
                                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                  }`}>
                                    {member.full_name.substring(0, 2)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight flex items-center gap-1.5">
                                      {member.full_name}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mt-0.5">{member.role || 'Member'}</span>
                                  </div>
                                </div>

                                {/* Active Badge */}
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${activeInfo.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${activeInfo.dotColor} ${activeInfo.isOnline ? 'animate-ping' : ''}`}></span>
                                  {activeInfo.label}
                                </span>
                              </div>

                              {/* Performance Details Grid */}
                              <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100">
                                {/* Tracked Working Hours */}
                                <div className="space-y-1">
                                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Tracked Work Duration</span>
                                  <div className="text-xs font-bold text-slate-700 space-y-0.5">
                                    <div>Today: <span className="text-purple-755 font-black">{formatSeconds(member.today_work_seconds)}</span></div>
                                    <div>Weekly: <span className="text-indigo-755 font-black">{formatSeconds(member.weekly_work_seconds)}</span></div>
                                  </div>
                                </div>

                                {/* Last Active Timestamp */}
                                <div className="space-y-1">
                                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Last Active Session</span>
                                  <span className="text-xs font-bold text-slate-700 block">
                                    {member.last_active_at 
                                      ? new Date(member.last_active_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                                      : 'Never'
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* Cold Calling Goal Progress */}
                              <div className="py-4 border-b border-gray-100 space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                  <span className="flex items-center gap-1">Weekly Call Target: {memberCalls} / {weeklyTarget} approached</span>
                                  <span className="text-purple-650 font-black">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      memberCalls >= weeklyTarget 
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                        : memberCalls > 0 
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                                        : 'bg-gradient-to-r from-rose-400 to-red-500'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>

                                {/* Target Adjustment Form */}
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-[10px] text-gray-400 font-semibold">Calculated Daily Target: {dailyTarget} calls/day</span>
                                  {editingTargetMemberId === member.id ? (
                                    <div className="flex items-center gap-1.5">
                                      <input 
                                        type="number"
                                        min="1"
                                        value={newWeeklyTargetInput}
                                        onChange={(e) => setNewWeeklyTargetInput(e.target.value)}
                                        className="w-16 px-1.5 py-0.5 border border-slate-350 rounded font-bold text-center text-xs text-gray-950"
                                      />
                                      <button 
                                        onClick={() => handleUpdateWeeklyTarget(member.id, newWeeklyTargetInput)}
                                        className="px-2.5 py-0.5 bg-purple-600 text-white font-bold rounded text-[10px] hover:bg-purple-700 transition-colors cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={() => setEditingTargetMemberId(null)}
                                        className="px-2.5 py-0.5 bg-gray-100 text-gray-650 font-bold rounded text-[10px] hover:bg-gray-200 transition-colors cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setEditingTargetMemberId(member.id);
                                        setNewWeeklyTargetInput(weeklyTarget);
                                      }}
                                      className="text-[10px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                                    >
                                      Adjust Goal
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Task Progress Details */}
                              <div className="py-4 space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                  <span>Task Progress: {completedTasks} / {totalTasks} completed</span>
                                  <span className="text-indigo-600 font-black">{taskProgressPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${taskProgressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* View Calls Log Action Button */}
                            <button
                              onClick={() => setSelectedMemberForLog(member)}
                              className="w-full mt-2 py-2.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 hover:border-purple-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <PhoneCall className="w-4 h-4 text-purple-650" /> View Calls & Activity Log
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Form to add team member */}
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add Team Member</h3>
                    <form onSubmit={handleAddTeamMember} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Alice Smith"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={teamEmail}
                          onChange={(e) => setTeamEmail(e.target.value)}
                          placeholder="e.g. alice@dakhedu.com"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Role</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            required
                            value={teamRole}
                            onChange={(e) => setTeamRole(e.target.value)}
                            placeholder="e.g. Developer, Mentor"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                          />
                          <button 
                            type="submit" 
                            disabled={isSubmittingTeam}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                          >
                            {isSubmittingTeam ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Table list of team members */}
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wider">
                          <th className="p-4 font-black">Name</th>
                          <th className="p-4 font-black">Email</th>
                          <th className="p-4 font-black">Role</th>
                          <th className="p-4 font-black">Added Date</th>
                          <th className="p-4 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {teamMembers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No team members added yet.</td>
                          </tr>
                        ) : (
                          teamMembers.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 font-bold text-gray-900">{t.full_name}</td>
                              <td className="p-4 text-gray-600">{t.email}</td>
                              <td className="p-4">
                                <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                  {t.role}
                                </span>
                              </td>
                              <td className="p-4 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => handleDeleteTeamMember(t.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Call History Modal Overlay */}
              <AnimatePresence>
                {selectedMemberForLog && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-pointer"
                      onClick={() => setSelectedMemberForLog(null)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="fixed top-[10%] bottom-[10%] left-[5%] right-[5%] md:left-[10%] md:right-[10%] lg:left-[15%] lg:right-[15%] bg-white border border-slate-100 shadow-2xl rounded-3xl p-6 z-[110] text-slate-800 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-sm font-bold uppercase">
                            {selectedMemberForLog.full_name.substring(0, 2)}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">Activity Log: {selectedMemberForLog.full_name}</h3>
                            <p className="text-xs text-slate-500 font-semibold">List of cold calling approaches completed by this member.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedMemberForLog(null)}
                          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-grow overflow-y-auto my-4 pr-1">
                        {(() => {
                          const logs = coldLeads.filter(l => 
                            l.status === 'Approached' && 
                            (l.approached_by === selectedMemberForLog.full_name || 
                             l.approached_by === selectedMemberForLog.email)
                          );

                          if (logs.length === 0) {
                            return (
                              <div className="h-full flex flex-col items-center justify-center py-20 text-center text-gray-500 font-medium">
                                <AlertCircle className="w-10 h-10 text-slate-350 mb-2" />
                                No logged client approaches found for this member yet.
                              </div>
                            );
                          }

                          return (
                            <div className="overflow-x-auto rounded-2xl border border-gray-150">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-900 text-slate-100 border-b border-gray-200 uppercase tracking-wider">
                                    <th className="p-3.5 font-black whitespace-nowrap">Date</th>
                                    <th className="p-3.5 font-black whitespace-nowrap">Client Name</th>
                                    <th className="p-3.5 font-black whitespace-nowrap">Phone Number</th>
                                    <th className="p-3.5 font-black whitespace-nowrap">Category</th>
                                    <th className="p-3.5 font-black whitespace-nowrap">Pain Point / Maps</th>
                                    <th className="p-3.5 font-black whitespace-nowrap">Feedback Remarks</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                  {logs.map(lead => (
                                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                                      <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                                        {lead.approached_at 
                                          ? new Date(lead.approached_at).toLocaleDateString() 
                                          : new Date(lead.created_at).toLocaleDateString()
                                        }
                                      </td>
                                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{lead.client_name}</td>
                                      <td className="p-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                          {lead.phone_number}
                                          <a 
                                            href={`tel:${lead.phone_number}`}
                                            className="p-1 hover:bg-slate-100 rounded text-indigo-650 transition-colors"
                                            title="Call Number"
                                          >
                                            <Phone size={10} />
                                          </a>
                                        </div>
                                      </td>
                                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{lead.business_type || 'N/A'}</td>
                                      <td className="p-3.5 whitespace-nowrap">
                                        <div className="max-w-[120px] truncate text-slate-700 font-bold" title={lead.key_hook_pain_point || 'N/A'}>
                                          {lead.key_hook_pain_point || 'N/A'}
                                        </div>
                                        {lead.google_maps_link && (
                                          <a 
                                            href={lead.google_maps_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[9px] text-indigo-600 hover:underline inline-flex items-center gap-0.5 mt-0.5 font-bold"
                                          >
                                            <MapIcon size={8} /> Maps
                                          </a>
                                        )}
                                      </td>
                                      <td className="p-3.5 text-slate-600 font-medium max-w-[200px] truncate" title={lead.remarks || 'No remarks'}>
                                        {lead.remarks || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="border-t border-slate-100 pt-4 shrink-0 flex justify-end">
                        <button 
                          onClick={() => setSelectedMemberForLog(null)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Close Logs
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </main>
      </div>

      {/* HIDDEN PDF TEMPLATES (Rendered off-screen) */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -1000 }}>
        
        {/* OFFER LETTER TEMPLATE (A4 Portrait) */}
        {/* SINGLE PAGE OFFER LETTER TEMPLATE (A4 Portrait) */}
        {selectedStudent?.type === 'offer' && (() => {
          /* ── shared values ─────────────────────────────────────── */
          const PW = 794, PH = 1123;          // A4 pixel dimensions
          const SAFE = 30;                     // safe-margin (px)
          const PURPLE = '#461248';
          const GOLD   = '#f5b800';
          const BORDER = '#5a1a5e';

          /* ── Page wrapper ───────────────────────────────────────── */
          const pageStyle = {
            width: `${PW}px`, height: `${PH}px`,
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: 'Arial, Helvetica, sans-serif',
          };

          /* ── Content column (sits ABOVE all decorative layers) ─── */
          const contentStyle = {
            position: 'absolute',
            top: 0, left: 0,
            width: `${PW}px`, height: `${PH}px`,
            boxSizing: 'border-box',
            padding: `${SAFE}px`,
            display: 'flex', flexDirection: 'column',
            zIndex: 10,
          };

          /* ── Decorative layer (absolutely fills the page, z=2) ── */
          /* Full-page SVG ensures nothing ever overflows              */
          const DecorationPage1 = () => (
            <svg
              style={{ position:'absolute', top:0, left:0, zIndex:2, pointerEvents:'none', overflow:'hidden' }}
              width={PW} height={PH}
              viewBox={`0 0 ${PW} ${PH}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* outer thin border */}
              <rect x="12" y="12" width={PW-24} height={PH-24} rx="2" fill="none" stroke="#8b3a8e" strokeWidth="0.5" />
              {/* inner border */}
              <rect x="18" y="18" width={PW-36} height={PH-36} rx="2" fill="none" stroke={PURPLE} strokeWidth="1.5" />
              {/* top-right yellow triangle */}
              <polygon points={`${PW-220},0 ${PW},0 ${PW},260`} fill={GOLD} />
              {/* top-right purple triangle (sits on top of yellow) */}
              <polygon points={`${PW-180},0 ${PW},0 ${PW},220`} fill={PURPLE} />
              {/* bottom-left yellow wave */}
              <path d={`M0,${PH-100} C120,${PH-10} 300,${PH} 440,${PH} L0,${PH} Z`} fill={GOLD} />
              {/* bottom-left purple wave */}
              <path d={`M0,${PH-60} C90,${PH-5} 240,${PH} 380,${PH} L0,${PH} Z`} fill={PURPLE} />
            </svg>
          );

          const DecorationPage2 = DecorationPage1;

          /* ── Contact info row ───────────────────────────────────── */
          const ContactRow = () => (
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'1.5px', height:'58px', background:PURPLE, flexShrink:0 }} />
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                {[
                  { sym:'✉', text:'dakhedusolution@gmail.com' },
                  { sym:'✆', text:'+91 8667399640' },
                  { sym:'⊕', text:'www.dakhedusolutions.in' },
                ].map(({ sym, text }) => (
                  <div key={text} style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'10px', color:'#111111', fontWeight:700, whiteSpace:'nowrap' }}>
                    <span style={{ color:PURPLE, fontSize:'12px', fontWeight:900, lineHeight:1 }}>{sym}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          );

          /* ── Divider with diamond ───────────────────────────────── */
          const DiamondDivider = () => (
            <div style={{ position:'relative', height:'16px', width:'100%', marginBottom:'12px' }}>
              <div style={{ position:'absolute', top:'7px', left:0, right:0, height:'1px', background:PURPLE, opacity:0.25 }} />
              <div style={{
                position:'absolute', top:'4px', left:'50%',
                width:'9px', height:'9px',
                background:PURPLE,
                transform:'translateX(-50%) rotate(45deg)',
              }} />
            </div>
          );

          /* ── Sub-divider (gold ornament) ────────────────────────── */
          const GoldDivider = () => (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0', width:'280px', margin:'0 auto 14px auto', position:'relative', height:'10px' }}>
              <div style={{ flex:1, height:'1px', background:GOLD }} />
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', border:`1.5px solid ${GOLD}`, background:'#fff', flexShrink:0, margin:'0 2px' }} />
              <div style={{ width:'8px', height:'8px', background:GOLD, transform:'rotate(45deg)', flexShrink:0, margin:'0 4px' }} />
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', border:`1.5px solid ${GOLD}`, background:'#fff', flexShrink:0, margin:'0 2px' }} />
              <div style={{ flex:1, height:'1px', background:GOLD }} />
            </div>
          );

          return (
            <div id="offer-letter-template">

              {/* ═══════ PAGE 1 ═══════════════════════════════════════ */}
              <div id="offer-page-1" style={pageStyle}>
                <DecorationPage1 />

                <div style={contentStyle}>
                  {/* HEADER: logo left | contact right (max-right clipped away from triangle) */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', width:'100%' }}>
                    {/* Logo — fixed 170×64 box */}
                    <div style={{ width:'170px', height:'64px', flexShrink:0 }}>
                      <img
                        src="/companylogo.jpg"
                        alt="DAKH Edu Solutions"
                        style={{ width:'100%', height:'100%', objectFit:'contain', objectPosition:'left center', display:'block' }}
                      />
                    </div>
                    {/* Contact block: pushed left enough to clear the 220px purple triangle */}
                    <div style={{ marginRight:'240px' }}>
                      <ContactRow />
                    </div>
                  </div>

                  <DiamondDivider />

                  {/* Title */}
                  <h2 style={{ textAlign:'center', fontSize:'21px', fontWeight:'900', color:PURPLE, letterSpacing:'0.16em', textTransform:'uppercase', margin:'0 0 6px 0' }}>
                    INTERNSHIP OFFER LETTER
                  </h2>
                  <GoldDivider />

                  {/* Ref / Date row */}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#333333', marginBottom:'12px' }}>
                    <div><span style={{ color:'#888888', fontWeight:600 }}>Ref No: </span><span style={{ color:PURPLE, fontWeight:700 }}>{selectedStudent.intern_number}</span></div>
                    <div><span style={{ color:'#888888', fontWeight:600 }}>Date: </span><span style={{ color:PURPLE, fontWeight:700 }}>{new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}).toUpperCase()}</span></div>
                  </div>

                  {/* Address */}
                  <div style={{ fontSize:'11px', color:'#444444', marginBottom:'10px', lineHeight:'1.55' }}>
                    <div style={{ color:'#888888' }}>To,</div>
                    <div style={{ fontWeight:'800', fontSize:'13px', color:'#111111' }}>{selectedStudent.full_name},</div>
                    <div style={{ color:PURPLE, fontStyle:'italic', fontWeight:600 }}>{selectedStudent.college || 'Engineering College'}.</div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize:'11px', fontWeight:600, color:'#333333', marginBottom:'8px' }}>
                    Subject: <span style={{ color:PURPLE, fontWeight:700, borderBottom:`1.5px solid ${GOLD}`, paddingBottom:'1px' }}>Offer of Internship</span>
                  </div>

                  <div style={{ fontSize:'11px', fontWeight:700, color:PURPLE, marginBottom:'7px' }}>Dear Student,</div>

                  <p style={{ fontSize:'10px', color:'#555555', lineHeight:'1.65', marginBottom:'12px', textAlign:'justify', margin:'0 0 12px 0' }}>
                    We are pleased to offer you an internship opportunity with <strong>DAKH Edu Solutions</strong> as a{' '}
                    <strong style={{ color:PURPLE }}>{selectedStudent.domain} Intern</strong>. This internship is designed to provide practical exposure, hands-on learning, and real-world experience in {selectedStudent.domain}.
                  </p>

                  {/* Details Table */}
                  <div style={{ fontSize:'10px', fontWeight:700, color:PURPLE, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'6px' }}>INTERNSHIP DETAILS</div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'10px', border:`1.5px solid ${BORDER}`, borderRadius:'6px', marginBottom:'12px', overflow:'hidden' }}>
                    <thead>
                      <tr style={{ background:'#f0e8f0' }}>
                        <th style={{ padding:'7px 14px', textAlign:'left', color:PURPLE, fontWeight:700, borderBottom:`1px solid ${BORDER}`, borderRight:`1px solid ${BORDER}`, width:'44%' }}>Particulars</th>
                        <th style={{ padding:'7px 14px', textAlign:'left', color:PURPLE, fontWeight:700, borderBottom:`1px solid ${BORDER}` }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Position', 'Full Stack Intern'],
                        ['Domain', selectedStudent.domain],
                        ['Duration', '1 Month'],
                        ['Start Date', new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long'})],
                        ['End Date', new Date(Date.now()+30*24*60*60*1000).toLocaleDateString('en-GB',{day:'numeric',month:'long'})],
                        ['Mode', 'Online'],
                        ['Organization', 'DAKH Edu Solutions'],
                      ].map(([label, value], i) => (
                        <tr key={i} style={{ borderBottom:`1px solid #e8d5c8` }}>
                          <td style={{ padding:'5px 14px', fontWeight:600, color:'#333333', borderRight:`1px solid #d9c4d9` }}>{label}</td>
                          <td style={{ padding:'5px 14px', color:PURPLE, fontWeight:600, fontStyle:'italic' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Roles */}
                  <div style={{ fontSize:'10px', fontWeight:700, color:PURPLE, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'5px' }}>ROLES AND RESPONSIBILITIES</div>
                  <p style={{ fontSize:'10px', color:'#555555', marginBottom:'5px' }}>During the internship period, you will:</p>
                  <ul style={{ fontSize:'10px', color:'#555555', paddingLeft:'26px', marginBottom:'9px', lineHeight:'1.65', margin:'0 0 9px 0' }}>
                    {[
                      `Learn advanced ${selectedStudent.domain} concepts.`,
                      'Work on practical assignments and projects.',
                      'Participate in training sessions and assessments.',
                      'Submit tasks within the given timelines.',
                      'Follow organizational guidelines and professional conduct.',
                    ].map((item, i) => <li key={i} style={{ marginBottom:'2px' }}>{item}</li>)}
                  </ul>

                  <p style={{ fontSize:'10px', color:'#555555', lineHeight:'1.6', margin:'0 0 5px 0' }}>We are confident that this internship will help you enhance your technical skills and professional development.</p>
                  <p style={{ fontSize:'10px', color:'#555555', lineHeight:'1.6', margin:'0 0 0 0' }}>We welcome you to <strong style={{ color:PURPLE }}>DAKH Edu Solutions</strong> and wish you a successful learning experience.</p>

                  {/* Signature — fixed bottom clearance of 100px to stay above bottom wave */}
                  <div style={{ marginTop:'auto', display:'flex', justifyContent:'flex-end', paddingRight:'50px', paddingBottom:'100px' }}>
                    <div style={{ width:'195px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:PURPLE, marginBottom:'10px' }}>For DAKH Edu Solutions,</div>
                      <div style={{ height:'42px', display:'flex', alignItems:'flex-end', marginBottom:'4px' }}>
                        <span style={{ fontFamily:'cursive, Georgia, serif', fontSize:'30px', color:'#1a4fbc', display:'inline-block' }}>Dhivakar</span>
                      </div>
                      <div style={{ borderTop:`1.5px solid ${GOLD}`, paddingTop:'5px' }}>
                        <div style={{ fontSize:'9px', fontWeight:800, color:PURPLE, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'2px' }}>Authorized Signature</div>
                        <div style={{ fontSize:'8px', color:'#666666' }}>Name: <strong style={{ color:'#222222' }}>DAKH Edu Solutions</strong></div>
                        <div style={{ fontSize:'8px', color:'#666666' }}>Role: <strong style={{ color:'#222222' }}>Internship Coordinator</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════ PAGE 2 ═══════════════════════════════════════ */}
              <div id="offer-page-2" style={{ ...pageStyle, marginTop:'32px' }}>
                <DecorationPage2 />

                <div style={contentStyle}>
                  {/* HEADER */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', width:'100%' }}>
                    <div style={{ width:'170px', height:'64px', flexShrink:0 }}>
                      <img
                        src="/companylogo.jpg"
                        alt="DAKH Edu Solutions"
                        style={{ width:'100%', height:'100%', objectFit:'contain', objectPosition:'left center', display:'block' }}
                      />
                    </div>
                    <div style={{ marginRight:'240px' }}>
                      <ContactRow />
                    </div>
                  </div>

                  <DiamondDivider />

                  <h2 style={{ textAlign:'center', fontSize:'19px', fontWeight:'900', color:PURPLE, letterSpacing:'0.16em', textTransform:'uppercase', margin:'0 0 5px 0' }}>
                    INTERNSHIP OFFER LETTER
                  </h2>

                  {/* Gold subtitle line */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ width:'55px', height:'1px', background:GOLD }} />
                    <span style={{ fontSize:'10px', fontWeight:700, color:'#333333', whiteSpace:'nowrap' }}>(Terms, Rules, Regulations &amp; Guidelines)</span>
                    <div style={{ width:'55px', height:'1px', background:GOLD }} />
                  </div>

                  <p style={{ fontSize:'10px', color:'#444444', lineHeight:'1.6', marginBottom:'10px', fontWeight:500, textAlign:'justify', margin:'0 0 10px 0' }}>
                    Please read the following terms, rules, regulations and guidelines carefully. These are an integral part of your internship with{' '}
                    <strong style={{ color:PURPLE }}>DAKH Edu Solutions.</strong>
                  </p>

                  {/* Sections */}
                  {[
                    {
                      label: 'TERMS AND CONDITIONS',
                      items: [
                        ['Internship Nature', 'This internship is a learning and skill-development program. It does not constitute a job or employment offer.'],
                        ['Duration', 'The internship duration and schedule will be as specified in the offer letter. Any changes will be communicated by the organization.'],
                        ['Mode of Internship', 'The internship will be conducted in Online mode.'],
                        ['Learning Commitment', 'You must attend all classes, sessions, webinars, meetings or training programs arranged by the organization.'],
                      ],
                    },
                    {
                      label: 'RESPONSIBILITIES OF THE INTERN',
                      items: [
                        [null, 'Attend all scheduled classes, training sessions, webinars and seminars conducted by DAKH Edu Solutions.'],
                        [null, 'Actively participate in discussions and learning activities.'],
                        [null, 'Complete all assigned tasks, projects, worksheets or workshops within the given time period.'],
                        [null, 'Submit your work before the deadline. Late submissions may lead to negative impact on your evaluation.'],
                        [null, 'Communicate professionally and promptly in case of any doubt or clarification.'],
                        [null, 'Maintain discipline, professionalism and respect while interacting with mentors and the team.'],
                      ],
                    },
                    {
                      label: 'WORKSHOP / ASSIGNMENT POLICY',
                      items: [
                        [null, 'You will be assigned workshops, tasks or projects from time to time.'],
                        [null, 'All assignments must be completed within the stipulated time.'],
                        [null, 'Extensions will not be encouraged and may affect your overall performance.'],
                        [null, 'Quality of work is as important as timely submission.'],
                        [null, 'Failure to complete assignments or workshops may result in the intern being ineligible for the completion certificate.'],
                      ],
                    },
                    {
                      label: 'GENERAL GUIDELINES',
                      items: [
                        [null, 'Maintain confidentiality of all materials, data and information shared during the internship.'],
                        [null, 'Do not copy, share or misuse any content, code or resources provided.'],
                        [null, 'Any misconduct, inappropriate behavior or breach of guidelines may lead to immediate termination.'],
                        [null, 'The organization reserves the right to update or modify these terms at any time if required.'],
                        [null, 'Completion Certificate will be provided only after successful completion of all assigned requirements.'],
                      ],
                    },
                  ].map((section, si) => (
                    <div key={si} style={{ marginBottom:'9px' }}>
                      {/* Section heading */}
                      <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'4px' }}>
                        <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:PURPLE, flexShrink:0 }} />
                        <span style={{ fontSize:'10px', fontWeight:800, color:PURPLE, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                          {section.label}
                        </span>
                      </div>
                      {/* Section underline */}
                      <div style={{ height:'1.5px', width:'160px', background:GOLD, marginLeft:'27px', marginBottom:'5px' }} />
                      {/* Items */}
                      <div style={{ marginLeft:'27px' }}>
                        {section.items.map(([bold, text], ii) => (
                          <div key={ii} style={{ display:'flex', gap:'5px', fontSize:'9px', color:'#444444', marginBottom:'2px', lineHeight:'1.5' }}>
                            <span style={{ color:PURPLE, fontWeight:700, flexShrink:0 }}>{ii + 1}.</span>
                            <span>
                              {bold && <strong style={{ color:PURPLE }}>{bold}: </strong>}
                              {text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Contact Information Box */}
                  <div style={{ border:`1.5px solid ${PURPLE}`, borderRadius:'8px', padding:'9px 13px', marginTop:'10px', marginBottom:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'4px' }}>
                      <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:PURPLE, flexShrink:0 }} />
                      <span style={{ fontSize:'10px', fontWeight:800, color:PURPLE, textTransform:'uppercase', letterSpacing:'0.06em' }}>CONTACT INFORMATION</span>
                    </div>
                    <p style={{ fontSize:'9px', color:'#555555', marginLeft:'27px', margin:'0 0 5px 27px' }}>For any queries, assistance or support during your internship, feel free to reach out:</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', fontSize:'9px', fontWeight:700, color:PURPLE }}>
                      <span>✆ 8667399640</span>
                      <span style={{ color:'#cccccc', fontWeight:400 }}>|</span>
                      <span>✉ dakhedusolution@gmail.com</span>
                      <span style={{ color:'#cccccc', fontWeight:400 }}>|</span>
                      <span>⊕ www.dakhedusolutions.in</span>
                    </div>
                  </div>

                  {/* Closing quote — above the bottom wave */}
                  <div style={{ textAlign:'center', marginTop:'auto', paddingBottom:'90px' }}>
                    <div style={{ fontSize:'26px', color:GOLD, fontFamily:'Georgia, Times, serif', lineHeight:1 }}>&ldquo;</div>
                    <p style={{ fontSize:'11px', color:PURPLE, fontStyle:'italic', fontWeight:700, margin:'2px 0' }}>The expert in anything was once a beginner.</p>
                    <p style={{ fontSize:'11px', color:PURPLE, fontStyle:'italic', fontWeight:700, margin:'2px 0' }}>Keep learning, keep growing, and success will follow.</p>
                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'10px', marginTop:'5px' }}>
                      <div style={{ width:'38px', height:'1px', background:GOLD }} />
                      <span style={{ fontSize:'9px', color:PURPLE, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>— DAKH Edu Solutions</span>
                      <div style={{ width:'38px', height:'1px', background:GOLD }} />
                    </div>
                    <div style={{ fontSize:'26px', color:GOLD, fontFamily:'Georgia, Times, serif', lineHeight:1 }}>&rdquo;</div>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}


        {/* CERTIFICATE TEMPLATE (A4 Landscape) */}
        {selectedStudent?.type === 'certificate' && (
          <div id="certificate-template" className="bg-white text-gray-900 relative overflow-hidden" style={{ width: '297mm', height: '210mm', padding: '15mm', fontFamily: 'sans-serif' }}>
            {/* Background design elements */}
            <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
            
            <div className="border-[15px] border-double border-purple-900 h-full p-12 relative flex flex-col items-center justify-center text-center bg-white/90 backdrop-blur-sm">
              
              {/* Header */}
              <div className="absolute top-12 left-12 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                  <span className="font-black text-4xl text-white">D</span>
                </div>
                <div className="text-left">
                  <h1 className="font-black text-3xl tracking-tight text-purple-900 m-0 leading-tight">DAKH</h1>
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-sm m-0">Learn. Build. Earn.</p>
                </div>
              </div>

              <div className="absolute top-12 right-12 text-right text-sm text-gray-500 font-medium">
                Date: {new Date().toLocaleDateString()}<br/>
                Cert No: {selectedStudent.intern_number}
              </div>

              <h2 className="text-6xl font-black text-purple-900 tracking-widest mt-12 mb-4 uppercase" style={{ fontFamily: 'serif' }}>Certificate</h2>
              <h3 className="text-2xl text-purple-600 tracking-[0.3em] font-medium uppercase mb-12">of Internship Completion</h3>
              
              <p className="text-xl text-gray-600 mb-6 italic">This certificate is proudly presented to</p>
              
              <h1 className="text-5xl font-black text-gray-900 mb-6 border-b-2 border-purple-200 pb-2 px-12 inline-block">
                {selectedStudent.full_name}
              </h1>
              
              <p className="text-xl text-gray-700 max-w-3xl leading-relaxed mx-auto">
                from <span className="font-bold">{selectedStudent.college}</span>, for successfully completing a 4-week internship program at DAKH Edu Solutions in the domain of <span className="font-bold text-purple-900">{selectedStudent.domain}</span>. 
              </p>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                During this period, the candidate demonstrated exceptional dedication, skill, and a strong commitment to learning.
              </p>

              {/* Signatures */}
              <div className="mt-24 w-full flex justify-between px-20">
                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-2 w-56 mx-auto">
                    <h4 className="font-black text-xl text-purple-900 mb-1" style={{ fontFamily: 'cursive' }}>Director</h4>
                    <p className="font-bold text-gray-800">Program Director</p>
                  </div>
                </div>
                
                {/* Badge */}
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white absolute bottom-16 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 border border-white/50 rounded-full flex items-center justify-center text-white text-xs font-black text-center uppercase leading-tight">
                    Verified<br/>Intern
                  </div>
                </div>

                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-2 w-56 mx-auto">
                    <h4 className="font-black text-xl text-purple-900 mb-1" style={{ fontFamily: 'cursive' }}>Mentor</h4>
                    <p className="font-bold text-gray-800">Domain Mentor</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
