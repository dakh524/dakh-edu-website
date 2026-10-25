import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2, UserCircle, GraduationCap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback check against students table
        const cleanEmail = email.trim().toLowerCase();
        const { data: studentMatch, error: matchError } = await supabase
          .from('students')
          .select('*, registrations(plan_name)')
          .ilike('email', cleanEmail)
          .eq('password', password.trim())
          .single();

        if (studentMatch && !matchError) {
          if (studentMatch.status === 'Suspended') {
            throw new Error('Your internship access has been revoked or expired. Please contact support.');
          }

          if (studentMatch.end_date && new Date() > new Date(studentMatch.end_date)) {
            throw new Error('Your internship access has automatically expired. Please contact DAKH Edu Solutions.');
          }

          localStorage.setItem('student_session', JSON.stringify(studentMatch));
          navigate('/student/dashboard');
          return;
        }

        throw error;
      }
      
      if (data.session) {
        // Check if student is suspended
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('status, end_date')
          .eq('auth_id', data.session.user.id)
          .single();

        if (studentError || !studentData) {
          await supabase.auth.signOut();
          throw new Error('Access Denied: You are not registered as an intern.');
        }

        if (studentData.status === 'Suspended') {
          await supabase.auth.signOut();
          throw new Error('Your internship access has been revoked or expired. Please contact support.');
        }

        if (studentData.end_date && new Date() > new Date(studentData.end_date)) {
          await supabase.auth.signOut();
          throw new Error('Your internship access has automatically expired. Please contact DAKH Edu Solutions.');
        }

        localStorage.setItem('student_session', JSON.stringify({ ...studentData, auth_id: data.session.user.id }));
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[100dvh] flex flex-col md:flex-row bg-white font-sans overflow-hidden">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 relative z-10 pt-24 md:pt-0">
          <div className="w-full max-w-md">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center md:text-left"
            >
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm mx-auto md:mx-0 border border-purple-100">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 font-medium">Please enter your credentials to access your learning modules.</p>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}

            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleLogin} 
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 font-medium rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all hover:border-slate-200"
                    placeholder="intern@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 font-medium rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all hover:border-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Login to Portal
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            <div className="mt-8 text-center md:text-left">
              <a href="/internship" className="text-sm font-bold text-slate-400 hover:text-purple-600 transition-colors flex items-center justify-center md:justify-start gap-1">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Website
              </a>
            </div>

          </div>
        </div>

        {/* Right Side: Graphic & Branding */}
        <div className="hidden md:flex md:w-1/2 bg-slate-50 relative items-center justify-center p-12 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 max-w-lg bg-white/60 backdrop-blur-2xl border border-white p-12 rounded-[3rem] shadow-2xl"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-purple-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">
              Master your skills with our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">expert-led</span> modules.
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
              Access curated video lessons, challenging assignments, and earn your certificate upon successful completion of your final project.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400"></div>
              </div>
              <p className="text-sm font-bold text-slate-700">Join 500+ successful interns</p>
            </div>
          </motion.div>

        </div>

      </div>
    </PageTransition>
  );
};

export default StudentLogin;
