import React, { useState, useEffect, useMemo } from 'react';
import { 
  IndianRupee, 
  Wallet, 
  TrendingUp, 
  PlusCircle, 
  Trash2, 
  Edit2, 
  Search, 
  Download, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Sparkles, 
  X, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Sliders,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Internship Fee (Offline / Direct)',
  'Client Web / App Project',
  'College Workshop / Seminar',
  'Consulting & Technical Services',
  'Corporate Training',
  'Product / Merchandise Sale',
  'Sponsorship / Grant',
  'Balance Adjustment / Total Override',
  'Other Income'
];

const PAYMENT_METHODS = [
  'UPI (GPay / PhonePe / Paytm)',
  'Bank Transfer (NEFT / IMPS / RTGS)',
  'Cash',
  'Cheque / DD',
  'Direct Adjustment',
  'Other'
];

export default function EarningsManager({ registrations = [], onRefreshRegistrations }) {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [subTab, setSubTab] = useState('all'); // 'all', 'manual', 'students'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit Total / Adjustment State
  const [showEditTotalModal, setShowEditTotalModal] = useState(false);
  const [targetTotalAmount, setTargetTotalAmount] = useState('');
  const [totalAdjustmentReason, setTotalAdjustmentReason] = useState('Manual balance adjustment');

  // Edit Student Fee State
  const [showStudentFeeModal, setShowStudentFeeModal] = useState(false);
  const [editingStudentItem, setEditingStudentItem] = useState(null);
  const [studentFeeAmount, setStudentFeeAmount] = useState('');

  // Form State for Manual Income Entry
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [referenceId, setReferenceId] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Earnings on Mount (Supabase with localStorage fallback)
  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('received_date', { ascending: false });

      if (!error && data) {
        setEarnings(data);
        localStorage.setItem('dakh_admin_earnings', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('dakh_admin_earnings');
        if (cached) {
          setEarnings(JSON.parse(cached));
        }
      }
    } catch (err) {
      console.warn('Could not query earnings table:', err.message);
      const cached = localStorage.getItem('dakh_admin_earnings');
      if (cached) {
        setEarnings(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate Live Student Registration Revenue from approved interns
  const studentRevenueData = useMemo(() => {
    const approvedRegistrations = registrations.filter(r => r.status === 'Approved');
    let total = 0;
    const items = approvedRegistrations.map(r => {
      const rawPrice = String(r.plan_price || '0').replace(/[^0-9.]/g, '');
      const parsed = parseFloat(rawPrice) || 0;
      total += parsed;

      return {
        id: `reg_${r.id}`,
        title: `${r.full_name || 'Student'} - ${r.domain || 'Internship'}`,
        amount: parsed,
        category: 'Student Internship Fee',
        payment_method: r.utr_number && r.utr_number !== 'PENDING' ? `UPI (UTR: ${r.utr_number})` : 'Online UPI',
        reference_id: r.utr_number || 'N/A',
        received_date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: `Plan: ${r.plan_name || 'Standard'} • College: ${r.college || 'N/A'}`,
        isStudentFee: true,
        studentEmail: r.email,
        studentDomain: r.domain,
        rawRegId: r.id
      };
    });

    return { total, items, count: approvedRegistrations.length };
  }, [registrations]);

  // 2. Calculate Admin Manual Revenue
  const manualRevenueTotal = useMemo(() => {
    return earnings.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [earnings]);

  // 3. Grand Total
  const grandTotal = useMemo(() => {
    return studentRevenueData.total + manualRevenueTotal;
  }, [studentRevenueData.total, manualRevenueTotal]);

  // 4. This Month's Inflow
  const thisMonthTotal = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    let monthSum = 0;

    // From manual earnings
    earnings.forEach(e => {
      if (e.received_date && e.received_date.startsWith(currentMonth)) {
        monthSum += (parseFloat(e.amount) || 0);
      }
    });

    // From student registrations
    studentRevenueData.items.forEach(s => {
      if (s.received_date && s.received_date.startsWith(currentMonth)) {
        monthSum += s.amount;
      }
    });

    return monthSum;
  }, [earnings, studentRevenueData.items]);

  // Combined and filtered transaction list
  const displayTransactions = useMemo(() => {
    let combined = [];

    if (subTab === 'all') {
      combined = [
        ...earnings.map(e => ({ ...e, isManual: true })),
        ...studentRevenueData.items
      ];
    } else if (subTab === 'manual') {
      combined = earnings.map(e => ({ ...e, isManual: true }));
    } else if (subTab === 'students') {
      combined = studentRevenueData.items;
    }

    // Sort newest date first
    combined.sort((a, b) => (b.received_date || '').localeCompare(a.received_date || ''));

    // Search and category filter
    return combined.filter(item => {
      const matchSearch = !searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      return true;
    });
  }, [earnings, studentRevenueData.items, subTab, searchTerm, categoryFilter]);

  // Handle Add or Update Amount (Manual Entry)
  const handleSubmitAmount = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || (category !== 'Balance Adjustment / Total Override' && parsedAmount <= 0)) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    const newEntry = {
      title: title.trim(),
      amount: parsedAmount,
      category,
      payment_method: paymentMethod,
      reference_id: referenceId.trim() || null,
      received_date: receivedDate,
      notes: notes.trim() || null
    };

    try {
      if (editingEntry) {
        // Update in Supabase
        const { error } = await supabase
          .from('earnings')
          .update(newEntry)
          .eq('id', editingEntry.id);

        const updatedList = earnings.map(item => item.id === editingEntry.id ? { ...item, ...newEntry } : item);
        setEarnings(updatedList);
        localStorage.setItem('dakh_admin_earnings', JSON.stringify(updatedList));
      } else {
        // Insert new entry
        const entryWithId = {
          id: crypto.randomUUID ? crypto.randomUUID() : `earn_${Date.now()}`,
          ...newEntry,
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('earnings')
          .insert([entryWithId]);

        const updatedList = [entryWithId, ...earnings];
        setEarnings(updatedList);
        localStorage.setItem('dakh_admin_earnings', JSON.stringify(updatedList));
      }

      handleCloseModal();
      alert(editingEntry ? "Amount updated successfully!" : "Income entry added successfully!");
    } catch (err) {
      console.warn("Error saving to Supabase, saved to local cache:", err.message);
      if (editingEntry) {
        const updatedList = earnings.map(item => item.id === editingEntry.id ? { ...item, ...newEntry } : item);
        setEarnings(updatedList);
        localStorage.setItem('dakh_admin_earnings', JSON.stringify(updatedList));
      } else {
        const entryWithId = {
          id: `earn_${Date.now()}`,
          ...newEntry,
          created_at: new Date().toISOString()
        };
        const updatedList = [entryWithId, ...earnings];
        setEarnings(updatedList);
        localStorage.setItem('dakh_admin_earnings', JSON.stringify(updatedList));
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete manual entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this revenue entry?")) return;

    try {
      await supabase.from('earnings').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete remote error:", e.message);
    }

    const updated = earnings.filter(e => e.id !== id);
    setEarnings(updated);
    localStorage.setItem('dakh_admin_earnings', JSON.stringify(updated));
  };

  // Open edit modal for a manual entry
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title || '');
    setAmount(String(entry.amount || ''));
    setCategory(entry.category || CATEGORIES[0]);
    setPaymentMethod(entry.payment_method || PAYMENT_METHODS[0]);
    setReferenceId(entry.reference_id || '');
    setReceivedDate(entry.received_date || new Date().toISOString().split('T')[0]);
    setNotes(entry.notes || '');
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
    setTitle('');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setReferenceId('');
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  // -------------------------------------------------------------
  // FEATURE 1: EDIT GRAND TOTAL DIRECTLY (TARGET BALANCE OVERRIDE)
  // -------------------------------------------------------------
  const handleOpenEditTotalModal = () => {
    setTargetTotalAmount(String(grandTotal));
    setTotalAdjustmentReason('Manual balance adjustment');
    setShowEditTotalModal(true);
  };

  const handleSaveTotalAdjustment = async (e) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetTotalAmount);
    if (isNaN(parsedTarget)) {
      alert("Please enter a valid numeric target amount.");
      return;
    }

    const delta = Math.round((parsedTarget - grandTotal) * 100) / 100;
    if (delta === 0) {
      alert("Target total is already equal to current Grand Total.");
      setShowEditTotalModal(false);
      return;
    }

    setIsSubmitting(true);
    const adjustmentEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `adj_${Date.now()}`,
      title: totalAdjustmentReason.trim() || `Total Adjustment to ₹${parsedTarget.toLocaleString('en-IN')}`,
      amount: delta,
      category: 'Balance Adjustment / Total Override',
      payment_method: 'Direct Adjustment',
      reference_id: `ADJ_${Date.now().toString().slice(-6)}`,
      received_date: new Date().toISOString().split('T')[0],
      notes: `Grand total adjusted from ₹${grandTotal.toLocaleString('en-IN')} to ₹${parsedTarget.toLocaleString('en-IN')} (Delta: ${delta >= 0 ? '+' : ''}₹${delta.toLocaleString('en-IN')})`,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('earnings').insert([adjustmentEntry]);
    } catch (err) {
      console.warn("Could not insert adjustment into Supabase, saving locally:", err.message);
    }

    const updatedList = [adjustmentEntry, ...earnings];
    setEarnings(updatedList);
    localStorage.setItem('dakh_admin_earnings', JSON.stringify(updatedList));
    setShowEditTotalModal(false);
    setIsSubmitting(false);
    alert(`Grand Total updated successfully to ₹${parsedTarget.toLocaleString('en-IN')}!`);
  };

  // -------------------------------------------------------------
  // FEATURE 2: EDIT STUDENT REGISTRATION FEE
  // -------------------------------------------------------------
  const handleOpenEditStudentFee = (item) => {
    setEditingStudentItem(item);
    setStudentFeeAmount(String(item.amount || '0'));
    setShowStudentFeeModal(true);
  };

  const handleSaveStudentFee = async (e) => {
    e.preventDefault();
    const parsedFee = parseFloat(studentFeeAmount);
    if (isNaN(parsedFee) || parsedFee < 0) {
      alert("Please enter a valid non-negative fee amount.");
      return;
    }

    if (!editingStudentItem) return;
    const rawRegId = editingStudentItem.rawRegId || editingStudentItem.id.replace('reg_', '');
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ plan_price: String(parsedFee) })
        .eq('id', rawRegId);

      if (error) {
        throw error;
      }

      alert(`Student fee successfully updated to ₹${parsedFee.toLocaleString('en-IN')}!`);
      if (onRefreshRegistrations) {
        await onRefreshRegistrations();
      }
      setShowStudentFeeModal(false);
      setEditingStudentItem(null);
    } catch (err) {
      console.error("Error updating student fee:", err.message);
      alert("Could not update student fee in Supabase: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Title / Source', 'Category', 'Payment Method', 'Reference ID', 'Amount (INR)', 'Type', 'Notes'];
    const rows = displayTransactions.map(t => [
      t.received_date || '',
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.payment_method || ''}"`,
      `"${t.reference_id || ''}"`,
      t.amount || 0,
      t.isStudentFee ? 'Student Registration' : 'Admin Manual Entry',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DAKH_Total_Earnings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-600" />
            Total Money Earned & Revenue Hub
          </h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
            Real-time financial dashboard tracking student internship fees, client projects, and manual revenue entries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-xs"
            title="Download financial spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handleOpenEditTotalModal}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-purple-200 cursor-pointer shadow-xs"
            title="Directly edit or adjust Total Earnings"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Total Balance
          </button>

          <button
            type="button"
            onClick={() => {
              handleCloseModal();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + Add Amount / Income
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Grand Total */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-lg shadow-emerald-600/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-3 -bottom-4 text-emerald-500/20 pointer-events-none">
            <IndianRupee className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Grand Total Earned
              </span>
              <button
                type="button"
                onClick={handleOpenEditTotalModal}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                title="Edit Grand Total"
              >
                <Edit2 className="w-3 h-3" />
                Edit Total
              </button>
            </div>
            <div className="text-3xl font-black mt-2 tracking-tight">
              ₹{grandTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-100 font-medium mt-1">
              All time verified revenue
            </div>
          </div>
        </div>

        {/* Card 2: Student Registration Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Student Fees</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{studentRevenueData.total.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-purple-700 font-bold mt-1">
            {studentRevenueData.count} approved student payments
          </div>
        </div>

        {/* Card 3: Admin Manual Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">Other / Project Income</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{manualRevenueTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-blue-700 font-bold mt-1">
            {earnings.length} admin manual income entries
          </div>
        </div>

        {/* Card 4: This Month's Income */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">This Month's Inflow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{thisMonthTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Earned in {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Financial Ledger Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        {/* Controls Bar: Sub-Tabs, Search, and Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sub Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/60">
            <button
              type="button"
              onClick={() => setSubTab('all')}
              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                subTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Inflows ({earnings.length + studentRevenueData.items.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('manual')}
              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                subTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Added ({earnings.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('students')}
              className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                subTab === 'students'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Fees ({studentRevenueData.items.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search description, UTR, student..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full sm:w-60"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Student Internship Fee">Student Internship Fee</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Source / Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                displayTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                      {item.received_date ? new Date(item.received_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900">{item.title}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 max-w-sm">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        item.isStudentFee 
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.category === 'Balance Adjustment / Total Override'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700 font-medium text-[11px]">{item.payment_method}</div>
                      {item.reference_id && item.reference_id !== 'N/A' && (
                        <div className="text-[10px] font-mono text-slate-400">Ref: {item.reference_id}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-sm whitespace-nowrap">
                      <span className={item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {item.amount >= 0 ? '+' : ''}₹{parseFloat(item.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {item.isManual ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg inline-flex items-center gap-1 border border-purple-200 cursor-pointer transition-colors shadow-2xs"
                            title="Edit this income entry"
                          >
                            <Edit2 className="w-3 h-3 text-purple-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete this entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudentFee(item)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg inline-flex items-center gap-1 border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                            title="Edit this student's fee amount"
                          >
                            <Edit2 className="w-3 h-3 text-amber-600" />
                            <span>Edit Fee</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD / EDIT MANUAL INCOME ENTRY                        */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {editingEntry ? <Edit2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingEntry ? 'Edit Income Entry' : 'Add New Money Earned'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingEntry ? 'Update existing revenue record details' : 'Record payments, client projects, or offline student fees.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitAmount} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Amount in INR (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Source / Title / Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Website Development - ABC Enterprises"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Ref ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Date Received</label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Transaction UTR / Ref (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI/4928172918"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Notes / Memo (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Extra details, student register number, client scope, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Income Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT GRAND TOTAL BALANCE DIRECTLY                     */}
      {/* ============================================================== */}
      {showEditTotalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Edit Total Earnings</h3>
                  <p className="text-xs text-slate-500">Set a target total or balance adjustment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditTotalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTotalAdjustment} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Grand Total</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">₹{grandTotal.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Adjustment Delta</div>
                  <div className={`text-sm font-black mt-0.5 ${
                    (parseFloat(targetTotalAmount) || 0) - grandTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {((parseFloat(targetTotalAmount) || 0) - grandTotal) >= 0 ? '+' : ''}
                    ₹{((parseFloat(targetTotalAmount) || 0) - grandTotal).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Desired / Target Grand Total (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={targetTotalAmount}
                    onChange={(e) => setTargetTotalAmount(e.target.value)}
                    placeholder="Enter desired total amount"
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-black text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  System will automatically log an audit adjustment so the Grand Total matches this value exactly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason / Adjustment Title
                </label>
                <input
                  type="text"
                  value={totalAdjustmentReason}
                  onChange={(e) => setTotalAdjustmentReason(e.target.value)}
                  placeholder="e.g. Offline cash adjustment, Opening balance"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditTotalModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Updating...' : 'Save & Update Total'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT STUDENT INTERNSHIP FEE                           */}
      {/* ============================================================== */}
      {showStudentFeeModal && editingStudentItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Edit Student Fee</h3>
                  <p className="text-xs text-slate-500">{editingStudentItem.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStudentFeeModal(false);
                  setEditingStudentItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentFee} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                <div className="text-slate-500">Student: <span className="font-bold text-slate-800">{editingStudentItem.studentEmail || 'N/A'}</span></div>
                <div className="text-slate-500">Domain: <span className="font-bold text-slate-800">{editingStudentItem.studentDomain || 'N/A'}</span></div>
                <div className="text-slate-500">Current Fee: <span className="font-bold text-emerald-600">₹{editingStudentItem.amount}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Updated Fee Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={studentFeeAmount}
                    onChange={(e) => setStudentFeeAmount(e.target.value)}
                    placeholder="Enter new fee amount"
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-black text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This will update the registration record in Supabase and recalculate student revenue automatically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentFeeModal(false);
                    setEditingStudentItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Updating...' : 'Update Student Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
