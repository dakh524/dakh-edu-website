import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Map as MapIcon, Loader2, Download, FileText, FileBadge, Mail, Phone, Globe, User, BookOpen, Clock, Calendar, Monitor, Building, ClipboardList, AlertCircle, Award, PhoneCall, Briefcase, Trash2, Edit, ShoppingBag, Image as ImageIcon, Handshake, TrendingUp, CheckCircle, CheckCircle2, CheckSquare, ListTodo, BarChart2, X, ExternalLink, GraduationCap, Search, Check, Send, Eye, IndianRupee, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { flushSync } from 'react-dom';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import AnalyticsHub from '../components/AnalyticsHub';
import EarningsManager from '../components/EarningsManager';

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');
  const [registrations, setRegistrations] = useState([]);
  const [regSubTab, setRegSubTab] = useState('registrations'); // 'registrations', 'certificates', or 'mailer'
  const [viewingDetailReg, setViewingDetailReg] = useState(null); // Full details modal for intern
  const [editingScheduleReg, setEditingScheduleReg] = useState(null);
  const [customStartInput, setCustomStartInput] = useState('');
  const [customEndInput, setCustomEndInput] = useState('');
  const [customDurationInput, setCustomDurationInput] = useState('30 Days');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Email Manager State
  const [emailTargetType, setEmailTargetType] = useState('all'); // 'all', 'approved', 'pending'
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailActionText, setEmailActionText] = useState('');
  const [emailActionUrl, setEmailActionUrl] = useState('');
  const [isSendingCustomEmail, setIsSendingCustomEmail] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState(null);

  // Search & Filter State for Registrations Hub
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [regFilterStatus, setRegFilterStatus] = useState('all'); // 'all', 'approved', 'pending'
  const [regFilterBatchDate, setRegFilterBatchDate] = useState('all'); // 'all' or specific start_date YYYY-MM-DD
  const [regFilterRegDate, setRegFilterRegDate] = useState('all'); // 'all' or specific registered date YYYY-MM-DD
  const [regFilterDomain, setRegFilterDomain] = useState('all');
  
  // Mail Outbox Logs & Resend State
  const [outboxLogs, setOutboxLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [resendingRegId, setResendingRegId] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [internProjects, setInternProjects] = useState([]);
  const [ipTitle, setIpTitle] = useState('');
  const [ipDescription, setIpDescription] = useState('');
  const [ipVercelLink, setIpVercelLink] = useState('');
  const [ipGithubLink, setIpGithubLink] = useState('');
  const [ipLinkedinImageLink, setIpLinkedinImageLink] = useState('');
  const [isSubmittingIp, setIsSubmittingIp] = useState(false);
  const [editingIpId, setEditingIpId] = useState(null);
  
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
  }, [activeTab, registrations.length, blogs.length]);

  const newRegistrationsCount = Math.max(0, registrations.length - seenCounts.registrations);
  const newBlogsCount = Math.max(0, blogs.length - seenCounts.blogs);

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

  // Helper to suggest the next unique Intern Number based on current registrations
  const getNextSuggestedInternNumber = () => {
    let maxNum = 0;
    (registrations || []).forEach(r => {
      if (r.intern_number) {
        const m = r.intern_number.match(/(\d+)$/);
        if (m) {
          const val = parseInt(m[1], 10);
          if (val > maxNum) maxNum = val;
        }
      }
    });
    const nextVal = maxNum > 0 ? maxNum + 1 : 1;
    return `DES/INT/2026/${String(nextVal).padStart(3, '0')}`;
  };

  const generatePDF = async (student, type) => {
    let finalStudent = { ...student };

    // 1. Check for Intern Number
    if (!finalStudent.intern_number) {
      const suggestedNum = getNextSuggestedInternNumber();
      const manualNum = window.prompt(
        `Please enter a unique Intern Number for ${student.full_name}:\n(Leave as suggested or customize)`,
        suggestedNum
      );
      if (!manualNum) {
        return; // User cancelled
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('registrations')
        .update({ intern_number: manualNum.trim() })
        .eq('id', student.id);
        
      if (error) {
        if (error.message && error.message.includes('unique constraint')) {
          alert(`Collision Error: Intern Number "${manualNum.trim()}" is already assigned to another student! Please enter a different unique number.`);
        } else {
          alert(`Failed to save Intern Number to database! Error: ${error.message}`);
        }
        console.error("Supabase update error:", error);
        return;
      }
      
      finalStudent.intern_number = manualNum.trim();
      
      // Update local state so it shows in the table immediately
      setRegistrations(prev => prev.map(r => r.id === student.id ? { ...r, intern_number: manualNum.trim() } : r));
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
        // Generate and download official 2-page Offer Letter from template
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          const res = await fetch(`/api/download-offer-letter?id=${student.id}`, {
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token || ''}`
            }
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
          }

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `DAKH_Offer_Letter_${(student.full_name || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (downloadErr) {
          console.error("Server offer letter download failed, falling back to client generation:", downloadErr);
          alert(`Notice: Server PDF generation error (${downloadErr.message}). Downloading standard letter.`);
        }
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
      const allowedEmails = [import.meta.env.VITE_ADMIN_EMAIL, 'ceo@dakhedusolutions.in'];
      if (!session || !allowedEmails.includes(session.user?.email)) {
        if (session && !allowedEmails.includes(session.user?.email)) {
          supabase.auth.signOut();
        }
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
      const allowedEmails = [import.meta.env.VITE_ADMIN_EMAIL, 'ceo@dakhedusolutions.in'];
      if (!session || !allowedEmails.includes(session.user?.email)) {
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
    let error;
    if (editingIpId) {
      const { error: updateError } = await supabase.from('intern_projects').update({
        title: ipTitle,
        description: ipDescription,
        vercel_link: ipVercelLink,
        github_link: ipGithubLink,
        linkedin_image_link: ipLinkedinImageLink
      }).eq('id', editingIpId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('intern_projects').insert([{
        title: ipTitle,
        description: ipDescription,
        vercel_link: ipVercelLink,
        github_link: ipGithubLink,
        linkedin_image_link: ipLinkedinImageLink
      }]);
      error = insertError;
    }
    setIsSubmittingIp(false);
    if (error) {
      alert("Error saving intern project: " + error.message);
    } else {
      alert("Intern project saved successfully!");
      setIpTitle('');
      setIpDescription('');
      setIpVercelLink('');
      setIpGithubLink('');
      setIpLinkedinImageLink('');
      setEditingIpId(null);
      fetchInternProjects();
    }
  };

  const handleEditInternProject = (project) => {
    setIpTitle(project.title);
    setIpDescription(project.description || '');
    setIpVercelLink(project.vercel_link);
    setIpGithubLink(project.github_link);
    setIpLinkedinImageLink(project.linkedin_image_link);
    setEditingIpId(project.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setActiveTab('registrations');
    setRegSubTab('certificates');
  };

  const handleOpenScheduleEditor = (reg) => {
    setEditingScheduleReg(reg);
    setCustomDurationInput(reg.internship_duration || '30 Days');
    setCustomStartInput(reg.start_date || '');
    setCustomEndInput(reg.end_date || '');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!editingScheduleReg) return;
    setIsSavingSchedule(true);

    try {
      let finalStart = customStartInput.trim();
      let finalEnd = customEndInput.trim();

      // Normalize if valid
      try {
        if (finalStart) finalStart = normaliseDateToISO(finalStart);
      } catch (_) {}

      try {
        if (!finalEnd && finalStart) {
          finalEnd = computeInclusiveEndDate(finalStart, customDurationInput);
        } else if (finalEnd) {
          finalEnd = normaliseDateToISO(finalEnd);
        }
      } catch (_) {}

      const { error } = await supabase
        .from('registrations')
        .update({
          start_date: finalStart || null,
          end_date: finalEnd || null,
          internship_duration: customDurationInput,
          is_custom_schedule: true
        })
        .eq('id', editingScheduleReg.id);

      if (error) throw error;

      // Also sync to students table if exists
      await supabase
        .from('students')
        .update({
          start_date: finalStart || null,
          end_date: finalEnd || null,
          internship_duration: customDurationInput
        })
        .eq('registration_id', editingScheduleReg.id);

      alert(`Schedule updated for ${editingScheduleReg.full_name} (${finalStart} → ${finalEnd})`);
      setEditingScheduleReg(null);
      fetchRegistrations();
    } catch (err) {
      alert("Failed to update schedule: " + err.message);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert("Please fill in both Subject and Message.");
      return;
    }

    const filtered = registrations.filter(r => {
      if (emailTargetType === 'approved') return r.status === 'Approved';
      if (emailTargetType === 'pending') return r.status !== 'Approved';
      return true;
    });

    const recipients = filtered
      .filter(r => r.email && r.email.includes('@'))
      .map(r => ({ email: r.email.trim(), name: r.full_name }));

    if (recipients.length === 0) {
      alert(`No recipients found matching target "${emailTargetType}".`);
      return;
    }

    if (!window.confirm(`Send this email to ${recipients.length} student(s) (${emailTargetType})?`)) {
      return;
    }

    setIsSendingCustomEmail(true);
    setEmailSendStatus(null);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token || ''}`
        },
        body: JSON.stringify({
          recipients,
          subject: emailSubject.trim(),
          messageText: emailMessage.trim(),
          actionUrl: emailActionUrl.trim() || null,
          actionText: emailActionText.trim() || null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch emails');
      }

      setEmailSendStatus({
        type: 'success',
        text: `Successfully sent to ${data.sentCount} out of ${data.total} recipients!`
      });
      setEmailSubject('');
      setEmailMessage('');
      setEmailActionText('');
      setEmailActionUrl('');
      fetchEmailLogs();
    } catch (err) {
      setEmailSendStatus({
        type: 'error',
        text: `Error sending emails: ${err.message}`
      });
    } finally {
      setIsSendingCustomEmail(false);
    }
  };

  const fetchEmailLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/email-logs', {
        headers: {
          'Authorization': `Bearer ${currentSession?.access_token || ''}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOutboxLogs(data.logs || []);
      }
    } catch (err) {
      console.warn("Could not fetch email logs:", err.message);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleInstantResendEmail = async (logOrReg, eventType = 'REGISTRATION_ACK') => {
    const studentName = logOrReg.full_name || logOrReg.payload?.fullName || 'Student';
    const studentEmail = logOrReg.email || logOrReg.payload?.email || '';
    const regId = logOrReg.registration_id || (logOrReg.payload ? null : logOrReg.id);
    const logId = logOrReg.payload ? logOrReg.id : null;

    let eventLabel = 'Acknowledgement Email';
    if (eventType === 'PAYMENT_APPROVED') eventLabel = 'Offer Letter Email';
    else if (eventType === 'PROJECT_REMINDER') eventLabel = 'Project Submission Reminder';
    else if (eventType === 'CERTIFICATE_DISPATCH') eventLabel = 'Certificate Delivery Email';

    if (!window.confirm(`Dispatch / Resend ${eventLabel} now to ${studentName} (${studentEmail})?`)) {
      return;
    }

    setResendingRegId(logOrReg.id);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token || ''}`
        },
        body: JSON.stringify({
          registrationId: regId || null,
          logId: logId || null,
          email: studentEmail || null,
          fullName: studentName || null,
          eventType: eventType
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email');
      }

      alert(`${eventLabel} dispatched successfully to ${studentEmail}!`);
      fetchRegistrations();
      fetchEmailLogs();
    } catch (err) {
      alert(`Error sending email: ${err.message}`);
    } finally {
      setResendingRegId(null);
    }
  };

  const handleSendProjectReminder = async (reg) => {
    if (!window.confirm(`Send 3-Day Project Submission Reminder email to ${reg.full_name} (${reg.email})?`)) {
      return;
    }
    setResendingRegId(reg.id);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token || ''}`
        },
        body: JSON.stringify({
          registrationId: reg.id,
          eventType: 'PROJECT_REMINDER'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send reminder');
      alert(`Project submission reminder sent to ${reg.email}!`);
      fetchRegistrations();
      fetchEmailLogs();
    } catch (err) {
      alert(`Error sending project reminder: ${err.message}`);
    } finally {
      setResendingRegId(null);
    }
  };

  const handleSendCertificateEmail = async (reg) => {
    if (!window.confirm(`Dispatch Official Certificate completion email to ${reg.full_name} (${reg.email})?`)) {
      return;
    }
    setResendingRegId(reg.id);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token || ''}`
        },
        body: JSON.stringify({
          registrationId: reg.id,
          eventType: 'CERTIFICATE_DISPATCH',
          fullName: reg.full_name,
          email: reg.email,
          domain: reg.domain,
          internNumber: reg.intern_number
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to dispatch certificate email');
      alert(`Certificate delivery email queued & sent to ${reg.email}!`);
      fetchRegistrations();
      fetchEmailLogs();
    } catch (err) {
      alert(`Error sending certificate email: ${err.message}`);
    } finally {
      setResendingRegId(null);
    }
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

  const [approvingId, setApprovingId] = useState(null);

  // ---------------------------------------------------------------------------
  // Date helpers (strict UTC, support both ISO "YYYY-MM-DD" and "DD MMM YYYY")
  // ---------------------------------------------------------------------------
  const MONTH_NAMES_ADMIN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /**
   * Parse a date string in either ISO (YYYY-MM-DD) or legacy (DD MMM YYYY) format.
   * Always returns a UTC midnight Date.  Throws a descriptive error on failure —
   * never silently returns Invalid Date.
   */
  const strictParseDate = (str) => {
    if (!str || typeof str !== 'string') {
      throw new Error(`Invalid date value: ${JSON.stringify(str)}`);
    }
    const s = str.trim();
    // ISO format
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (iso) {
      const [, y, m, d] = iso.map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    }
    // Legacy format: "27 Nov 2026"
    const legacy = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s);
    if (legacy) {
      const [, dayStr, monStr, yearStr] = legacy;
      const monthIdx = MONTH_NAMES_ADMIN.findIndex(mn => mn.toLowerCase() === monStr.toLowerCase());
      if (monthIdx === -1) throw new Error(`Unrecognised month "${monStr}" in date "${str}"`);
      return new Date(Date.UTC(Number(yearStr), monthIdx, Number(dayStr)));
    }
    throw new Error(`Unrecognised date format "${str}" (expected YYYY-MM-DD or DD MMM YYYY)`);
  };

  /**
   * Extract integer day count from duration strings like "30 Days" / "29 days".
   * Throws on bad format.
   */
  const strictParseDuration = (dur) => {
    const m = /^\s*(\d+)\s*days?\s*$/i.exec((dur || '').trim());
    if (!m) throw new Error(`Unrecognised duration "${dur}" (expected e.g. "30 Days")`);
    const n = Number(m[1]);
    if (n <= 0) throw new Error(`Duration must be positive, got ${n}`);
    return n;
  };

  /**
   * Compute inclusive end date (YYYY-MM-DD).
   * end = start + (durationDays - 1)
   */
  const computeInclusiveEndDate = (startStr, durationStr) => {
    const startDate = strictParseDate(startStr);
    const days      = strictParseDuration(durationStr);
    const endDate   = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + days - 1);
    const y = endDate.getUTCFullYear();
    const m = String(endDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(endDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  /**
   * Normalise any supported date string to YYYY-MM-DD.
   */
  const normaliseDateToISO = (str) => {
    const d = strictParseDate(str);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  };

  const handleApproveRegistration = async (student) => {
    // 1. Intern Number
    let internNum = student.intern_number;
    if (!internNum) {
      const suggestedNum = getNextSuggestedInternNumber();
      internNum = window.prompt(`Assign unique Intern ID for ${student.full_name}:`, suggestedNum);
      if (!internNum) return;
      internNum = internNum.trim();
    }

    // 2. Duration & start date from registration record
    const confirmedDuration = student.internship_duration || '30 Days';
    const rawStart = student.start_date || '';

    // 3. Strictly parse start date and compute the correct inclusive end date
    let confirmedStart, confirmedEnd;
    try {
      confirmedStart = normaliseDateToISO(rawStart);
      confirmedEnd   = computeInclusiveEndDate(rawStart, confirmedDuration);
    } catch (parseErr) {
      alert(`Cannot calculate schedule: ${parseErr.message}\nPlease update the registration's start date before approving.`);
      return;
    }

    // 4. If the stored end date differs from the calculated one, warn admin and get confirmation
    const storedEndRaw = student.end_date || '';
    let storedEndISO = '';
    try { storedEndISO = storedEndRaw ? normaliseDateToISO(storedEndRaw) : ''; } catch (_) { /* ignore */ }

    if (storedEndISO && storedEndISO !== confirmedEnd) {
      const proceed = window.confirm(
        `Schedule check for ${student.full_name}:\n\n` +
        `  Duration : ${confirmedDuration}\n` +
        `  Start    : ${confirmedStart}\n` +
        `  Stored end (from application) : ${storedEndISO}\n` +
        `  Calculated inclusive end      : ${confirmedEnd}\n\n` +
        `The stored end date does not match the selected duration.\n` +
        `Click OK to approve with the CALCULATED end date (${confirmedEnd}),\n` +
        `or Cancel to abort.`
      );
      if (!proceed) return;
    }

    // 5. Custom schedule confirmation
    if (student.is_custom_schedule) {
      const ok = window.confirm(
        `Student requested a custom schedule:\n` +
        `  ${confirmedDuration}  |  ${confirmedStart} → ${confirmedEnd}\n\n` +
        `Click OK to confirm this schedule for the official offer letter.`
      );
      if (!ok) return;
    }

    // 6. Final general confirmation
    if (!window.confirm(`Approve registration for ${student.full_name} and queue official Offer Letter email?`)) {
      return;
    }

    setApprovingId(student.id);

    try {
      // 7. Get authenticated session (Bearer token for API)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        alert("Authentication error: Please log in again.");
        return;
      }

      // 8. POST to API with ISO dates and computed end date
      const res = await fetch('/api/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          registrationId:    student.id,
          manualInternNumber: internNum,
          confirmedDuration,
          confirmedStartDate: confirmedStart,  // YYYY-MM-DD
          confirmedEndDate:   confirmedEnd      // YYYY-MM-DD (inclusive, calculated)
        })
      });

      // 9. Safely parse JSON response (never trust raw text)
      const rawText = await res.text();
      let result = null;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        console.error("Non-JSON API response:", rawText);
        throw new Error(
          res.status === 500
            ? "Server error (500): The database function 'approve_registration_and_enqueue_email' is missing or environment variables (SUPABASE_SECRET_KEY) are not set in Vercel."
            : `Server returned non-JSON response (${res.status}): ${rawText.slice(0, 200)}`
        );
      }

      if (!res.ok) {
        throw new Error(result?.error || 'Failed to approve registration');
      }

      alert("Registration approved! Offer letter email and portal credentials queued.");
      fetchRegistrations();
    } catch (err) {
      alert("Error approving registration: " + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if (window.confirm('Are you sure you want to delete this internship registration? This will also remove any linked intern record.')) {
      try {
        // 1. Clean up child records referencing this registration
        await supabase.from('email_outbox').delete().eq('registration_id', id);
        await supabase.from('students').delete().eq('registration_id', id);

        // 2. Delete the registration
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) throw error;

        setRegistrations(prev => prev.filter((r) => r.id !== id));
        alert("Registration and linked intern record deleted successfully!");
        fetchRegistrations();
      } catch (err) {
        alert("Failed to delete registration: " + err.message);
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
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Admin Navbar */}
      <nav className="bg-slate-900 text-white px-6 py-3.5 shadow-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md shadow-purple-500/20">D</div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                DAKH Admin Portal
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/30">Official</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Internal Management & Operations</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl font-bold transition-all text-xs border border-slate-700 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow max-w-[1500px] mx-auto w-full p-4 lg:p-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <aside className="w-full md:w-60 shrink-0 space-y-1.5">
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'registrations' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registrations</span>
            {newRegistrationsCount > 0 && (
              <span className={`ml-auto text-xs py-0.5 px-2 rounded-full font-bold ${
                activeTab === 'registrations' ? 'bg-white text-purple-700' : 'bg-purple-600 text-white'
              }`}>{newRegistrationsCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'events' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Events</span>
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'blogs' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage Blogs</span>
            {newBlogsCount > 0 && (
              <span className={`ml-auto text-xs py-0.5 px-2 rounded-full font-bold ${
                activeTab === 'blogs' ? 'bg-white text-purple-700' : 'bg-purple-600 text-white'
              }`}>{newBlogsCount}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('advertisement')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'advertisement' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Advertisement</span>
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'team' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Team</span>
          </button>
          <button 
            onClick={() => setActiveTab('intern-projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'intern-projects' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Intern Projects</span>
          </button>
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'earnings' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border-transparent' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Total Earnings</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-grow bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 lg:p-7 overflow-hidden">
          
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project Description</label>
                  <textarea
                    value={ipDescription}
                    onChange={(e) => setIpDescription(e.target.value)}
                    placeholder="Brief description of the project"
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none"
                  ></textarea>
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
                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    disabled={isSubmittingIp}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmittingIp ? 'Saving...' : (editingIpId ? 'Update Project' : 'Add Project')}
                  </button>
                  {editingIpId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setIpTitle('');
                        setIpDescription('');
                        setIpVercelLink('');
                        setIpGithubLink('');
                        setIpLinkedinImageLink('');
                        setEditingIpId(null);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
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
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditInternProject(project)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteInternProject(project.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

          {activeTab === 'registrations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Internship Management Hub</h2>
                  <p className="text-slate-500 font-medium text-sm mt-0.5">Verify students, manage schedules & dates, issue certificates, and dispatch emails.</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={fetchRegistrations} 
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-200/80 shadow-sm"
                  >
                    <Loader2 className="w-3.5 h-3.5" /> Refresh Data
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Pill Navigation */}
              <div className="flex bg-slate-100/90 p-1.5 rounded-2xl w-fit mb-6 border border-slate-200/80 shadow-inner">
                <button
                  onClick={() => setRegSubTab('registrations')}
                  className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    regSubTab === 'registrations'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>All Registrations</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] py-0.5 px-2 rounded-full font-extrabold">
                    {registrations.length}
                  </span>
                </button>
                <button
                  onClick={() => setRegSubTab('certificates')}
                  className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    regSubTab === 'certificates'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Certificate Manager</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] py-0.5 px-2 rounded-full font-extrabold">
                    {certificates.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setRegSubTab('mailer');
                    fetchEmailLogs();
                  }}
                  className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    regSubTab === 'mailer'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mail Manager & Logs</span>
                </button>
                <button
                  onClick={() => setRegSubTab('analytics')}
                  className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    regSubTab === 'analytics'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('earnings')}
                  className="py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all text-emerald-700 hover:bg-emerald-50/70 border border-transparent"
                  title="View Total Money Earned & Manage Inflows"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Total Earnings</span>
                </button>
              </div>

              {/* Sub-Tab 1: All Registrations Table */}
              {regSubTab === 'registrations' && (
                <>
                  {/* Search, Batch Split & Status Filters */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
                    <div className="relative w-full lg:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search student, college, UTR..."
                        value={regSearchTerm}
                        onChange={(e) => setRegSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Registered Date Filter */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Reg Date:</span>
                        <select
                          value={regFilterRegDate}
                          onChange={(e) => setRegFilterRegDate(e.target.value)}
                          className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Registered Dates ({registrations.length})</option>
                          {Array.from(new Set(registrations.map(r => r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : null).filter(Boolean)))
                            .sort((a, b) => b.localeCompare(a))
                            .map(dt => {
                              const count = registrations.filter(r => r.created_at && new Date(r.created_at).toISOString().split('T')[0] === dt).length;
                              const displayDate = new Date(dt + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                              return (
                                <option key={dt} value={dt}>
                                  {displayDate} ({count} registered)
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      {/* Batch Start Date Filter */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Batch Date:</span>
                        <select
                          value={regFilterBatchDate}
                          onChange={(e) => setRegFilterBatchDate(e.target.value)}
                          className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Batch Dates ({registrations.length})</option>
                          <option value="unset">Schedule Pending ({registrations.filter(r => !r.start_date).length})</option>
                          {Array.from(new Set(registrations.map(r => r.start_date).filter(Boolean))).sort().map(d => (
                            <option key={d} value={d}>
                              Batch: {d} ({registrations.filter(r => r.start_date === d).length} interns)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Domain Filter */}
                      <select
                        value={regFilterDomain}
                        onChange={(e) => setRegFilterDomain(e.target.value)}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                      >
                        <option value="all">All Domains</option>
                        {Array.from(new Set(registrations.map(r => r.domain).filter(Boolean))).sort().map(dm => (
                          <option key={dm} value={dm}>{dm}</option>
                        ))}
                      </select>

                      {/* Approval Status Filter */}
                      <select
                        value={regFilterStatus}
                        onChange={(e) => setRegFilterStatus(e.target.value)}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                      >
                        <option value="all">All Statuses ({registrations.length})</option>
                        <option value="approved">Approved Only ({registrations.filter(r => r.status === 'Approved').length})</option>
                        <option value="pending">Pending Only ({registrations.filter(r => r.status !== 'Approved').length})</option>
                      </select>
                    </div>
                  </div>

                  {/* High Quality Styled Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse min-w-[1050px]">
                      <thead>
                        <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">College & Dept</th>
                          <th className="py-3 px-4">Plan & Amount</th>
                          <th className="py-3 px-4">Internship Dates</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">UTR & Payment</th>
                          <th className="py-3 px-4 text-center">Lifecycle Emails</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {registrations
                          .filter(reg => {
                            if (regFilterStatus === 'approved' && reg.status !== 'Approved') return false;
                            if (regFilterStatus === 'pending' && reg.status === 'Approved') return false;
                            if (regFilterDomain !== 'all' && reg.domain !== regFilterDomain) return false;
                            if (regFilterBatchDate === 'unset' && reg.start_date) return false;
                            if (regFilterBatchDate !== 'all' && regFilterBatchDate !== 'unset' && reg.start_date !== regFilterBatchDate) return false;
                            if (regFilterRegDate !== 'all') {
                              const regDay = reg.created_at ? new Date(reg.created_at).toISOString().split('T')[0] : '';
                              if (regDay !== regFilterRegDate) return false;
                            }
                            if (regSearchTerm.trim()) {
                              const q = regSearchTerm.toLowerCase();
                              const nameMatch = (reg.full_name || '').toLowerCase().includes(q);
                              const collegeMatch = (reg.college || '').toLowerCase().includes(q);
                              const emailMatch = (reg.email || '').toLowerCase().includes(q);
                              const utrMatch = (reg.utr_number || '').toLowerCase().includes(q);
                              const idMatch = (reg.intern_number || '').toLowerCase().includes(q);
                              return nameMatch || collegeMatch || emailMatch || utrMatch || idMatch;
                            }
                            return true;
                          })
                          .length === 0 ? (
                          <tr>
                            <td colSpan="10" className="py-12 text-center text-slate-400 font-medium">
                              No registrations found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          registrations
                            .filter(reg => {
                              if (regFilterStatus === 'approved' && reg.status !== 'Approved') return false;
                              if (regFilterStatus === 'pending' && reg.status === 'Approved') return false;
                              if (regFilterDomain !== 'all' && reg.domain !== regFilterDomain) return false;
                              if (regFilterBatchDate === 'unset' && reg.start_date) return false;
                              if (regFilterBatchDate !== 'all' && regFilterBatchDate !== 'unset' && reg.start_date !== regFilterBatchDate) return false;
                              if (regFilterRegDate !== 'all') {
                                const regDay = reg.created_at ? new Date(reg.created_at).toISOString().split('T')[0] : '';
                                if (regDay !== regFilterRegDate) return false;
                              }
                              if (regSearchTerm.trim()) {
                                const q = regSearchTerm.toLowerCase();
                                const nameMatch = (reg.full_name || '').toLowerCase().includes(q);
                                const collegeMatch = (reg.college || '').toLowerCase().includes(q);
                                const emailMatch = (reg.email || '').toLowerCase().includes(q);
                                const utrMatch = (reg.utr_number || '').toLowerCase().includes(q);
                                const idMatch = (reg.intern_number || '').toLowerCase().includes(q);
                                return nameMatch || collegeMatch || emailMatch || utrMatch || idMatch;
                              }
                              return true;
                            })
                            .map(reg => (
                            <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Date */}
                              <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                                {new Date(reg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>

                              {/* Student */}
                              <td 
                                className="py-3.5 px-4 cursor-pointer group"
                                onClick={() => setViewingDetailReg(reg)}
                                title="Click to view full student profile & registration details"
                              >
                                <div className="font-extrabold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                                  <span>{reg.full_name}</span>
                                  <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                {reg.intern_number ? (
                                  <div className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60 w-fit mt-0.5 font-bold">
                                    {reg.intern_number}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400">ID unassigned</span>
                                )}
                              </td>

                              {/* College & Dept */}
                              <td className="py-3.5 px-4 max-w-[190px]">
                                <div className="font-bold text-slate-800 truncate" title={reg.college || 'N/A'}>
                                  {reg.college || 'N/A'}
                                </div>
                                <div className="text-slate-500 text-[11px] truncate">
                                  {reg.department || '-'} {reg.year_of_study ? `(${reg.year_of_study})` : ''}
                                </div>
                              </td>

                              {/* Plan & Amount */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-bold text-purple-700 text-xs">{reg.plan_name}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    ₹{reg.plan_price || 'Free'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">({reg.domain})</span>
                                </div>
                              </td>

                              {/* Internship Dates */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-purple-600" />
                                    {reg.internship_duration || '30 Days'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium mt-1">
                                  {reg.start_date && reg.end_date ? (
                                    <span>
                                      <strong className="text-slate-900">{reg.start_date}</strong> <span className="text-slate-400">→</span> <strong className="text-slate-900">{reg.end_date}</strong>
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 italic font-semibold">Schedule Pending</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenScheduleEditor(reg)}
                                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200/80 transition-colors shadow-2xs"
                                >
                                  <Edit className="w-2.5 h-2.5" /> Edit Dates
                                </button>
                              </td>

                              {/* Contact */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-800 text-xs">{reg.phone}</div>
                                <div className="text-slate-500 text-[11px] max-w-[170px] truncate" title={reg.email}>{reg.email}</div>
                              </td>

                              {/* UTR & Payment */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] w-fit">
                                  {reg.utr_number || 'PENDING'}
                                </div>
                                {reg.payment_completed ? (
                                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                                    ● Paid
                                  </span>
                                ) : (
                                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                                    ○ Unpaid
                                  </span>
                                )}
                              </td>

                              {/* Lifecycle Emails (Ack, Offer, Reminder, Cert) */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1.5 min-w-[210px]">
                                  {/* 1. Ack Mail */}
                                  <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                                    <span className="font-bold text-slate-600">1. Ack:</span>
                                    {reg.reg_email_status === 'sent' ? (
                                      <span className="font-extrabold text-emerald-700 flex items-center gap-0.5">
                                        <CheckCircle className="w-2.5 h-2.5" /> Sent
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <span className="text-amber-700 font-semibold">Pending</span>
                                        <button
                                          type="button"
                                          onClick={() => handleInstantResendEmail(reg, 'REGISTRATION_ACK')}
                                          disabled={resendingRegId === reg.id}
                                          className="text-[9px] font-bold text-purple-700 hover:text-purple-900 bg-white px-1.5 py-0.2 rounded border border-purple-200 shadow-2xs"
                                        >
                                          Send
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* 2. Offer Mail */}
                                  <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                                    <span className="font-bold text-slate-600">2. Offer:</span>
                                    {reg.approval_email_status === 'sent' ? (
                                      <span className="font-extrabold text-emerald-700 flex items-center gap-0.5">
                                        <CheckCircle className="w-2.5 h-2.5" /> Sent
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-medium">{reg.status === 'Approved' ? 'Pending' : 'Unapproved'}</span>
                                        {reg.status === 'Approved' && (
                                          <button
                                            type="button"
                                            onClick={() => handleInstantResendEmail(reg, 'PAYMENT_APPROVED')}
                                            disabled={resendingRegId === reg.id}
                                            className="text-[9px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-1.5 py-0.2 rounded border border-indigo-200 shadow-2xs"
                                          >
                                            Send
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* 3. 3-Day Project Reminder */}
                                  <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                                    <span className="font-bold text-slate-600">3. Reminder:</span>
                                    {reg.reminder_email_status === 'sent' ? (
                                      <span className="font-extrabold text-emerald-700 flex items-center gap-0.5">
                                        <CheckCircle className="w-2.5 h-2.5" /> Sent
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <span className="text-amber-700 font-semibold">Pending</span>
                                        <button
                                          type="button"
                                          onClick={() => handleSendProjectReminder(reg)}
                                          disabled={resendingRegId === reg.id}
                                          className="text-[9px] font-bold text-amber-700 hover:text-amber-900 bg-white px-1.5 py-0.2 rounded border border-amber-300 shadow-2xs"
                                          title="Send 3-Day Project Submission Reminder Email"
                                        >
                                          Send
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* 4. Certificate Mail */}
                                  <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                                    <span className="font-bold text-slate-600">4. Cert:</span>
                                    {reg.cert_email_status === 'sent' ? (
                                      <span className="font-extrabold text-emerald-700 flex items-center gap-0.5">
                                        <CheckCircle className="w-2.5 h-2.5" /> Sent
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-medium">Pending</span>
                                        <button
                                          type="button"
                                          onClick={() => handleSendCertificateEmail(reg)}
                                          disabled={resendingRegId === reg.id}
                                          className="text-[9px] font-bold text-purple-700 hover:text-purple-900 bg-white px-1.5 py-0.2 rounded border border-purple-200 shadow-2xs"
                                          title="Dispatch Certificate Completion Email"
                                        >
                                          Send
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Approval Status */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                  reg.status === 'Approved' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {reg.status || 'Pending'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {reg.status !== 'Approved' && (
                                    <button 
                                      onClick={() => handleApproveRegistration(reg)}
                                      disabled={approvingId === reg.id}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 shadow-sm"
                                      title="Verify Payment & Queue Offer Letter"
                                    >
                                      {approvingId === reg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => generatePDF(reg, 'offer')}
                                    disabled={generatingPdf}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 border border-indigo-100"
                                    title="Download Official Offer Letter PDF"
                                  >
                                    <FileText className="w-3 h-3" /> Offer
                                  </button>
                                  <button 
                                    onClick={() => handleQuickCertLink(reg)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition-colors border border-purple-100"
                                    title="Assign / Add Certificate Link"
                                  >
                                    <Award className="w-3 h-3" /> Cert
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteRegistration(reg.id)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors border border-rose-100"
                                    title="Delete Record"
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

                  {/* Modal for viewing full Intern Profile & Registration Details */}
                  {viewingDetailReg && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                              {(viewingDetailReg.full_name || 'I').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                {viewingDetailReg.full_name}
                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                                  viewingDetailReg.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {viewingDetailReg.status || 'Pending'}
                                </span>
                              </h3>
                              <p className="text-xs font-mono text-purple-700 font-bold mt-0.5">
                                {viewingDetailReg.intern_number ? `Intern ID: ${viewingDetailReg.intern_number}` : 'Intern ID: Not Assigned Yet'}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setViewingDetailReg(null)} 
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Grid Details */}
                        <div className="space-y-6">
                          {/* Academic & Domain Info */}
                          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4 text-purple-600" /> Academic & Domain Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">College Name</span>
                                <span className="text-slate-900 font-bold">{viewingDetailReg.college || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Department & Year</span>
                                <span className="text-slate-900 font-bold">
                                  {viewingDetailReg.department || '—'} {viewingDetailReg.year_of_study ? `(${viewingDetailReg.year_of_study})` : ''}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Internship Domain</span>
                                <span className="text-purple-700 font-bold">{viewingDetailReg.domain || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Internship Mode</span>
                                <span className="text-slate-900 font-bold">{viewingDetailReg.mode || 'Online'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Schedule & Batch */}
                          <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60">
                            <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-purple-600" /> Schedule & Batch Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Duration</span>
                                <span className="text-slate-900 font-bold">{viewingDetailReg.internship_duration || '30 Days'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Start Date</span>
                                <span className="text-slate-900 font-bold">{viewingDetailReg.start_date || 'Schedule Pending'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">End Date</span>
                                <span className="text-slate-900 font-bold">{viewingDetailReg.end_date || 'Schedule Pending'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Registered On</span>
                                <span className="text-slate-900 font-bold">
                                  {viewingDetailReg.created_at ? new Date(viewingDetailReg.created_at).toLocaleString('en-IN') : '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact & Payment Info */}
                          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                              <ShoppingBag className="w-4 h-4 text-purple-600" /> Contact & Payment Verification
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Student Email</span>
                                <span className="text-slate-900 font-bold select-all">{viewingDetailReg.email || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Phone Number</span>
                                <span className="text-slate-900 font-bold select-all">{viewingDetailReg.phone || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Selected Plan & Price</span>
                                <span className="text-slate-900 font-bold">
                                  {viewingDetailReg.plan_name || 'Standard'} (₹{viewingDetailReg.plan_price || '0'})
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Payment UTR / Status</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                                    {viewingDetailReg.utr_number || 'PENDING'}
                                  </span>
                                  {viewingDetailReg.payment_completed ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      ● Paid
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                      ○ Unpaid
                                    </span>
                                  )}
                                </div>
                              </div>
                              {viewingDetailReg.referral_code && (
                                <div>
                                  <span className="text-slate-400 block font-semibold mb-0.5">Referral Code</span>
                                  <span className="text-purple-700 font-bold">{viewingDetailReg.referral_code}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-slate-400 block font-semibold mb-0.5">Registration UUID</span>
                                <span className="text-slate-500 font-mono text-[10px] select-all block truncate">
                                  {viewingDetailReg.id}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Lifecycle Email Dispatch Status in Modal */}
                          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                            <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-purple-600" /> 4-Stage Lifecycle Email Status
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              {/* Stage 1 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <div className="font-extrabold text-slate-800">1. Registration Ack</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {viewingDetailReg.reg_email_status === 'sent' ? (
                                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Sent
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 font-semibold">Pending / Unsent</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleInstantResendEmail(viewingDetailReg, 'REGISTRATION_ACK')}
                                  disabled={resendingRegId === viewingDetailReg.id}
                                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200"
                                >
                                  {viewingDetailReg.reg_email_status === 'sent' ? 'Resend' : 'Send Now'}
                                </button>
                              </div>

                              {/* Stage 2 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <div className="font-extrabold text-slate-800">2. Offer Letter & Login</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {viewingDetailReg.approval_email_status === 'sent' ? (
                                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Sent
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-semibold">{viewingDetailReg.status === 'Approved' ? 'Pending' : 'Requires Approval'}</span>
                                    )}
                                  </div>
                                </div>
                                {viewingDetailReg.status === 'Approved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleInstantResendEmail(viewingDetailReg, 'PAYMENT_APPROVED')}
                                    disabled={resendingRegId === viewingDetailReg.id}
                                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200"
                                  >
                                    {viewingDetailReg.approval_email_status === 'sent' ? 'Resend' : 'Send Now'}
                                  </button>
                                )}
                              </div>

                              {/* Stage 3 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <div className="font-extrabold text-slate-800">3. Project Submission Reminder</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {viewingDetailReg.reminder_email_status === 'sent' ? (
                                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Sent (3-day reminder)
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 font-semibold">Scheduled 3 days prior</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSendProjectReminder(viewingDetailReg)}
                                  disabled={resendingRegId === viewingDetailReg.id}
                                  className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300"
                                >
                                  {viewingDetailReg.reminder_email_status === 'sent' ? 'Resend' : 'Send Reminder'}
                                </button>
                              </div>

                              {/* Stage 4 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <div className="font-extrabold text-slate-800">4. Completion Certificate</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {viewingDetailReg.cert_email_status === 'sent' ? (
                                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Sent
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-semibold">Pending completion</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSendCertificateEmail(viewingDetailReg)}
                                  disabled={resendingRegId === viewingDetailReg.id}
                                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200"
                                >
                                  {viewingDetailReg.cert_email_status === 'sent' ? 'Resend' : 'Send Cert Mail'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
                          {viewingDetailReg.status !== 'Approved' && (
                            <button
                              onClick={() => {
                                const target = viewingDetailReg;
                                setViewingDetailReg(null);
                                handleApproveRegistration(target);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve Registration
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const target = viewingDetailReg;
                              generatePDF(target, 'offer');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors border border-indigo-200"
                          >
                            <FileText className="w-3.5 h-3.5" /> Download Offer Letter
                          </button>
                          <button
                            onClick={() => {
                              const target = viewingDetailReg;
                              setViewingDetailReg(null);
                              handleOpenScheduleEditor(target);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors border border-purple-200"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit Dates
                          </button>
                          <button
                            onClick={() => setViewingDetailReg(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal for editing Start/End Date */}
                  {editingScheduleReg && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-black text-slate-900">Edit Internship Schedule</h3>
                          <button onClick={() => setEditingScheduleReg(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 mb-4">
                          <p className="text-xs text-purple-900 font-bold">{editingScheduleReg.full_name}</p>
                          <p className="text-[11px] text-purple-700">{editingScheduleReg.domain} • {editingScheduleReg.college}</p>
                        </div>
                        <form onSubmit={handleSaveSchedule} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Internship Duration</label>
                            <select
                              value={customDurationInput}
                              onChange={(e) => {
                                setCustomDurationInput(e.target.value);
                                if (customStartInput) {
                                  try {
                                    setCustomEndInput(computeInclusiveEndDate(customStartInput, e.target.value));
                                  } catch (_) {}
                                }
                              }}
                              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                            >
                              <option value="15 Days">15 Days</option>
                              <option value="30 Days">30 Days (1 Month)</option>
                              <option value="45 Days">45 Days</option>
                              <option value="60 Days">60 Days (2 Months)</option>
                              <option value="90 Days">90 Days (3 Months)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
                            <input
                              type="date"
                              required
                              value={customStartInput}
                              onChange={(e) => {
                                setCustomStartInput(e.target.value);
                                if (e.target.value) {
                                  try {
                                    setCustomEndInput(computeInclusiveEndDate(e.target.value, customDurationInput));
                                  } catch (_) {}
                                }
                              }}
                              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date (Auto-calculated / Editable)</label>
                            <input
                              type="date"
                              required
                              value={customEndInput}
                              onChange={(e) => setCustomEndInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                            />
                          </div>
                          <div className="flex gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingScheduleReg(null)}
                              className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingSchedule}
                              className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white transition-colors disabled:opacity-50 shadow-sm"
                            >
                              {isSavingSchedule ? 'Saving...' : 'Save Schedule'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Sub-Tab 2: Certificate Manager */}
              {regSubTab === 'certificates' && (
                <div>
                  {/* Form to add certificate */}
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add or Update Certificate Link</h3>
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
                          list="admin-cert-domains"
                          value={certDomain}
                          onChange={(e) => setCertDomain(e.target.value)}
                          placeholder="e.g. Web Development"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                        />
                        <datalist id="admin-cert-domains">
                          <option value="Vibe Coding" />
                          <option value="Web Development" />
                          <option value="Generative AI" />
                          <option value="Full Stack Development" />
                          <option value="AI & Machine Learning" />
                          <option value="App Development" />
                          <option value="UI/UX Design" />
                          <option value="Data Science" />
                          <option value="Python Full Stack" />
                        </datalist>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Certificate Link (Google Drive / Cloud Storage URL)</label>
                        <input 
                          type="url" 
                          required
                          value={certLink}
                          onChange={(e) => setCertLink(e.target.value)}
                          placeholder="https://drive.google.com/file/... or https://storage.googleapis.com/..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                        />
                      </div>
                      <div className="md:col-span-2 pt-2">
                        <button 
                          type="submit" 
                          disabled={isSubmittingCert}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingCert ? 'Adding...' : 'Add / Update Certificate Link'}
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
                </div>
              )}

              {/* Sub-Tab 3: Custom Mail Manager & Live Outbox Logs */}
              {regSubTab === 'mailer' && (
                <div className="space-y-8">
                  {/* Section A: Live Email Outbox Activity & Status */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                          Live Email Outbox Status (System Automated & Manual)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          View which emails went through Resend, which failed, and reason if not sent.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchEmailLogs}
                        disabled={isLoadingLogs}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 w-fit disabled:opacity-50"
                      >
                        <Loader2 className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                        Refresh Logs
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3">Queued Time</th>
                            <th className="py-2.5 px-3">Student / Recipient</th>
                            <th className="py-2.5 px-3">Email Type</th>
                            <th className="py-2.5 px-3">Delivery Status</th>
                            <th className="py-2.5 px-3">Resend ID / Error Reason</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {outboxLogs.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-6 text-center text-slate-400">
                                {isLoadingLogs ? 'Loading email delivery logs...' : 'No email outbox activity recorded yet.'}
                              </td>
                            </tr>
                          ) : (
                            outboxLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50/60">
                                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                                  {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-slate-900">{log.payload?.fullName || 'N/A'}</div>
                                  <div className="text-[11px] text-slate-500">{log.payload?.email}</div>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                                    {log.event_type}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  {log.status === 'sent' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Sent Successfully
                                    </span>
                                  ) : log.status === 'failed' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                      <AlertCircle className="w-3 h-3 text-rose-600" /> Failed ({log.attempts} attempts)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                      <Clock className="w-3 h-3 text-amber-600" /> {log.status || 'pending'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  {log.last_error ? (
                                    <span className="text-rose-600 text-[11px] font-mono break-all line-clamp-2" title={log.last_error}>
                                      {log.last_error}
                                    </span>
                                  ) : log.provider_id ? (
                                    <span className="text-slate-400 text-[10px] font-mono">
                                      Resend: {log.provider_id}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] italic">In Queue</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleInstantResendEmail(log, log.event_type)}
                                    disabled={resendingRegId === (log.registration_id || log.id)}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-50 border ${
                                      log.status === 'sent'
                                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-xs'
                                    }`}
                                    title={log.status === 'sent' ? 'Resend this email' : 'Retry sending email now'}
                                  >
                                    {resendingRegId === (log.registration_id || log.id) ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    {log.status === 'sent' ? 'Resend' : 'Send Now'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section B: Compose Custom Mail Announcement */}
                  <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl">
                    <div className="mb-6">
                      <h3 className="text-base font-black text-slate-900">Compose & Send Mail to Interns</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Send custom instructions, reminders, or welcome letters directly to registered students.</p>
                    </div>

                    {emailSendStatus && (
                      <div className={`p-4 rounded-xl mb-6 text-xs font-bold ${
                        emailSendStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {emailSendStatus.text}
                      </div>
                    )}

                    <form onSubmit={handleSendCustomEmail} className="space-y-4 max-w-2xl">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Target Audience</label>
                        <select
                          value={emailTargetType}
                          onChange={(e) => setEmailTargetType(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                        >
                          <option value="all">All Registrations ({registrations.length} students)</option>
                          <option value="approved">Approved Interns Only ({registrations.filter(r => r.status === 'Approved').length} students)</option>
                          <option value="pending">Pending Registrations Only ({registrations.filter(r => r.status !== 'Approved').length} students)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Email Subject</label>
                        <input
                          type="text"
                          required
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="e.g. Important Update Regarding Your Internship Onboarding"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Message Content</label>
                        <textarea
                          rows={6}
                          required
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          placeholder="Type the message or instructions you want to convey to the students..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Action Button Text (Optional)</label>
                          <input
                            type="text"
                            value={emailActionText}
                            onChange={(e) => setEmailActionText(e.target.value)}
                            placeholder="e.g. Join WhatsApp Group / Open LMS"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Action Button URL (Optional)</label>
                          <input
                            type="url"
                            value={emailActionUrl}
                            onChange={(e) => setEmailActionUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSendingCustomEmail}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-xs shadow-sm"
                        >
                          {isSendingCustomEmail ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending Emails...
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" /> Send Email Announcement
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Full Analytics Hub (Domain Pie, Daily Timeline Bar, Mail Dispatch & Student Portal Preview) */}
              {regSubTab === 'analytics' && (
                <AnalyticsHub
                  registrations={registrations}
                  certificates={certificates}
                  outboxLogs={outboxLogs}
                  onResendEmail={handleInstantResendEmail}
                  onFilterDomainInTable={(domain) => {
                    setRegFilterDomain(domain);
                    setRegSubTab('registrations');
                  }}
                />
              )}
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

          {activeTab === 'earnings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EarningsManager registrations={registrations} />
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
