import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, UserMinus, ShieldAlert, CheckCircle2, UserCircle } from 'lucide-react';

const TeamStudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

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

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-4">
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
