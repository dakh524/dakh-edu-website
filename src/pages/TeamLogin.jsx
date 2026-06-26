import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TeamLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Verify if email exists in the team_members table
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (teamError) throw teamError;

      if (!teamMember) {
        setError("Access Denied: This email address is not registered as a team member. Please contact the administrator.");
        setLoading(false);
        return;
      }

      if (isSignUpMode) {
        // 2a. First-time registration: Sign up through Supabase Auth
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: teamMember.full_name,
              role: teamMember.role || 'Member'
            }
          }
        });
        
        if (signUpError) throw signUpError;
        alert("Account setup successful! You can now log in.");
        setIsSignUpMode(false);
      } else {
        // 2b. Standard Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInError) throw signInError;
        navigate('/team/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100"
      >
        <div className="bg-[#0f172a] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500"></div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Team Portal</h2>
          <p className="text-gray-400 mt-2 font-medium">
            {isSignUpMode ? 'Set up your team credentials' : 'Secure team dashboard login'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Team Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-colors text-gray-900 font-medium"
                  placeholder="name@dakhedu.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-colors text-gray-900 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                isSignUpMode ? 'REGISTER PASSWORD' : 'LOGIN TO TEAM DASHBOARD'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setError(null);
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-wider"
              >
                {isSignUpMode ? 'Already registered? Login here' : 'First time logging in? Set up password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamLogin;
