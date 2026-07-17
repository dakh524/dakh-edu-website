import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Loader2, UserMinus, ShieldAlert, CheckCircle2, UserCircle, Plus, Mail, User, BookOpen } from 'lucide-react';

const TeamStudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInternName, setNewInternName] = useState('');
  const [newInternEmail, setNewInternEmail] = useState('');
  const [newInternDomain, setNewInternDomain] = useState('Web Development');
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const domains = ['Web Development', 'UI/UX Design', 'App Development', 'Data Science'];

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

  const handleAddIntern = async (e) => {
    e.preventDefault();
    if (!newInternName || !newInternEmail || !newInternDomain) return;
    setIsAdding(true);
    setError(null);
    setGeneratedPassword(null);

    const email = newInternEmail.trim().toLowerCase();
    const tempPassword = `Dakh@${Math.floor(1000 + Math.random() * 9000)}${Math.random().toString(36).substring(2, 5)}`;
    const internNumber = `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Use a secondary client with in-memory storage to prevent logging out the current admin
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
        status: 'Active',
        progress_percentage: 0
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
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          {students.length} Active Interns
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
                  <select value={newInternDomain} onChange={e => setNewInternDomain(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none">
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
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
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">{student.full_name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-lg mb-1">{student.intern_number}</div>
                    <div className="text-xs text-slate-500 font-medium">{student.domain}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {student.status || 'Active'}
                    </div>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamStudentManager;
