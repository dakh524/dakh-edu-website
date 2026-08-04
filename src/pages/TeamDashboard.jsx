import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Map as MapIcon, Loader2, Award, Briefcase, Trash2, 
  FileBadge, FileText, Mail, Phone, Calendar, ClipboardList, ListTodo, 
  Plus, CheckSquare, Search, X, ExternalLink, AlertCircle, CheckCircle2, 
  XCircle, Clock, Filter, Copy, Check, TrendingUp, PieChart, BarChart2, UserCircle, BookOpen, ImageIcon, Handshake 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamStudentManager from '../components/TeamStudentManager';
import AdminLMSManager from '../components/AdminLMSManager';

const TeamDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamMemberData, setTeamMemberData] = useState(null);
  const [activeTab, setActiveTab] = useState('intern-projects');
  const [registrations, setRegistrations] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  // CRM & Drawer state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newInternNumber, setNewInternNumber] = useState('');
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);

  // Certificate management state
  const [certName, setCertName] = useState('');
  const [certEmail, setCertEmail] = useState('');
  const [certCode, setCertCode] = useState('');
  const [certDomain, setCertDomain] = useState('');
  const [certLink, setCertLink] = useState('');
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // Advertisement state
  const [currentAd, setCurrentAd] = useState(null);
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Partners state
  const [partners, setPartners] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerDescription, setPartnerDescription] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Community');
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Weekly tasks management state
  const [teamMembers, setTeamMembers] = useState([]);

  // Intern Projects Management State
  const [internProjects, setInternProjects] = useState([]);
  const [ipTitle, setIpTitle] = useState('');
  const [ipDesc, setIpDesc] = useState('');
  const [ipVercelLink, setIpVercelLink] = useState('');
  const [ipGithubLink, setIpGithubLink] = useState('');
  const [ipLinkedinLink, setIpLinkedinLink] = useState('');
  const [isSubmittingIp, setIsSubmittingIp] = useState(false);
  const [editingIp, setEditingIp] = useState(null);

  // Products & Services Management State
  const [products, setProducts] = useState([]);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // 1. Verify session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/team/login');
      } else {
        setSession(session);
        verifyTeamAccess(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/team/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const verifyTeamAccess = async (email) => {
    try {
      const { data: teamMember, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!teamMember) {
        // Not a team member, log out
        await supabase.auth.signOut();
        alert("Access Denied: You are not authorized on the team table. Logging out.");
        navigate('/team/login');
      } else {
        setTeamMemberData(teamMember);
        // Load data
        fetchRegistrations();
        fetchFreelancers();
        fetchCertificates();
        fetchTeamMembers();
        fetchInternProjects();
        fetchProducts();
        fetchEvents();
        fetchPartners();
        fetchAdvertisement();
      }
    } catch (err) {
      console.error(err);
      await supabase.auth.signOut();
      navigate('/team/login');
    } finally {
      setLoading(false);
    }
  };


  // Background activity and working hours tracker
  useEffect(() => {
    if (!teamMemberData?.id) return;

    const intervalTime = 30000; // 30 seconds

    const timer = setInterval(async () => {
      // Only track if document tab is active/focused
      if (document.hasFocus()) {
        try {
          const { data: latest } = await supabase
            .from('team_members')
            .select('today_work_seconds, weekly_work_seconds')
            .eq('id', teamMemberData.id)
            .maybeSingle();

          const nextToday = (latest?.today_work_seconds || 0) + 30;
          const nextWeekly = (latest?.weekly_work_seconds || 0) + 30;

          await supabase
            .from('team_members')
            .update({
              today_work_seconds: nextToday,
              weekly_work_seconds: nextWeekly,
              last_active_at: new Date().toISOString()
            })
            .eq('id', teamMemberData.id);

          setTeamMemberData(prev => prev ? {
            ...prev,
            today_work_seconds: nextToday,
            weekly_work_seconds: nextWeekly,
            last_active_at: new Date().toISOString()
          } : null);
        } catch (err) {
          console.error("Failed to update active work duration:", err);
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [teamMemberData?.id]);


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

  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCertificates(data);
  };

  const fetchInternProjects = async () => {
    const { data, error } = await supabase.from('intern_projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setInternProjects(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('full_name', { ascending: true });
    if (!error && data) setTeamMembers(data);
  };


  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    setIsSubmittingTask(true);
    
    const isCeo = ['ceo', 'managing director', 'admin'].includes(teamMemberData?.role?.toLowerCase()) || teamMemberData?.email === 'ceo@dakhedusolutions.in';
    const initialStatus = isCeo ? 'To Do' : 'Pending Approval';

    const { error } = await supabase
      .from('team_tasks')
      .insert([{
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assigned_to: taskAssignedTo,
        due_date: taskDueDate || null,
        priority: taskPriority,
        status: initialStatus,
        created_by: session.user.email
      }]);
    setIsSubmittingTask(false);
    if (error) {
      alert("Error adding task: " + error.message);
    } else {
      if (isCeo) {
        alert("Task added successfully!");
      } else {
        alert("Task submitted! It will appear on the board once approved by the CEO.");
      }
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignedTo('');
      setTaskDueDate('');
      setTaskPriority('Medium');
    }
  };

  const handleUpdateTaskStatus = async (id, status) => {
    const { error } = await supabase
      .from('team_tasks')
      .update({ status })
      .eq('id', id);
    if (error) {
      alert("Error updating task status: " + error.message);
    } else {
    }
  };

  const handleApproveTask = async (id) => {
    const { error } = await supabase
      .from('team_tasks')
      .update({ status: 'To Do' })
      .eq('id', id);
    if (error) {
      alert("Error approving task: " + error.message);
    } else {
    }
  };

  const handleRejectTask = async (id) => {
    if (window.confirm("Are you sure you want to reject and delete this task?")) {
      const { error } = await supabase
        .from('team_tasks')
        .delete()
        .eq('id', id);
      if (error) {
        alert("Error rejecting task: " + error.message);
      } else {
      }
    }
  };

  const handleAddColdLead = async (e) => {
    e.preventDefault();
    if (!leadPhone || !leadName) {
      alert("Please enter Business Name and Phone number.");
      return;
    }
    const finalAssignee = selectedAssignee || teamMemberData.full_name;
    setIsSubmittingLead(true);
    const { error } = await supabase
      .from('cold_leads')
      .insert([{
        client_name: leadName.trim(),
        phone_number: leadPhone.trim(),
        business_type: leadCategory.trim() || null,
        location: leadLocation.trim() || null,
        rating: leadRating.trim() || null,
        reviews: leadReviews.trim() || null,
        website: leadWebsite.trim() || null,
        priority: leadPriority,
        call_or_not: leadCallOrNot,
        website_type_needed: leadWebsiteType.trim() || null,
        suggested_price: leadSuggestedPrice.trim() || null,
        key_hook_pain_point: leadKeyHook.trim() || null,
        google_maps_link: leadGoogleMaps.trim() || null,
        assigned_to: finalAssignee,
        status: 'Pending'
      }]);
    setIsSubmittingLead(false);
    if (error) {
      alert("Error adding lead: " + error.message);
    } else {
      alert("Lead added successfully!");
      setLeadName('');
      setLeadPhone('');
      setLeadCategory('');
      setLeadLocation('');
      setLeadRating('');
      setLeadReviews('');
      setLeadWebsite('');
      setLeadPriority('High');
      setLeadCallOrNot('Yes - Call');
      setLeadWebsiteType('');
      setLeadSuggestedPrice('');
      setLeadKeyHook('');
      setLeadGoogleMaps('');
      fetchInternProjects();
        fetchProducts();
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        if (lines.length < 2) {
          alert("CSV is empty or invalid.");
          return;
        }

        const parsedLeads = [];
        let headerIndex = -1;
        
        const parseRow = (textLine) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let idx = 0; idx < textLine.length; idx++) {
            const char = textLine[idx];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^"|"$/g, ''));
          return result;
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = parseRow(line);

          if (headerIndex === -1) {
            const hasBusiness = cols.some(c => c.toLowerCase().includes('business name'));
            const hasPhone = cols.some(c => c.toLowerCase().includes('phone'));
            if (hasBusiness || hasPhone) {
              headerIndex = i;
            }
            continue;
          }

          const client_name = cols[0] || '';
          const phone_number = cols[2] || '';

          if (!client_name && !phone_number) continue;

          let assignedToVal = (cols[13] || '').trim();
          let finalAssignee = selectedAssignee;
          
          if (assignedToVal) {
            const lowerVal = assignedToVal.toLowerCase();
            if (lowerVal.includes('joshva')) {
              finalAssignee = 'JOSHVA';
            } else if (lowerVal.includes('dhivakar')) {
              finalAssignee = 'DHIVAKAR';
            } else {
              const matchedMember = teamMembers.find(m => 
                m.full_name.toLowerCase() === lowerVal ||
                m.full_name.toLowerCase().includes(lowerVal) ||
                lowerVal.includes(m.full_name.toLowerCase())
              );
              if (matchedMember) {
                finalAssignee = matchedMember.full_name;
              } else {
                finalAssignee = assignedToVal;
              }
            }
          }

          if (!finalAssignee) {
            alert(`Row ${i + 1} has no assignee. Please select a fallback member in the dropdown or fill the 'Assigned To' column in the CSV.`);
            return;
          }

          let keyHookVal = (cols[11] || '').trim();
          const pitchVal = (cols[12] || '').trim();
          if (pitchVal) {
            keyHookVal = keyHookVal ? `${keyHookVal} | Pitch: ${pitchVal}` : pitchVal;
          }

          parsedLeads.push({
            client_name: client_name || 'Unknown Client',
            phone_number: phone_number || 'N/A',
            business_type: cols[1] || null,
            location: cols[3] || null,
            rating: cols[4] || null,
            reviews: cols[5] || null,
            website: cols[6] || null,
            priority: cols[7] || null,
            call_or_not: cols[8] || null,
            website_type_needed: cols[9] || null,
            suggested_price: cols[10] || null,
            key_hook_pain_point: keyHookVal || null,
            assigned_to: finalAssignee,
            status: (cols[14] || '').trim() || 'Pending',
            remarks: cols[15] || null,
            google_maps_link: cols[16] || null
          });
        }

        if (parsedLeads.length === 0) {
          alert("No valid leads found in CSV. Make sure first column is Business Name and third is Phone.");
          return;
        }

        const { error } = await supabase
          .from('cold_leads')
          .insert(parsedLeads);

        if (error) {
          alert("Error uploading leads: " + error.message);
        } else {
          alert(`Successfully uploaded ${parsedLeads.length} leads assigned to their designated members!`);
          fetchInternProjects();
        fetchProducts();
        }
      } catch (err) {
        alert("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveCallFeedback = async (e) => {
    e.preventDefault();
    if (!selectedLead || !leadRemarks.trim()) return;
    setIsSavingFeedback(true);

    const { error } = await supabase
      .from('cold_leads')
      .update({
        status: 'Approached',
        remarks: leadRemarks.trim(),
        approached_by: teamMemberData.full_name || teamMemberData.email,
        approached_at: new Date().toISOString()
      })
      .eq('id', selectedLead.id);

    setIsSavingFeedback(false);
    if (error) {
      alert("Error saving feedback: " + error.message);
    } else {
      alert("Call feedback saved successfully!");
      setSelectedLead(null);
      setLeadRemarks('');
      fetchInternProjects();
        fetchProducts();
    }
  };

  const handleDeleteColdLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      const { error } = await supabase
        .from('cold_leads')
        .delete()
        .eq('id', id);
      if (error) {
        alert("Error deleting lead: " + error.message);
      } else {
        fetchInternProjects();
        fetchProducts();
      }
    }
  };

  const handleUpdateColdLeadNumber = async (lead) => {
    const newPhone = window.prompt("Update phone number for " + lead.client_name + ":", lead.phone_number);
    if (newPhone === null) return;
    if (!newPhone.trim()) {
      alert("Phone number cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from('cold_leads')
      .update({ phone_number: newPhone.trim() })
      .eq('id', lead.id);

    if (error) {
      alert("Error updating phone number: " + error.message);
    } else {
      alert("Phone number updated!");
      fetchInternProjects();
        fetchProducts();
    }
  };

  const handleDeleteApproachedLeads = async () => {
    if (window.confirm("Are you sure you want to delete all approached (completed) leads from the database?")) {
      const { error } = await supabase
        .from('cold_leads')
        .delete()
        .eq('status', 'Approached');

      if (error) {
        alert("Error clearing approached leads: " + error.message);
      } else {
        alert("Approached leads cleared successfully!");
        fetchInternProjects();
        fetchProducts();
      }
    }
  };

  const handleClearAllLeads = async () => {
    if (window.confirm("WARNING: Are you sure you want to clear the ENTIRE lead sheet? This will delete all pending and approached leads!")) {
      const { error } = await supabase
        .from('cold_leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        alert("Error clearing lead sheet: " + error.message);
      } else {
        alert("Lead sheet cleared completely!");
        fetchInternProjects();
        fetchProducts();
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const { error } = await supabase
        .from('team_tasks')
        .delete()
        .eq('id', id);
      if (error) {
        alert("Error deleting task: " + error.message);
      } else {
      }
    }
  };

  const handleUpdateRegistrationStatus = async (id, status) => {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      alert(`Registration status updated to ${status}!`);
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(prev => ({ ...prev, status }));
      }
      fetchRegistrations();
    }
  };

  const handleUpdateStudentDetails = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsUpdatingStudent(true);
    
    const { error } = await supabase
      .from('registrations')
      .update({ 
        status: newStatus, 
        intern_number: newInternNumber.trim() 
      })
      .eq('id', selectedStudent.id);

    setIsUpdatingStudent(false);
    if (error) {
      alert("Error updating student details: " + error.message);
    } else {
      alert("Student details updated successfully!");
      setSelectedStudent(prev => ({
        ...prev,
        status: newStatus,
        intern_number: newInternNumber.trim()
      }));
      fetchRegistrations();
    }
  };

  const handleUpdateFreelancerStatus = async (id, status) => {
    const { error } = await supabase
      .from('freelancer_applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert("Error updating freelancer status: " + error.message);
    } else {
      alert(`Freelancer status updated to ${status}!`);
      fetchFreelancers();
    }
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

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setEvents(data);
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

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerName || !partnerLogoUrl || !partnerDescription || !partnerCategory) return;
    setIsSubmittingPartner(true);
    let error;
    if (editingPartner) {
        const res = await supabase.from('partnered_companies').update({ name: partnerName, logo_url: partnerLogoUrl, description: partnerDescription, category: partnerCategory }).eq('id', editingPartner.id);
        error = res.error;
    } else {
        const res = await supabase.from('partnered_companies').insert([{ name: partnerName, logo_url: partnerLogoUrl, description: partnerDescription, category: partnerCategory }]);
        error = res.error;
    }
    setIsSubmittingPartner(false);
    if (error) {
      alert("Error saving partner: " + error.message);
    } else {
      alert(editingPartner ? "Partner updated successfully!" : "Partner added successfully!");
      setEditingPartner(null);
      setPartnerName('');
      setPartnerLogoUrl('');
      setPartnerDescription('');
      setPartnerCategory('Community');
      fetchPartners();
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

  const handleQuickCertLink = (reg) => {
    setCertName(reg.full_name);
    setCertEmail(reg.email);
    setCertDomain(reg.domain);
    setCertCode(reg.intern_number || `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveTab('certificates');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/team/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!session || !teamMemberData) return null;

  const totalRegs = registrations.length;
  const approvedRegs = registrations.filter(r => r.status === 'Approved').length;
  const pendingRegs = registrations.filter(r => r.status === 'Pending').length;
  const rejectedRegs = registrations.filter(r => r.status === 'Rejected').length;

  const filteredRegistrations = registrations.filter(reg => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (reg.full_name || '').toLowerCase().includes(query) ||
      (reg.email || '').toLowerCase().includes(query) ||
      (reg.college || '').toLowerCase().includes(query) ||
      (reg.domain || '').toLowerCase().includes(query) ||
      (reg.utr_number || '').toLowerCase().includes(query) ||
      (reg.intern_number || '').toLowerCase().includes(query)
    );

    const matchesStatus = statusFilter === 'All' ? true : reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-68 shrink-0 bg-slate-950 border-r border-slate-800/60 flex flex-col justify-between h-full p-6 select-none">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/companylogo.jpg" alt="DAKH Logo" className="w-10 h-10 object-contain rounded bg-white p-1 shadow-md shadow-purple-500/25" />
            <div>
              <h1 className="font-black text-sm tracking-wider uppercase text-white leading-none">Team Portal</h1>
              <span className="text-[9px] text-purple-400 font-bold tracking-widest uppercase">DAKH Edu Solutions</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-2.5 overflow-y-auto scrollbar-hide max-h-[calc(100vh-220px)]">

            <button 
              onClick={() => setActiveTab('intern-projects')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'intern-projects' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <FileBadge className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'intern-projects' ? 'text-white' : 'text-gray-500'}`} />
              Intern Projects
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'products' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <Briefcase className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'products' ? 'text-white' : 'text-gray-500'}`} />
              Products & Services
            </button>

            <button 
              onClick={() => setActiveTab('registrations')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'registrations' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <Users className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'registrations' ? 'text-white' : 'text-gray-500'}`} />
              Registrations
            </button>
            <button 
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'certificates' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <Award className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'certificates' ? 'text-white' : 'text-gray-500'}`} />
              Certificates Link
            </button>
            <button 
              onClick={() => setActiveTab('freelancers')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'freelancers' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <Briefcase className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'freelancers' ? 'text-white' : 'text-gray-500'}`} />
              Freelancers
            </button>
            <button 
              onClick={() => setActiveTab('interns')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'interns' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <UserCircle className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'interns' ? 'text-white' : 'text-gray-500'}`} />
              Intern Management
            </button>
            <button 
              onClick={() => setActiveTab('advertisement')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'advertisement' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <ImageIcon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'advertisement' ? 'text-white' : 'text-gray-500'}`} />
              Manage Ads
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'events' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <Calendar className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'events' ? 'text-white' : 'text-gray-500'}`} />
              Events & Gallery
            </button>
            <button 
              onClick={() => setActiveTab('partners')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'partners' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <Handshake className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'partners' ? 'text-white' : 'text-gray-500'}`} />
              Partners
            </button>
          </div>
        </div>

        {/* Profile Card & Logout */}
        <div className="mt-auto pt-6 border-t border-slate-800/60 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-extrabold text-sm uppercase">
              {teamMemberData.full_name.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-xs font-black text-white truncate leading-tight">{teamMemberData.full_name}</p>
              <p className="text-[10px] text-gray-500 font-bold truncate mt-0.5">{teamMemberData.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer border border-slate-800/60"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow h-full flex flex-col overflow-hidden bg-slate-50">
        
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">Session</span>
            <p className="text-xs font-bold text-slate-600">Active: {teamMemberData.full_name} ({teamMemberData.role})</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
            DAKH PORTAL
          </div>
        </header>

        {/* Scrollable Tabs Wrapper */}
        <main className="flex-grow overflow-y-auto p-8">
          

          {activeTab === 'intern-projects' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Intern Projects</h2>
                  <p className="text-gray-500 font-medium mt-1">Manage intern project showcase items.</p>
                </div>
              </div>
              
              {/* Form to add/edit project */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{editingIp ? 'Edit Project' : 'Add New Project'}</h3>
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmittingIp(true);
                  if (editingIp) {
                    const { error } = await supabase.from('intern_projects').update({
                      title: ipTitle, description: ipDesc, vercel_link: ipVercelLink, github_link: ipGithubLink, linkedin_image_link: ipLinkedinLink
                    }).eq('id', editingIp.id);
                    if (!error) {
                       setEditingIp(null);
                       setIpTitle(''); setIpDesc(''); setIpVercelLink(''); setIpGithubLink(''); setIpLinkedinLink('');
                       fetchInternProjects();
                    } else alert(error.message);
                  } else {
                    const { error } = await supabase.from('intern_projects').insert([{
                      title: ipTitle, description: ipDesc, vercel_link: ipVercelLink, github_link: ipGithubLink, linkedin_image_link: ipLinkedinLink
                    }]);
                    if (!error) {
                       setIpTitle(''); setIpDesc(''); setIpVercelLink(''); setIpGithubLink(''); setIpLinkedinLink('');
                       fetchInternProjects();
                    } else alert(error.message);
                  }
                  setIsSubmittingIp(false);
                }}>
                  <input type="text" placeholder="Title" required value={ipTitle} onChange={e => setIpTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <textarea placeholder="Description" value={ipDesc} onChange={e => setIpDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <input type="url" placeholder="Vercel Link" required value={ipVercelLink} onChange={e => setIpVercelLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <input type="url" placeholder="GitHub Link" required value={ipGithubLink} onChange={e => setIpGithubLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <input type="url" placeholder="LinkedIn Image URL" required value={ipLinkedinLink} onChange={e => setIpLinkedinLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <button type="submit" disabled={isSubmittingIp} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">{isSubmittingIp ? 'Saving...' : 'Save Project'}</button>
                  {editingIp && <button type="button" onClick={() => { setEditingIp(null); setIpTitle(''); setIpDesc(''); setIpVercelLink(''); setIpGithubLink(''); setIpLinkedinLink(''); }} className="ml-4 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl">Cancel</button>}
                </form>
              </div>

              {/* List of projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internProjects.map(proj => (
                  <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-lg">{proj.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{proj.description}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => {
                        setEditingIp(proj);
                        setIpTitle(proj.title);
                        setIpDesc(proj.description || '');
                        setIpVercelLink(proj.vercel_link);
                        setIpGithubLink(proj.github_link);
                        setIpLinkedinLink(proj.linkedin_image_link);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-blue-600 font-bold text-sm">Edit</button>
                      <button onClick={async () => {
                        if(window.confirm('Delete this project?')) {
                          await supabase.from('intern_projects').delete().eq('id', proj.id);
                          fetchInternProjects();
                        }
                      }} className="text-red-600 font-bold text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'registrations' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Student Registrations</h2>
                  <p className="text-gray-500 font-medium mt-1">Review registrations, manage payment verification, and issue credentials.</p>
                </div>
                <button 
                  onClick={fetchRegistrations} 
                  className="self-start sm:self-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <Loader2 className="w-4 h-4" /> Refresh
                </button>
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Registrations */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  onClick={() => setStatusFilter('All')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                    statusFilter === 'All' 
                      ? 'bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border-purple-500 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Leads</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-2">{totalRegs}</h3>
                    </div>
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Filter all registrations
                  </div>
                </motion.div>

                {/* Approved Leads */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  onClick={() => setStatusFilter('Approved')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                    statusFilter === 'Approved' 
                      ? 'bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved</p>
                      <h3 className="text-2xl font-black text-emerald-700 mt-2">{approvedRegs}</h3>
                    </div>
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
                    Filter approved leads
                  </div>
                </motion.div>

                {/* Pending leads */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  onClick={() => setStatusFilter('Pending')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                    statusFilter === 'Pending' 
                      ? 'bg-gradient-to-br from-amber-50/70 to-orange-50/70 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                      <h3 className="text-2xl font-black text-amber-700 mt-2">{pendingRegs}</h3>
                    </div>
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                    Filter pending review
                  </div>
                </motion.div>

                {/* Rejected leads */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  onClick={() => setStatusFilter('Rejected')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                    statusFilter === 'Rejected' 
                      ? 'bg-gradient-to-br from-rose-50/70 to-red-50/70 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rejected</p>
                      <h3 className="text-2xl font-black text-rose-700 mt-2">{rejectedRegs}</h3>
                    </div>
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-bold text-rose-600 flex items-center gap-1">
                    Filter rejected leads
                  </div>
                </motion.div>
              </div>

              {/* Search & Filter tools */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-gray-200 p-4 rounded-2xl">
                <div className="relative flex-grow max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by Name, College, Domain, UTR..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl text-sm font-medium transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    <span>Filter: {statusFilter}</span>
                  </div>
                  <span>Showing {filteredRegistrations.length} of {registrations.length} candidates</span>
                </div>
              </div>

              {/* Lead Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-100 border-b border-gray-200 text-xs uppercase tracking-wider">
                      <th className="p-4 font-black">Date</th>
                      <th className="p-4 font-black">Student Name</th>
                      <th className="p-4 font-black">College</th>
                      <th className="p-4 font-black">Plan & Domain</th>
                      <th className="p-4 font-black">UTR</th>
                      <th className="p-4 font-black">Status</th>
                      <th className="p-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-gray-500 font-medium bg-gray-50/50">
                          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          No registrations found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map(reg => (
                        <tr 
                          key={reg.id} 
                          onClick={() => {
                            setSelectedStudent(reg);
                            setNewStatus(reg.status);
                            setNewInternNumber(reg.intern_number || '');
                          }}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer select-none group"
                        >
                          <td className="p-4 text-xs text-gray-500 font-bold whitespace-nowrap">
                            {new Date(reg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{reg.full_name}</div>
                            <div className="text-xs text-gray-400 font-medium">{reg.email}</div>
                          </td>
                          <td className="p-4 text-xs text-gray-600 font-medium max-w-[200px] truncate">{reg.college}</td>
                          <td className="p-4">
                            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 inline-block mb-1">{reg.plan_name}</div>
                            <div className="text-xs text-gray-500 font-semibold">{reg.domain}</div>
                          </td>
                          <td className="p-4 font-mono text-xs font-bold text-gray-600 bg-gray-50/80 rounded px-2 py-1 max-w-[120px] truncate border border-gray-100">
                            {reg.utr_number}
                          </td>
                          <td className="p-4 whitespace-nowrap animate-fade-in">
                            <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                              reg.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              reg.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {reg.status === 'Pending' && <Clock className="w-3 h-3 animate-spin-slow" />}
                              {reg.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                              {reg.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                              {reg.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickCertLink(reg);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 transition-colors cursor-pointer"
                                title="Add Certificate Link"
                              >
                                <Award className="w-3.5 h-3.5" /> Link Cert
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

          {activeTab === 'certificates' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Manage Certificates</h2>
                  <p className="text-gray-500 font-medium mt-1">Publish and manage certificate links for interns.</p>
                </div>
                <button onClick={fetchCertificates} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer">
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
                      list="admin-cert-domains"
                      value={certDomain}
                      onChange={(e) => setCertDomain(e.target.value)}
                      placeholder="e.g. Web Development"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    />
                    <datalist id="admin-cert-domains">
                      <option value="Web Development" />
                      <option value="UI/UX Design" />
                      <option value="App Development" />
                      <option value="Data Science" />
                      <option value="Vibe Coding" />
                      <option value="Machine Learning" />
                    </datalist>
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

          {activeTab === 'freelancers' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Freelancer Applications</h2>
                  <p className="text-gray-500 font-medium mt-1">Review freelancer applications and update statuses.</p>
                </div>
                <button onClick={fetchFreelancers} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer">
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
                    <div key={freelancer.id} className="border border-gray-200 rounded-xl p-6 bg-slate-50 hover:shadow-md transition-all">
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
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Mail size={16} /> <a href={`mailto:${freelancer.email}`} className="hover:underline">{freelancer.email}</a></div>
                        <div className="flex items-center gap-2"><Phone size={16} /> <a href={`tel:${freelancer.phone}`} className="hover:underline">{freelancer.phone}</a></div>
                        <div className="flex items-center gap-2"><MapIcon size={16} /> {freelancer.city || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={16} /> Applied: {new Date(freelancer.applied_at).toLocaleString()}</div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.map(s => <span key={s} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">{s}</span>)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Brief Introduction:</h4>
                          <p className="text-gray-600 text-sm bg-white border border-gray-200 p-3 rounded-lg min-h-[4rem] whitespace-pre-wrap">{freelancer.bio || 'Not provided'}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Why DAKH?</h4>
                          <p className="text-gray-600 text-sm bg-white border border-gray-200 p-3 rounded-lg min-h-[4rem] whitespace-pre-wrap">{freelancer.why_dakh || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'interns' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto">
              <TeamStudentManager />
            </motion.div>
          )}


          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Products & Services</h2>
                  <p className="text-gray-500 font-medium mt-1">Manage our products and services.</p>
                </div>
              </div>
              
              {/* Form to add/edit product */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{editingProd ? 'Edit Product' : 'Add New Product'}</h3>
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmittingProd(true);
                  if (editingProd) {
                    const { error } = await supabase.from('products').update({
                      title: prodTitle, description: prodDesc, image_url: prodImageUrl
                    }).eq('id', editingProd.id);
                    if (!error) {
                       setEditingProd(null);
                       setProdTitle(''); setProdDesc(''); setProdImageUrl('');
                       fetchProducts();
                    } else alert(error.message);
                  } else {
                    const { error } = await supabase.from('products').insert([{
                      title: prodTitle, description: prodDesc, image_url: prodImageUrl
                    }]);
                    if (!error) {
                       setProdTitle(''); setProdDesc(''); setProdImageUrl('');
                       fetchProducts();
                    } else alert(error.message);
                  }
                  setIsSubmittingProd(false);
                }}>
                  <input type="text" placeholder="Title" required value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <textarea placeholder="Description" required value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <input type="url" placeholder="Image URL" required value={prodImageUrl} onChange={e => setProdImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder-gray-500 font-bold" />
                  <button type="submit" disabled={isSubmittingProd} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">{isSubmittingProd ? 'Saving...' : 'Save Product'}</button>
                  {editingProd && <button type="button" onClick={() => { setEditingProd(null); setProdTitle(''); setProdDesc(''); setProdImageUrl(''); }} className="ml-4 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl">Cancel</button>}
                </form>
              </div>

              {/* List of products */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <img src={prod.image_url} alt={prod.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                      <h4 className="font-bold text-lg">{prod.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{prod.description}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => {
                        setEditingProd(prod);
                        setProdTitle(prod.title);
                        setProdDesc(prod.description);
                        setProdImageUrl(prod.image_url);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-blue-600 font-bold text-sm">Edit</button>
                      <button onClick={async () => {
                        if(window.confirm('Delete this product?')) {
                          await supabase.from('products').delete().eq('id', prod.id);
                          fetchProducts();
                        }
                      }} className="text-red-600 font-bold text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'advertisement' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
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
                    <button onClick={handleDeleteAd} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 cursor-pointer">
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
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAd ? 'Publishing...' : (currentAd ? 'Replace Live Advertisement' : 'Publish Advertisement')}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingEvent ? 'Publishing Event...' : 'Publish Event'}
                  </button>
                </form>

                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Manage Uploaded Events</h3>
                    <button onClick={fetchEvents} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer">
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
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'partners' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900">{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h2>
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500"
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none text-gray-900 placeholder-gray-500"
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select 
                      value={partnerCategory}
                      onChange={(e) => setPartnerCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-gray-900"
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
                  <div className="flex gap-4">
                    <button 
                      type="submit" 
                      disabled={isSubmittingPartner}
                      className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingPartner ? 'Saving...' : (editingPartner ? 'Save Partner' : 'Add Partner')}
                    </button>
                    {editingPartner && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingPartner(null);
                          setPartnerName('');
                          setPartnerLogoUrl('');
                          setPartnerDescription('');
                          setPartnerCategory('Community');
                        }}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Manage Partners</h3>
                    <button onClick={fetchPartners} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer">
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
                            onClick={() => {
                              setEditingPartner(partner);
                              setPartnerName(partner.name);
                              setPartnerLogoUrl(partner.logo_url);
                              setPartnerDescription(partner.description);
                              setPartnerCategory(partner.category || 'Community');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="absolute top-2 right-12 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePartner(partner.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* Right-Side Slide-Out Drawer overlay */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-pointer"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden text-slate-800"
            >
              {/* Header */}
              <div className="bg-[#0f172a] text-white p-5 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-lg text-white">
                    {selectedStudent.full_name ? selectedStudent.full_name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight">Student Details</h3>
                    <p className="text-[11px] text-slate-400">View registration and update status</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {/* Status Indicator */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Status</span>
                    <span className="text-xs font-bold text-gray-500 mt-1 block">
                      Registered: {new Date(selectedStudent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider border ${
                    selectedStudent.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    selectedStudent.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedStudent.status}
                  </span>
                </div>

                {/* Candidate Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Personal Info</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Full Name</span>
                      <span className="text-sm font-bold text-gray-900">{selectedStudent.full_name}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Email Address</span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 select-all">{selectedStudent.email}</span>
                        <a 
                          href={`mailto:${selectedStudent.email}`}
                          className="p-1 hover:bg-slate-100 text-purple-600 rounded transition-all cursor-pointer"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Phone Number</span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 select-all">{selectedStudent.phone || 'Not provided'}</span>
                        {selectedStudent.phone && (
                          <div className="flex gap-1.5">
                            <a 
                              href={`tel:${selectedStudent.phone}`}
                              className="p-1 hover:bg-slate-100 text-indigo-600 rounded transition-all cursor-pointer"
                              title="Call"
                            >
                              <Phone size={16} />
                            </a>
                            <a 
                              href={`https://wa.me/91${selectedStudent.phone.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 hover:bg-slate-100 text-emerald-600 rounded transition-all cursor-pointer"
                              title="Send WhatsApp"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* College Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Academic Profile</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <span className="text-[11px] text-gray-400 font-semibold block">College</span>
                      <span className="text-xs font-bold text-slate-800">{selectedStudent.college || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Department</span>
                      <span className="text-xs font-bold text-slate-800">{selectedStudent.department || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Year of Study</span>
                      <span className="text-xs font-bold text-slate-800">{selectedStudent.year_of_study || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Internship Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Internship Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Domain / Course</span>
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block mt-0.5">{selectedStudent.domain}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Plan Selected</span>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block mt-0.5">{selectedStudent.plan_name} (₹{selectedStudent.plan_price || 'N/A'})</span>
                    </div>
                    {selectedStudent.referral_code && (
                      <div className="col-span-2">
                        <span className="text-[11px] text-gray-400 font-semibold block">Referral Code</span>
                        <span className="text-xs font-bold text-emerald-700">{selectedStudent.referral_code}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Verification */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Payment Reference</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">UTR / Transaction Number</span>
                      <span className="text-sm font-mono font-bold text-gray-800 mt-1 block select-all">{selectedStudent.utr_number}</span>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStudent.utr_number);
                        setCopiedUtr(true);
                        setTimeout(() => setCopiedUtr(false), 2000);
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        copiedUtr ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                      }`}
                      title="Copy UTR Code"
                    >
                      {copiedUtr ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Form controls */}
                <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 space-y-4">
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare size={14} /> Update Credentials
                  </h4>
                  
                  <form onSubmit={handleUpdateStudentDetails} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Intern Number / ID</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. DES/INT/2026/101"
                          value={newInternNumber}
                          onChange={(e) => setNewInternNumber(e.target.value)}
                          className="flex-grow px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const rand = Math.floor(1000 + Math.random() * 9000);
                            let code = `DES/INT/2026/${rand}`;
                            if (selectedStudent.domain) {
                              const dom = selectedStudent.domain.substring(0, 3).toUpperCase();
                              code = `${dom}/INT/2026/${rand}`;
                            }
                            setNewInternNumber(code);
                          }}
                          className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Auto
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Registration Status</label>
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="submit" 
                        disabled={isUpdatingStudent}
                        className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                      >
                        {isUpdatingStudent ? <Loader2 size={16} className="animate-spin" /> : 'Save & Update'}
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          handleQuickCertLink(selectedStudent);
                          setSelectedStudent(null);
                        }}
                        className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Award size={16} /> Link Cert
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TeamDashboard;
