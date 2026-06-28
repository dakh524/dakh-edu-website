import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Map as MapIcon, Loader2, Award, Briefcase, Trash2, 
  FileBadge, FileText, Mail, Phone, Calendar, ClipboardList, ListTodo, 
  Plus, CheckSquare, Search, X, ExternalLink, AlertCircle, CheckCircle2, 
  XCircle, Clock, Filter, Copy, Check, TrendingUp, PieChart, BarChart2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamMemberData, setTeamMemberData] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
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

  // Weekly tasks management state
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Cold calling states
  const [coldLeads, setColdLeads] = useState([]);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCategory, setLeadCategory] = useState('');
  const [leadLocation, setLeadLocation] = useState('');
  const [leadRating, setLeadRating] = useState('');
  const [leadReviews, setLeadReviews] = useState('');
  const [leadWebsite, setLeadWebsite] = useState('');
  const [leadPriority, setLeadPriority] = useState('High');
  const [leadCallOrNot, setLeadCallOrNot] = useState('Yes - Call');
  const [leadWebsiteType, setLeadWebsiteType] = useState('');
  const [leadSuggestedPrice, setLeadSuggestedPrice] = useState('');
  const [leadKeyHook, setLeadKeyHook] = useState('');
  const [leadGoogleMaps, setLeadGoogleMaps] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadRemarks, setLeadRemarks] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [coldLeadsFilter, setColdLeadsFilter] = useState('Pending'); // 'Pending', 'Approached'
  const [weeklyTargetInput, setWeeklyTargetInput] = useState('');
  const [isSavingWeeklyTarget, setIsSavingWeeklyTarget] = useState(false);
  const [showTargetSetupModal, setShowTargetSetupModal] = useState(false);

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
        setWeeklyTargetInput(teamMember.weekly_call_target || 50);
        // Load data
        fetchRegistrations();
        fetchFreelancers();
        fetchCertificates();
        fetchTeamTasks();
        fetchTeamMembers();
        fetchColdLeads();
      }
    } catch (err) {
      console.error(err);
      await supabase.auth.signOut();
      navigate('/team/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coldLeads.length >= 1000 && teamMemberData) {
      const dismissed = sessionStorage.getItem(`dismissed_goal_prompt_${teamMemberData.id}`);
      if (!dismissed && (teamMemberData.weekly_call_target === 50 || !teamMemberData.weekly_call_target)) {
        setShowTargetSetupModal(true);
      }
    }
  }, [coldLeads, teamMemberData]);

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

  const handleSaveWeeklyTarget = async (e) => {
    e.preventDefault();
    if (!weeklyTargetInput || isNaN(weeklyTargetInput) || parseInt(weeklyTargetInput) <= 0) {
      alert("Please enter a valid weekly target count.");
      return;
    }
    setIsSavingWeeklyTarget(true);
    const { error } = await supabase
      .from('team_members')
      .update({ weekly_call_target: parseInt(weeklyTargetInput) })
      .eq('id', teamMemberData.id);
    setIsSavingWeeklyTarget(false);
    if (error) {
      alert("Error saving weekly target: " + error.message);
    } else {
      alert("Weekly call target updated!");
      setTeamMemberData(prev => ({ ...prev, weekly_call_target: parseInt(weeklyTargetInput) }));
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

  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCertificates(data);
  };
  const fetchTeamTasks = async () => {
    const { data, error } = await supabase
      .from('team_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTasks(data);
  };

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('full_name', { ascending: true });
    if (!error && data) setTeamMembers(data);
  };

  const fetchColdLeads = async () => {
    const { data, error } = await supabase
      .from('cold_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setColdLeads(data);
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
      fetchTeamTasks();
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
      fetchTeamTasks();
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
      fetchTeamTasks();
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
        fetchTeamTasks();
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
      fetchColdLeads();
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
          fetchColdLeads();
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
      fetchColdLeads();
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
        fetchColdLeads();
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
      fetchColdLeads();
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
        fetchColdLeads();
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
        fetchColdLeads();
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
        fetchTeamTasks();
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

  const isCeo = ['ceo', 'managing director', 'admin'].includes(teamMemberData?.role?.toLowerCase()) || teamMemberData?.email === 'ceo@dakhedusolutions.in';
  
  const myLeads = coldLeads.filter(lead => {
    if (isCeo) {
      if (selectedAssigneeFilter !== 'All') {
        return (lead.assigned_to || '').toLowerCase() === selectedAssigneeFilter.toLowerCase();
      }
      return true;
    }
    const leadAssignee = (lead.assigned_to || '').toLowerCase();
    const memberName = (teamMemberData.full_name || '').toLowerCase();
    const memberEmail = (teamMemberData.email || '').toLowerCase();
    return leadAssignee === memberName || 
           leadAssignee === memberEmail || 
           (leadAssignee && memberName && (leadAssignee.includes(memberName) || memberName.includes(leadAssignee)));
  });

  const isColdCallingEligible = isCeo || 
    ['cold caller', 'telecaller', 'sales', 'marketing', 'bd', 'business development', 'developer', 'managing director', 'director', 'manager', 'management', 'executive', 'operational executive', 'operational excutive'].includes(teamMemberData?.role?.toLowerCase()) ||
    (teamMemberData?.role || '').toLowerCase().includes('caller') ||
    (teamMemberData?.role || '').toLowerCase().includes('sales') ||
    (teamMemberData?.role || '').toLowerCase().includes('director') ||
    (teamMemberData?.role || '').toLowerCase().includes('manager') ||
    (teamMemberData?.role || '').toLowerCase().includes('executive') ||
    (teamMemberData?.role || '').toLowerCase().includes('excutive') ||
    myLeads.length > 0;

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  const callsMadeToday = myLeads.filter(lead => {
    if (lead.status !== 'Approached') return false;
    if (!lead.approached_at || !lead.approached_by) return false;
    
    const isByUser = lead.approached_by === teamMemberData.full_name || lead.approached_by === teamMemberData.email;
    const isToday = new Date(lead.approached_at) >= todayStart;
    
    return isByUser && isToday;
  }).length;

  const totalLeadsCount = myLeads.length;
  const pendingLeadsCount = myLeads.filter(l => l.status === 'Pending').length;
  const approachedLeadsCount = myLeads.filter(l => l.status === 'Approached').length;

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

  const formatSeconds = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '0 mins';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} mins`;
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return { label: 'Never', color: 'bg-gray-100 text-gray-500', dotColor: 'bg-gray-400' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    
    if (diffMins < 5) {
      return { label: 'Online now', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dotColor: 'bg-emerald-500 animate-pulse' };
    }
    if (diffMins < 60) {
      return { label: `${diffMins} mins ago`, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dotColor: 'bg-emerald-500' };
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return { label: `${diffHours} hrs ago`, color: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' };
    }
    return { label: 'Offline', color: 'bg-gray-50 text-gray-400 border-gray-100', dotColor: 'bg-gray-300' };
  };

  const leadsToDisplay = coldLeadsFilter === 'History'
    ? myLeads.filter(l => l.status === 'Approached')
    : myLeads.filter(l => l.status === coldLeadsFilter);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-68 shrink-0 bg-slate-950 border-r border-slate-800/60 flex flex-col justify-between h-full p-6 select-none">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-base text-white shadow-md shadow-purple-500/25">T</div>
            <div>
              <h1 className="font-black text-sm tracking-wider uppercase text-white leading-none">Team Portal</h1>
              <span className="text-[9px] text-purple-400 font-bold tracking-widest uppercase">DAKH Edu Solutions</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-2.5 overflow-y-auto scrollbar-hide max-h-[calc(100vh-220px)]">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'analytics' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <TrendingUp className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'analytics' ? 'text-white' : 'text-gray-500'}`} />
              Analytics Overview
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
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                activeTab === 'tasks' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }`}
            >
              <ListTodo className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'tasks' ? 'text-white' : 'text-gray-500'}`} />
              Weekly Tasks
            </button>
            {isColdCallingEligible && (
              <button 
                onClick={() => setActiveTab('coldcalling')}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  activeTab === 'coldcalling' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                    : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
                }`}
              >
                <Phone className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${activeTab === 'coldcalling' ? 'text-white' : 'text-gray-500'}`} />
                Cold Calling
              </button>
            )}
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
          
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Analytics & Insights</h2>
                  <p className="text-gray-500 font-medium mt-1">Real-time metrics, performance analytics, and database breakdown statistics.</p>
                </div>
                <button 
                  onClick={() => {
                    fetchRegistrations();
                    fetchColdLeads();
                    fetchTeamTasks();
                    fetchTeamMembers();
                  }} 
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Loader2 className="w-4 h-4 animate-spin-slow" /> Refresh All Stats
                </button>
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Registrations Admissions */}
                <div className="bg-gradient-to-br from-indigo-50/40 to-purple-50/40 border border-indigo-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Registrations Admissions</span>
                  <h3 className="text-2xl font-black text-indigo-700 mt-2">{registrations.filter(r => r.status === 'Approved').length} <span className="text-xs text-gray-400 font-bold">/ {registrations.length}</span></h3>
                  <span className="text-[10px] font-bold text-indigo-600/80 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-2">Approved Candidates</span>
                </div>

                {/* Lead Contacts */}
                <div className="bg-gradient-to-br from-amber-50/40 to-orange-50/40 border border-amber-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cold Leads Base</span>
                  <h3 className="text-2xl font-black text-amber-700 mt-2">{coldLeads.length} <span className="text-xs text-gray-400 font-bold">/ {coldLeads.filter(l => l.status === 'Pending').length} pending</span></h3>
                  <span className="text-[10px] font-bold text-amber-600/80 bg-amber-50 px-2 py-0.5 rounded inline-block mt-2">Active CRM Sheets</span>
                </div>

                {/* Call Approaches */}
                <div className="bg-gradient-to-br from-emerald-50/40 to-teal-50/40 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Approached Calls</span>
                  <h3 className="text-2xl font-black text-emerald-700 mt-2">{coldLeads.filter(l => l.status === 'Approached').length}</h3>
                  <span className="text-[10px] font-bold text-emerald-600/80 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-2">Outbound Contacts Logged</span>
                </div>

                {/* Tasks Performance */}
                <div className="bg-gradient-to-br from-purple-50/40 to-pink-50/40 border border-purple-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Weekly Task Rate</span>
                  <h3 className="text-2xl font-black text-purple-700 mt-2">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%
                  </h3>
                  <span className="text-[10px] font-bold text-purple-600/80 bg-purple-50 px-2 py-0.5 rounded inline-block mt-2">
                    {tasks.filter(t => t.status === 'Completed').length} / {tasks.length} Completed
                  </span>
                </div>
              </div>

              {/* Graphics Breakdown Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Lead Status breakdown */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <PieChart className="w-4.5 h-4.5 text-amber-500" /> Leads Response Distribution
                  </h4>
                  {(() => {
                    const total = coldLeads.length;
                    const approached = coldLeads.filter(l => l.status === 'Approached').length;
                    const pending = coldLeads.filter(l => l.status === 'Pending').length;
                    const size = 160;
                    const r = 50;
                    const circ = 2 * Math.PI * r;
                    const pctApproached = total > 0 ? (approached / total) * 100 : 0;
                    const pctPending = total > 0 ? (pending / total) * 100 : 0;
                    
                    const strokeDasharrayPending = `${(circ * pctPending) / 100} ${circ}`;
                    const strokeDashoffsetPending = -((circ * pctApproached) / 100);
                    const strokeDasharrayApproached = `${(circ * pctApproached) / 100} ${circ}`;
                    const strokeDashoffsetApproached = 0;
                    
                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                        <div className="relative">
                          <svg width={size} height={size} viewBox="0 0 120 120" className="transform -rotate-90">
                            <circle cx="60" cy="60" r={r} fill="transparent" stroke="#f8fafc" strokeWidth="12" />
                            {pctPending > 0 && (
                              <circle 
                                cx="60" 
                                cy="60" 
                                r={r} 
                                fill="transparent" 
                                stroke="#f59e0b" 
                                strokeWidth="12" 
                                strokeDasharray={strokeDasharrayPending}
                                strokeDashoffset={strokeDashoffsetPending}
                                strokeLinecap="round"
                              />
                            )}
                            {pctApproached > 0 && (
                              <circle 
                                cx="60" 
                                cy="60" 
                                r={r} 
                                fill="transparent" 
                                stroke="#10b981" 
                                strokeWidth="12" 
                                strokeDasharray={strokeDasharrayApproached}
                                strokeDashoffset={strokeDashoffsetApproached}
                                strokeLinecap="round"
                              />
                            )}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black text-slate-800">
                              {total > 0 ? Math.round(pctApproached) : 0}%
                            </span>
                            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Contacted</span>
                          </div>
                        </div>
                        <div className="space-y-3 font-semibold text-xs text-gray-600 w-full max-w-[180px]">
                          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                              <span>Approached</span>
                            </div>
                            <span className="font-bold text-slate-800">{approached}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                              <span>Pending</span>
                            </div>
                            <span className="font-bold text-slate-800">{pending}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Outbound Caller Leaderboard */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-purple-600" /> Outbound Call Activity
                  </h4>
                  {(() => {
                    const callerActivity = {};
                    coldLeads.forEach(l => {
                      if (l.status === 'Approached' && l.approached_by) {
                        const caller = l.approached_by;
                        callerActivity[caller] = (callerActivity[caller] || 0) + 1;
                      }
                    });
                    const sortedCallers = Object.entries(callerActivity)
                      .map(([name, count]) => ({ name, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 4);

                    if (sortedCallers.length === 0) {
                      return <p className="text-xs text-gray-400 italic py-12 text-center my-auto">No logged outbound calls yet.</p>;
                    }

                    const maxCalls = Math.max(...sortedCallers.map(c => c.count));

                    return (
                      <div className="space-y-4 my-auto">
                        {sortedCallers.map((caller, idx) => {
                          const percent = maxCalls > 0 ? (caller.count / maxCalls) * 100 : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span className="truncate max-w-[180px]">{caller.name}</span>
                                <span>{caller.count} calls</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Popular Domains Registrations */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4.5 h-4.5 text-indigo-500" /> Popular Course Domains
                  </h4>
                  {(() => {
                    const domainCounts = {};
                    registrations.forEach(r => {
                      const domain = r.domain || 'Unspecified';
                      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                    });
                    const sortedDomains = Object.entries(domainCounts)
                      .map(([name, count]) => ({ name, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5);

                    if (sortedDomains.length === 0) {
                      return <p className="text-xs text-gray-400 italic py-12 text-center my-auto">No candidate domains recorded yet.</p>;
                    }

                    const maxCount = Math.max(...sortedDomains.map(d => d.count));

                    return (
                      <div className="flex items-end justify-between h-40 pt-4 border-b border-slate-100">
                        {sortedDomains.map((dom, idx) => {
                          const heightPercent = maxCount > 0 ? (dom.count / maxCount) * 100 : 0;
                          return (
                            <div key={idx} className="flex flex-col items-center flex-1 group">
                              <div className="relative w-7 bg-indigo-50 border border-indigo-100 hover:border-purple-400 rounded-t-md transition-all duration-700 overflow-hidden" style={{ height: `${Math.max(12, heightPercent)}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                                <span className="absolute top-1 left-0 right-0 text-[9px] text-white font-extrabold text-center">{dom.count}</span>
                              </div>
                              <span className="text-[9px] font-bold text-gray-500 mt-2 truncate w-14 text-center" title={dom.name}>
                                {dom.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Tasks Progress Rings */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4.5 h-4.5 text-emerald-600" /> Weekly Tasks Progress
                  </h4>
                  {(() => {
                    const total = tasks.length;
                    const todo = tasks.filter(t => t.status === 'To Do').length;
                    const progress = tasks.filter(t => t.status === 'In Progress').length;
                    const completed = tasks.filter(t => t.status === 'Completed').length;

                    if (total === 0) {
                      return <p className="text-xs text-gray-400 italic py-12 text-center my-auto">No weekly tasks generated yet.</p>;
                    }

                    return (
                      <div className="grid grid-cols-3 gap-2 py-2 my-auto">
                        {/* To Do Ring */}
                        {(() => {
                          const pct = Math.round((todo / total) * 100);
                          const circ = 2 * Math.PI * 22; // 138.23
                          const offset = circ - (circ * pct) / 100;
                          return (
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <svg width="60" height="60" viewBox="0 0 50 50" className="transform -rotate-90">
                                  <circle cx="25" cy="25" r="22" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                                  <circle cx="25" cy="25" r="22" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">
                                  {pct}%
                                </div>
                              </div>
                              <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-wide">To Do</span>
                              <span className="text-[10px] font-bold text-slate-800 mt-0.5">{todo} tasks</span>
                            </div>
                          );
                        })()}

                        {/* In Progress Ring */}
                        {(() => {
                          const pct = Math.round((progress / total) * 100);
                          const circ = 2 * Math.PI * 22; // 138.23
                          const offset = circ - (circ * pct) / 100;
                          return (
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <svg width="60" height="60" viewBox="0 0 50 50" className="transform -rotate-90">
                                  <circle cx="25" cy="25" r="22" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                                  <circle cx="25" cy="25" r="22" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">
                                  {pct}%
                                </div>
                              </div>
                              <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-wide">In Progress</span>
                              <span className="text-[10px] font-bold text-slate-800 mt-0.5">{progress} tasks</span>
                            </div>
                          );
                        })()}

                        {/* Completed Ring */}
                        {(() => {
                          const pct = Math.round((completed / total) * 100);
                          const circ = 2 * Math.PI * 22; // 138.23
                          const offset = circ - (circ * pct) / 100;
                          return (
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <svg width="60" height="60" viewBox="0 0 50 50" className="transform -rotate-90">
                                  <circle cx="25" cy="25" r="22" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                                  <circle cx="25" cy="25" r="22" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">
                                  {pct}%
                                </div>
                              </div>
                              <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-wide">Completed</span>
                              <span className="text-[10px] font-bold text-slate-800 mt-0.5">{completed} tasks</span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Team Productivity & Activity Tracker */}
                <div className="col-span-1 md:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-purple-600" /> Team Activity & Productivity Tracker
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mb-6">Real-time status tracking of which team members are working (active), low-performing, or inactive this week, along with their tracked session working hours.</p>
                  </div>

                  <div className="space-y-6">
                    {teamMembers.map(member => {
                      const weeklyTarget = member.weekly_call_target || 50;
                      const dailyTarget = Math.ceil(weeklyTarget / 5);
                      
                      // Count total approached leads by this member
                      const memberCalls = coldLeads.filter(l => 
                        l.status === 'Approached' && 
                        (l.approached_by === member.full_name || l.approached_by === member.email)
                      ).length;

                      const progressPercent = Math.min(100, Math.round((memberCalls / weeklyTarget) * 100));

                      // Determine active status (Online/Offline) based on last_active_at
                      const activeInfo = getActiveStatus(member.last_active_at);

                      return (
                        <div key={member.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                          {/* Name and Role */}
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 text-sm block">{member.full_name}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{member.role || 'Team Member'}</span>
                            
                            {/* Live Status Badge */}
                            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider mt-1 ${activeInfo.color}`}>
                              <span className={`w-1 h-1 rounded-full ${activeInfo.dotColor} ${activeInfo.isOnline ? 'animate-ping' : ''}`}></span>
                              {activeInfo.label}
                            </span>
                          </div>

                          {/* Tracked Working Hours */}
                          <div className="space-y-1 text-slate-700">
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold tracking-wide">Tracked Work Hours</span>
                            <div className="text-xs font-bold space-y-0.5">
                              <div>Today: <span className="text-purple-700 font-black">{formatSeconds(member.today_work_seconds)}</span></div>
                              <div>Weekly: <span className="text-indigo-700 font-black">{formatSeconds(member.weekly_work_seconds)}</span></div>
                            </div>
                          </div>

                          {/* Progress toward goal */}
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                              <span>Weekly Calls: {memberCalls} / {weeklyTarget} approached</span>
                              <span className="text-purple-600 font-black">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  memberCalls >= 10 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                    : memberCalls > 0 
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                                    : 'bg-gradient-to-r from-rose-400 to-red-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-gray-400 font-semibold block">Calculated Daily Target: {dailyTarget} calls/day</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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

          {activeTab === 'tasks' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Weekly Tasks Board</h2>
                  <p className="text-gray-500 font-medium mt-1">Add, track, and complete weekly tasks for the team.</p>
                </div>
                <button onClick={fetchTeamTasks} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer">
                  <Loader2 className="w-4 h-4" /> Refresh
                </button>
              </div>

              {/* Pending Task Approvals Panel for CEO */}
              {(() => {
                const isCeo = ['ceo', 'managing director', 'admin'].includes(teamMemberData?.role?.toLowerCase()) || teamMemberData?.email === 'ceo@dakhedusolutions.in';
                const pendingTasks = tasks.filter(t => t.status === 'Pending Approval');
                if (isCeo && pendingTasks.length > 0) {
                  return (
                    <div className="bg-amber-50/40 border border-amber-200 p-6 rounded-2xl mb-8">
                      <h3 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="w-5 h-5 text-amber-600 animate-pulse" /> Pending Task Approvals ({pendingTasks.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingTasks.map(task => (
                          <div key={task.id} className="bg-white border border-amber-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-slate-900 text-sm leading-snug">{task.title}</h4>
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-widest shrink-0">
                                  Review
                                </span>
                              </div>
                              {task.description && <p className="text-gray-500 text-xs mt-2 leading-relaxed">{task.description}</p>}
                              
                              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px] text-gray-500 font-bold">
                                <div>
                                  <span className="block text-[8px] uppercase text-gray-400 font-extrabold">Assignee</span>
                                  <span className="text-slate-800 truncate block">{task.assigned_to || 'Unassigned'}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase text-gray-400 font-extrabold">Creator</span>
                                  <span className="text-slate-700 truncate block">{task.created_by}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase text-gray-400 font-extrabold">Due Date</span>
                                  <span className="text-slate-800 block">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                              <button 
                                onClick={() => handleApproveTask(task.id)}
                                className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <CheckSquare size={13} /> Approve
                              </button>
                              <button 
                                onClick={() => handleRejectTask(task.id)}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg border border-rose-100 transition-colors text-xs cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Form to add new task */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-600" /> Add Weekly Task
                </h3>
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Task Title</label>
                    <input 
                      type="text" 
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Review registration payment UTRs"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Assign To</label>
                    <select 
                      value={taskAssignedTo}
                      onChange={(e) => setTaskAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                    >
                      <option value="">Select Member</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.full_name}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Description (Optional)</label>
                    <textarea 
                      rows={2}
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      placeholder="Enter task instructions..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:col-span-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Due Date</label>
                      <input 
                        type="date" 
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Priority</label>
                      <select 
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-950"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmittingTask}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> {isSubmittingTask ? 'Adding...' : 'Create Weekly Task'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tasks Columns Kanban */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* TO DO COLUMN */}
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                    <h4 className="font-black text-gray-800 text-sm tracking-wider uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> To Do
                    </h4>
                    <span className="bg-white border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md text-xs">
                      {tasks.filter(t => t.status === 'To Do').length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px] scrollbar-hide">
                    {tasks.filter(t => t.status === 'To Do').length === 0 ? (
                      <p className="text-gray-400 text-xs font-semibold py-8 text-center italic">No tasks in queue</p>
                    ) : (
                      tasks.filter(t => t.status === 'To Do').map(task => (
                        <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow transition-shadow relative group">
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="pr-6">
                            <h5 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{task.title}</h5>
                            {task.description && <p className="text-gray-500 text-xs mb-3 line-clamp-3 leading-relaxed">{task.description}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 block uppercase">Assigned To</span>
                              <span className="font-bold text-gray-700">{task.assigned_to || 'Unassigned'}</span>
                            </div>
                            {task.due_date && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-gray-400 block uppercase">Due Date</span>
                                <span className="font-bold text-gray-700">{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                              task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {task.priority} Priority
                            </span>
                            <select 
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="text-xs font-bold border-none bg-purple-50 text-purple-700 px-2 py-1 rounded-lg cursor-pointer focus:ring-1 focus:ring-purple-300"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* IN PROGRESS COLUMN */}
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                    <h4 className="font-black text-gray-800 text-sm tracking-wider uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> In Progress
                    </h4>
                    <span className="bg-white border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md text-xs">
                      {tasks.filter(t => t.status === 'In Progress').length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px] scrollbar-hide">
                    {tasks.filter(t => t.status === 'In Progress').length === 0 ? (
                      <p className="text-gray-400 text-xs font-semibold py-8 text-center italic">No tasks in progress</p>
                    ) : (
                      tasks.filter(t => t.status === 'In Progress').map(task => (
                        <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow transition-shadow relative group">
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="pr-6">
                            <h5 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{task.title}</h5>
                            {task.description && <p className="text-gray-500 text-xs mb-3 line-clamp-3 leading-relaxed">{task.description}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 block uppercase">Assigned To</span>
                              <span className="font-bold text-gray-700">{task.assigned_to || 'Unassigned'}</span>
                            </div>
                            {task.due_date && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-gray-400 block uppercase">Due Date</span>
                                <span className="font-bold text-gray-700">{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                              task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {task.priority} Priority
                            </span>
                            <select 
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="text-xs font-bold border-none bg-purple-50 text-purple-700 px-2 py-1 rounded-lg cursor-pointer focus:ring-1 focus:ring-purple-300"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COMPLETED COLUMN */}
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                    <h4 className="font-black text-gray-800 text-sm tracking-wider uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span> Completed
                    </h4>
                    <span className="bg-white border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md text-xs">
                      {tasks.filter(t => t.status === 'Completed').length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px] scrollbar-hide">
                    {tasks.filter(t => t.status === 'Completed').length === 0 ? (
                      <p className="text-gray-400 text-xs font-semibold py-8 text-center italic">No completed tasks yet</p>
                    ) : (
                      tasks.filter(t => t.status === 'Completed').map(task => (
                        <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow transition-shadow relative group opacity-85">
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="pr-6">
                            <h5 className="font-bold text-gray-900 text-sm mb-1 leading-snug line-through text-gray-500">{task.title}</h5>
                            {task.description && <p className="text-gray-400 text-xs mb-3 line-clamp-3 leading-relaxed">{task.description}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 block uppercase">Assigned To</span>
                              <span className="font-bold text-gray-700">{task.assigned_to || 'Unassigned'}</span>
                            </div>
                            {task.due_date && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-gray-400 block uppercase">Due Date</span>
                                <span className="font-bold text-gray-700">{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-green-50 text-green-700 border-green-100">
                              Done
                            </span>
                            <select 
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="text-xs font-bold border-none bg-purple-50 text-purple-700 px-2 py-1 rounded-lg cursor-pointer focus:ring-1 focus:ring-purple-300"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'coldcalling' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Cold Calling Workspace</h2>
                  <p className="text-gray-500 font-medium mt-1">Manage outbound calls, update client responses, and monitor daily progress.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                  {isCeo && (
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="text-xs text-gray-500 font-bold">Sheet Assignee:</span>
                      <select 
                        value={selectedAssigneeFilter} 
                        onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
                        className="text-xs font-bold border-none bg-transparent text-purple-700 cursor-pointer focus:ring-0 p-0 focus:outline-none"
                      >
                        <option value="All">All Sheets</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.full_name}>{m.full_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button 
                    onClick={fetchColdLeads} 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Loader2 className="w-4 h-4" /> Refresh Leads
                  </button>
                </div>
              </div>

              {/* Stats & Progress Tracker Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Statistics Cards */}
                <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Leads</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">{totalLeadsCount}</h3>
                    <span className="text-xs text-gray-500 mt-1 block">In current list</span>
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Approached</span>
                    <h3 className="text-2xl font-black text-emerald-600 mt-2">{approachedLeadsCount}</h3>
                    <span className="text-xs text-emerald-600 mt-1 block">Calls completed</span>
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending Calls</span>
                    <h3 className="text-2xl font-black text-amber-600 mt-2">{pendingLeadsCount}</h3>
                    <span className="text-xs text-amber-500 mt-1 block">Needs contact</span>
                  </div>
                </div>

                {/* Daily Calls Target Progress Card */}
                <div className="bg-gradient-to-br from-purple-900 to-[#0f172a] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Your Daily Target</span>
                      <span className="text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        {Math.ceil((teamMemberData?.weekly_call_target || 50) / 5)} Calls / Day
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-2xl font-black">
                        {callsMadeToday} <span className="text-xs text-slate-400">/ {Math.ceil((teamMemberData?.weekly_call_target || 50) / 5)} completed</span>
                      </h4>
                      <span className="text-xs font-bold text-purple-300">
                        {Math.min(100, Math.round((callsMadeToday / Math.ceil((teamMemberData?.weekly_call_target || 50) / 5)) * 100))}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-2.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (callsMadeToday / Math.ceil((teamMemberData?.weekly_call_target || 50) / 5)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Inline Weekly Goal Editor */}
                  <form onSubmit={handleSaveWeeklyTarget} className="mt-4 flex gap-2 items-center bg-white/5 border border-white/10 p-2 rounded-xl">
                    <input 
                      type="number"
                      min="1"
                      required
                      placeholder="Goal"
                      value={weeklyTargetInput}
                      onChange={(e) => setWeeklyTargetInput(e.target.value)}
                      className="w-16 px-2 py-1 text-xs rounded-lg border border-purple-500/30 bg-purple-950/40 text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <span className="text-[10px] text-purple-200 font-bold whitespace-nowrap">weekly goal</span>
                    <button 
                      type="submit"
                      disabled={isSavingWeeklyTarget}
                      className="ml-auto px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      {isSavingWeeklyTarget ? 'Saving...' : 'Update'}
                    </button>
                  </form>
                </div>

              </div>

              {/* CEO Admin Controls */}
              {isCeo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 border border-slate-200/80 p-6 rounded-3xl">
                  
                  {/* CSV Upload & Manual Lead Inputs */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-600 animate-pulse" /> Share Leads (CEO only)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CSV File Input */}
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Assign Sheet To (Required)</label>
                          <select 
                            value={selectedAssignee}
                            onChange={(e) => setSelectedAssignee(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-800 font-semibold mb-4"
                          >
                            <option value="">Choose Team Member</option>
                            {teamMembers.map(m => (
                              <option key={m.id} value={m.full_name}>{m.full_name} ({m.role})</option>
                            ))}
                          </select>

                          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Upload CSV Sheet</label>
                          <div className="relative border-2 border-dashed border-purple-100 hover:border-purple-300 bg-purple-50/20 hover:bg-purple-50/40 rounded-xl p-4 transition-all flex flex-col items-center justify-center cursor-pointer text-center group">
                            <input 
                              type="file" 
                              accept=".csv"
                              onChange={handleCSVUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <TrendingUp className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform mb-1.5" />
                            <span className="text-[11px] font-black text-purple-700">Choose CSV File</span>
                            <span className="text-[9px] text-gray-400 font-bold mt-1">Excel layout A-K Columns</span>
                          </div>
                        </div>
                      </div>

                      {/* Sheet Cleanup Tools */}
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">Sheet Cleanup Tools</label>
                          <p className="text-[10px] text-gray-400 font-semibold mb-4 leading-relaxed">Admin controls to delete approached/completed calls or reset the database sheet.</p>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <button 
                            type="button"
                            onClick={handleDeleteApproachedLeads}
                            className="w-full text-center py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Delete Completed Calls
                          </button>
                          <button 
                            type="button"
                            onClick={handleClearAllLeads}
                            className="w-full text-center py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-100 rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Wipe Entire Lead Sheet
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Manual Lead Form */}
                  <form onSubmit={handleAddColdLead} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Plus className="w-4 h-4 text-emerald-600 animate-pulse" /> Add Lead Manually
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <input 
                        type="text" 
                        placeholder="Business Name" 
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Phone (+91...)" 
                        required
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Category" 
                        value={leadCategory}
                        onChange={(e) => setLeadCategory(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Address" 
                        value={leadLocation}
                        onChange={(e) => setLeadLocation(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Rating (e.g. 4.9)" 
                        value={leadRating}
                        onChange={(e) => setLeadRating(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Reviews count (e.g. 63)" 
                        value={leadReviews}
                        onChange={(e) => setLeadReviews(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Website (No website...)" 
                        value={leadWebsite}
                        onChange={(e) => setLeadWebsite(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <select 
                        value={leadPriority}
                        onChange={(e) => setLeadPriority(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs"
                      >
                        <option value="High">Priority: High</option>
                        <option value="Medium">Priority: Medium</option>
                        <option value="Low">Priority: Low</option>
                      </select>
                      <select 
                        value={leadCallOrNot}
                        onChange={(e) => setLeadCallOrNot(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs"
                      >
                        <option value="Yes - Call">Call: Yes</option>
                        <option value="No - Don't Call">Call: No</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Website Type Needed" 
                        value={leadWebsiteType}
                        onChange={(e) => setLeadWebsiteType(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Price Range (e.g. ₹4,999 - 9,999)" 
                        value={leadSuggestedPrice}
                        onChange={(e) => setLeadSuggestedPrice(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Key Hook / Pain Point" 
                        value={leadKeyHook}
                        onChange={(e) => setLeadKeyHook(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Google Maps Link" 
                        value={leadGoogleMaps}
                        onChange={(e) => setLeadGoogleMaps(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2 font-semibold"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmittingLead}
                      className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> {isSubmittingLead ? 'Adding...' : 'Add Lead'}
                    </button>
                  </form>
                </div>
              )}

              {/* Leads List Workspace */}
              <div className="space-y-4">
                
                {/* Leads Filter Navigation */}
                <div className="flex gap-2 border-b border-gray-200 pb-2 select-none">
                  <button 
                    onClick={() => setColdLeadsFilter('Pending')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                      coldLeadsFilter === 'Pending' 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Pending Calls ({myLeads.filter(l => l.status === 'Pending').length})
                  </button>
                  <button 
                    onClick={() => setColdLeadsFilter('Approached')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                      coldLeadsFilter === 'Approached' 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Approached / Logged ({myLeads.filter(l => l.status === 'Approached').length})
                  </button>
                  <button 
                    onClick={() => setColdLeadsFilter('History')}
                    className={`px-4 py-2 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                      coldLeadsFilter === 'History' 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Overall History ({coldLeads.filter(l => l.status === 'Approached').length})
                  </button>
                </div>

                {/* Table representation */}
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-100 border-b border-gray-200 uppercase tracking-wider">
                        <th className="p-3.5 font-black whitespace-nowrap">Client Name</th>
                        <th className="p-3.5 font-black whitespace-nowrap">Phone Number</th>
                        {coldLeadsFilter === 'Pending' && <th className="p-3.5 font-black text-center whitespace-nowrap">Actions</th>}
                        <th className="p-3.5 font-black whitespace-nowrap">Category</th>
                        <th className="p-3.5 font-black whitespace-nowrap">Rating/Reviews</th>
                        <th className="p-3.5 font-black whitespace-nowrap">Website Status</th>
                        {coldLeadsFilter === 'History' && (
                          <th className="p-3.5 font-black whitespace-nowrap">Pain Point / Maps</th>
                        )}
                        {coldLeadsFilter !== 'History' && (
                          <>
                            <th className="p-3.5 font-black whitespace-nowrap">Priority</th>
                            <th className="p-3.5 font-black whitespace-nowrap">Web Needed</th>
                            <th className="p-3.5 font-black whitespace-nowrap">Suggested Price</th>
                          </>
                        )}
                        {(isCeo || coldLeadsFilter === 'History') && <th className="p-3.5 font-black whitespace-nowrap">Assigned/Called By</th>}
                        {(coldLeadsFilter === 'Approached' || coldLeadsFilter === 'History') && (
                          <>
                            <th className="p-3.5 font-black whitespace-nowrap">Call Feedback</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {leadsToDisplay.length === 0 ? (
                        <tr>
                          <td colSpan={coldLeadsFilter === 'Approached' ? (isCeo ? 11 : 10) : coldLeadsFilter === 'History' ? 8 : (isCeo ? 10 : 9)} className="p-12 text-center text-gray-500 font-medium">
                            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            No cold calling leads found under this filter.
                          </td>
                        </tr>
                      ) : (
                        leadsToDisplay.map(lead => (
                          <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                            <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{lead.client_name}</td>
                            <td className="p-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {lead.phone_number}
                                <a 
                                  href={`tel:${lead.phone_number}`}
                                  className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
                                  title="Call Number"
                                >
                                  <Phone size={12} />
                                </a>
                              </div>
                            </td>
                            {coldLeadsFilter === 'Pending' && (
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <div className="flex justify-center items-center gap-1.5">
                                  <button 
                                    onClick={() => setSelectedLead(lead)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-100 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckSquare size={12} /> Log Call
                                  </button>
                                  
                                  {isCeo && (
                                    <>
                                      <button 
                                        onClick={() => handleUpdateColdLeadNumber(lead)}
                                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                        title="Edit Phone Number"
                                      >
                                        <Plus className="w-3.5 h-3.5 rotate-45" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteColdLead(lead.id)}
                                        className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors cursor-pointer"
                                        title="Delete Lead"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="p-3.5 text-slate-600 whitespace-nowrap">{lead.business_type || 'N/A'}</td>
                            <td className="p-3.5 text-slate-700 whitespace-nowrap">
                              {lead.rating ? (
                                <div className="flex items-center gap-1 font-semibold">
                                  <span className="text-amber-500 font-bold">★</span>
                                  <span>{lead.rating}</span>
                                  {lead.reviews && <span className="text-gray-400 font-medium">({lead.reviews})</span>}
                                </div>
                              ) : (
                                <span className="text-gray-400 font-medium">-</span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-600 whitespace-nowrap max-w-[150px] truncate" title={lead.website}>
                              {lead.website && lead.website.toLowerCase() !== 'no website' && !lead.website.toLowerCase().includes('no') ? (
                                <a 
                                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-purple-600 hover:underline font-semibold inline-flex items-center gap-1"
                                >
                                  {lead.website} <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-gray-400 font-semibold">No Website</span>
                              )}
                            </td>
                            {coldLeadsFilter === 'History' && (
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="max-w-[150px] truncate text-slate-700 font-bold" title={lead.key_hook_pain_point || 'No Pain Point'}>
                                  {lead.key_hook_pain_point || 'N/A'}
                                </div>
                                {lead.google_maps_link && (
                                  <a 
                                    href={lead.google_maps_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-indigo-600 hover:underline inline-flex items-center gap-0.5 mt-0.5 font-bold"
                                  >
                                    <MapIcon size={10} /> Maps
                                  </a>
                                )}
                              </td>
                            )}
                            {coldLeadsFilter !== 'History' && (
                              <>
                                <td className="p-3.5 whitespace-nowrap">
                                  <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                    lead.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                    lead.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                    'bg-green-50 text-green-700 border-green-100'
                                  }`}>
                                    {lead.priority || 'Medium'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-600 font-medium whitespace-nowrap max-w-[150px] truncate" title={lead.website_type_needed}>{lead.website_type_needed || 'N/A'}</td>
                                <td className="p-3.5 whitespace-nowrap">
                                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/50">
                                    {lead.suggested_price || 'N/A'}
                                  </span>
                                </td>
                              </>
                            )}
                            {(isCeo || coldLeadsFilter === 'History') && (
                              <td className="p-3.5 text-xs font-bold text-purple-700 bg-purple-50/30 whitespace-nowrap">
                                {lead.approached_by || lead.assigned_to || 'N/A'}
                              </td>
                            )}
                            {(coldLeadsFilter === 'Approached' || coldLeadsFilter === 'History') && (
                              <>
                                <td className="p-3.5 text-xs text-slate-600 font-medium max-w-[200px] truncate" title={lead.remarks}>
                                  {lead.remarks}
                                </td>
                              </>
                            )}

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Log Call Feedback Dialog Modal */}
              <AnimatePresence>
                {selectedLead && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedLead(null)}
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
                    />
                     <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="fixed top-[5%] md:top-[10%] left-[50%] translate-x-[-50%] w-full max-w-lg bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 z-[60] text-slate-800 max-h-[90vh] md:max-h-[80vh] overflow-y-auto"
                    >
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                        <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-600" /> Log Call Outcome
                        </h3>
                        <button 
                          onClick={() => setSelectedLead(null)} 
                          className="p-1 rounded hover:bg-slate-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Client Contact</span>
                        <h4 className="font-bold text-slate-900 mt-0.5">{selectedLead.client_name} ({selectedLead.phone_number})</h4>
                      </div>

                      {/* Pitch Helper Card / Lead Statistics */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 mb-4 text-xs">
                        <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                          💼 Pitch Assistance Card
                        </h5>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                          <div>
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Category</span>
                            <span className="text-slate-800 font-semibold block mt-0.5">{selectedLead.business_type || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Rating & Reviews</span>
                            <span className="text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                              {selectedLead.rating ? `★ ${selectedLead.rating}` : 'N/A'} 
                              {selectedLead.reviews ? `(${selectedLead.reviews} reviews)` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Current Website</span>
                            {selectedLead.website && selectedLead.website.toLowerCase() !== 'no website' && !selectedLead.website.toLowerCase().includes('no') ? (
                              <a 
                                href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-purple-600 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                              >
                                {selectedLead.website} <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-gray-500 font-semibold block mt-0.5">No Website</span>
                            )}
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Suggested Solution</span>
                            <span className="text-slate-800 font-semibold block mt-0.5">{selectedLead.website_type_needed || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Suggested Budget</span>
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50 inline-block mt-0.5">
                              {selectedLead.suggested_price || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Lead Priority</span>
                            <span className={`inline-block font-extrabold text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider mt-0.5 ${
                              selectedLead.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                              selectedLead.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {selectedLead.priority || 'Medium'}
                            </span>
                          </div>
                          {selectedLead.key_hook_pain_point && (
                            <div className="col-span-2">
                              <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Key Hook / Pain Point</span>
                              <span className="text-slate-800 font-semibold block mt-0.5 whitespace-pre-wrap">{selectedLead.key_hook_pain_point}</span>
                            </div>
                          )}
                          {selectedLead.google_maps_link && (
                            <div className="col-span-2">
                              <span className="block text-[9px] uppercase text-gray-400 font-extrabold">Google Maps Link</span>
                              <a 
                                href={selectedLead.google_maps_link}
                                target="_blank" 
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                              >
                                <MapIcon size={12} /> Open in Google Maps <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <form onSubmit={handleSaveCallFeedback} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Call Feedback / Remarks</label>
                          <textarea 
                            rows={3}
                            required
                            placeholder="e.g. Discussed website packages. They want a portfolio website. Scheduled a follow-up call on Monday."
                            value={leadRemarks}
                            onChange={(e) => setLeadRemarks(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 resize-none font-medium"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setSelectedLead(null)}
                            className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSavingFeedback}
                            className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isSavingFeedback ? <Loader2 size={14} className="animate-spin" /> : 'Save Call & Log'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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

      {/* 1000+ leads goals configuration modal */}
      <AnimatePresence>
        {showTargetSetupModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
              onClick={() => {
                setShowTargetSetupModal(false);
                if (teamMemberData) {
                  sessionStorage.setItem(`dismissed_goal_prompt_${teamMemberData.id}`, 'true');
                }
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-[25%] left-[50%] translate-x-[-50%] w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-3xl p-6 z-[110] text-slate-800 space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  🚀
                </div>
                <h3 className="text-lg font-black text-slate-900">Set Weekly Cold Calling Goal</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  We currently have a large database of <span className="text-purple-600 font-black">{coldLeads.length} leads</span>.
                  What is your working goal for this week? How many client approaches are you going to do?
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!weeklyTargetInput || isNaN(weeklyTargetInput) || parseInt(weeklyTargetInput) <= 0) {
                    alert("Please enter a valid weekly target count.");
                    return;
                  }
                  setIsSavingWeeklyTarget(true);
                  const { error } = await supabase
                    .from('team_members')
                    .update({ weekly_call_target: parseInt(weeklyTargetInput) })
                    .eq('id', teamMemberData.id);
                  setIsSavingWeeklyTarget(false);
                  if (error) {
                    alert("Error saving weekly target: " + error.message);
                  } else {
                    alert("Weekly call target set successfully!");
                    setTeamMemberData(prev => ({ ...prev, weekly_call_target: parseInt(weeklyTargetInput) }));
                    setShowTargetSetupModal(false);
                    sessionStorage.setItem(`dismissed_goal_prompt_${teamMemberData.id}`, 'true');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider text-center">Weekly Approaches Target</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 100"
                    value={weeklyTargetInput}
                    onChange={(e) => setWeeklyTargetInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-bold text-slate-800 text-base"
                  />
                  <p className="text-[10px] text-center text-slate-400 font-semibold mt-1.5">
                    This will automatically calculate a daily target of <span className="text-slate-700 font-bold">{Math.ceil((parseInt(weeklyTargetInput) || 50) / 5)} calls</span> per day.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowTargetSetupModal(false);
                      if (teamMemberData) {
                        sessionStorage.setItem(`dismissed_goal_prompt_${teamMemberData.id}`, 'true');
                      }
                    }}
                    className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingWeeklyTarget}
                    className="flex-grow py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isSavingWeeklyTarget ? 'Saving...' : 'Set Working Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDashboard;
