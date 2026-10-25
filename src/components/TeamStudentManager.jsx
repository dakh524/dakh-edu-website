import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { 
  Loader2, UserMinus, ShieldAlert, CheckCircle2, UserCircle, Plus, Mail, User, BookOpen, 
  Lock, Key, Copy, Check, Edit2, RefreshCw, Eye, EyeOff, X 
} from 'lucide-react';

const TeamStudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInternName, setNewInternName] = useState('');
  const [newInternEmail, setNewInternEmail] = useState('');
  const [newInternDomain, setNewInternDomain] = useState('Web Development');
  const [newInternDuration, setNewInternDuration] = useState('1 Month Masterclass');
  const [newInternStartDate, setNewInternStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newInternEndDate, setNewInternEndDate] = useState('');
  
  const generateRandomPassword = () => `Dakh@${Math.floor(1000 + Math.random() * 9000)}abc`;
  const [newInternPassword, setNewInternPassword] = useState(generateRandomPassword());
  
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [copiedId, setCopiedId] = useState(null);
  const [showPasswords, setShowPasswords] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editPasswordInput, setEditPasswordInput] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const domains = ['Web Development', 'UI/UX Design', 'App Development', 'Data Science', 'Vibe Coding', 'Machine Learning', 'Full Stack Development'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to completely remove access for ${student.full_name}? This will delete their progress.`)) {
      return;
    }

    setActionLoading(student.id);
    try {
      // Deleting from students table effectively revokes their access because
      // StudentLogin checks the students table on login.
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;
      
      setStudents(prev => prev.filter(s => s.id !== student.id));
      alert(`Access revoked for ${student.full_name}`);
    } catch (err) {
      alert("Error revoking access: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPassword = (pass, id) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEditPassword = (student) => {
    setEditingStudent(student);
    setEditPasswordInput(student.password || generateRandomPassword());
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!editingStudent || !editPasswordInput.trim()) return;
    setIsSavingPassword(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({ password: editPasswordInput.trim() })
        .eq('id', editingStudent.id);

      if (error) throw error;

      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, password: editPasswordInput.trim() } : s));
      setEditingStudent(null);
    } catch (err) {
      alert("Failed to update password: " + err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleQuickGeneratePassword = async (student) => {
    const newPass = generateRandomPassword();
    setActionLoading(`pass_${student.id}`);
    try {
      const { error } = await supabase
        .from('students')
        .update({ password: newPass })
        .eq('id', student.id);

      if (error) throw error;

      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, password: newPass } : s));
    } catch (err) {
      alert("Failed to set password: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddIntern = async (e) => {
    e.preventDefault();
    if (!newInternName || !newInternEmail || !newInternDomain) return;
    setIsAdding(true);
    setError(null);
    setGeneratedPassword(null);

    const email = newInternEmail.trim().toLowerCase();
    const internNumber = `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const tempPassword = newInternPassword;

    try {
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email: email,
        password: tempPassword,
        options: {
          data: {
            full_name: newInternName,
            domain: newInternDomain,
          }
        }
      });

      if (authError) throw authError;

      const newStudent = {
        auth_id: authData.user ? authData.user.id : null,
        full_name: newInternName,
        email: email,
        intern_number: internNumber,
        domain: newInternDomain,
        duration: newInternDuration,
        start_date: newInternStartDate || null,
        end_date: newInternEndDate || null,
        status: 'Active',
        progress_percentage: 0,
        password: tempPassword
      };

      const { data: insertedStudent, error: insertError } = await supabase
        .from('students')
        .insert([newStudent])
        .select()
        .single();

      if (insertError) throw insertError;

      setStudents([insertedStudent, ...students]);
      setGeneratedPassword(tempPassword);
      setNewInternName('');
      setNewInternEmail('');
      setNewInternDomain('Web Development');
      setNewInternDuration('1 Month Masterclass');
      setNewInternEndDate('');
      setNewInternPassword(generateRandomPassword());
    } catch (err) {
      setError("Failed to add intern: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">Intern Management</h3>
          <p className="text-gray-500 text-sm">View and manage active intern credentials and progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            title={showPasswords ? "Hide password text" : "Show password text"}
          >
            {showPasswords ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-purple-600" />}
            {showPasswords ? "Hide Passwords" : "Show Passwords"}
          </button>
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm">
            <UserCircle className="w-5 h-5" />
            {students.length} Active Interns
          </div>
        </div>
      </div>

      <div className="mb-8">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Intern
        </button>

        {showAddForm && (
          <form onSubmit={handleAddIntern} className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4">
            <h4 className="font-black text-gray-900 mb-2">Create Intern Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={newInternName} onChange={e => setNewInternName(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gmail ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={newInternEmail} onChange={e => setNewInternEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="intern@gmail.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Domain</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    list="intern-domains-list"
                    value={newInternDomain} 
                    onChange={e => setNewInternDomain(e.target.value)} 
                    placeholder="Select or type domain"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                  <datalist id="intern-domains-list">
                    {domains.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={newInternDuration} onChange={e => setNewInternDuration(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none">
                    <option value="1 Month Masterclass">1 Month Masterclass</option>
                    <option value="15 Days Sprint">15 Days Sprint</option>
                    <option value="2 Months Special">2 Months Special</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={newInternPassword} onChange={e => setNewInternPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                <input type="date" value={newInternStartDate} onChange={e => setNewInternStartDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                <input type="date" value={newInternEndDate} onChange={e => setNewInternEndDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={isAdding} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCircle className="w-4 h-4" />}
                Generate Credentials
              </button>
            </div>
          </form>
        )}
      </div>

      {generatedPassword && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center gap-2 font-black mb-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" /> Credentials Generated Successfully!
          </div>
          <p className="text-sm font-medium">Please securely share these login details with the intern:</p>
          <div className="mt-2 p-3 bg-white rounded-lg border border-emerald-100 font-mono text-sm inline-block">
            <strong>Password:</strong> {generatedPassword}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-6">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">Intern</th>
              <th className="py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">Details</th>
              <th className="py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">No interns found.</td>
              </tr>
            ) : (
              students.map((student) => {
                const isExpired = student.end_date && new Date() > new Date(student.end_date);
                return (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">{student.full_name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-lg mb-1">{student.intern_number}</div>
                    <div className="text-xs text-slate-500 font-medium">{student.domain}</div>
                    
                    {/* Password Badge & Controls */}
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {student.password ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 transition-colors border border-slate-200/90 px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-800">
                          <Key className="w-3 h-3 text-purple-600" />
                          <span className="font-bold text-slate-500">Pass:</span>
                          <span className="font-semibold text-purple-900 select-all">
                            {showPasswords ? student.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(student.password, student.id)}
                            className="p-0.5 text-slate-400 hover:text-purple-600 transition-colors ml-0.5 rounded cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedId === student.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditPassword(student)}
                            className="p-0.5 text-slate-400 hover:text-purple-600 transition-colors rounded cursor-pointer"
                            title="Edit Password"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoading === `pass_${student.id}`}
                          onClick={() => handleQuickGeneratePassword(student)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          title="Generate a password for this intern"
                        >
                          {actionLoading === `pass_${student.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Key className="w-3 h-3 text-amber-600" />
                          )}
                          <span>+ Set Password</span>
                        </button>
                      )}
                    </div>

                    {student.end_date && <div className="text-[10px] text-slate-400 mt-1 font-medium tracking-wide">Ends: {student.end_date}</div>}
                  </td>
                  <td className="py-4 px-4">
                    {isExpired ? (
                      <div className="flex flex-col gap-1 w-fit">
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold border border-red-200">
                          <Lock className="w-3.5 h-3.5" />
                          Expired
                        </div>
                        <span className="text-[10px] text-red-500 font-bold whitespace-nowrap bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Remove auth from Supabase</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {student.status || 'Active'}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      disabled={actionLoading === student.id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
                      title="Revoke login access and delete progress"
                    >
                      {actionLoading === student.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                      Revoke Access
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Password Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Edit Intern Password</h4>
                  <p className="text-xs text-gray-500">{editingStudent.full_name} ({editingStudent.email})</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editPasswordInput}
                    onChange={(e) => setEditPasswordInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white font-mono text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    placeholder="e.g. Dakh@2394abc"
                  />
                  <button
                    type="button"
                    onClick={() => setEditPasswordInput(generateRandomPassword())}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                    title="Generate Random Password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Random
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword || !editPasswordInput.trim()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStudentManager;
