import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, CheckCircle, Clock, FileText, Bell, Award, PlayCircle, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/student/login');
          return;
        }

        // Fetch student profile
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (studentError || !studentData) {
          await supabase.auth.signOut();
          navigate('/student/login');
          return;
        } else {
          setStudent(studentData);
        }

        let currentDomain = studentData.domain;
        let currentStudentId = studentData.id;

        if (currentStudentId) {
          // Fetch real modules for this domain
          const { data: dbModules } = await supabase
            .from('lms_modules')
            .select('*')
            .eq('domain', currentDomain)
            .order('week_number', { ascending: true });

          // Fetch student progress
          const { data: dbProgress } = await supabase
            .from('lms_student_progress')
            .select('*')
            .eq('student_id', currentStudentId);

          setProgress(dbProgress || []);
          setModules(dbModules || []);
        } else {
           setModules([]);
           setProgress([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/student/login');
  };

  const handleMarkCompleted = async (moduleId) => {
    if (!student || !student.id) return;
    setCompleting(true);
    try {
      const { error } = await supabase.from('lms_student_progress').insert([{
        student_id: student.id,
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      // Update local progress state to immediately unlock next week
      setProgress(prev => [...prev, { module_id: moduleId, is_completed: true }]);
    } catch (err) {
      alert("Error marking complete: " + err.message);
    } finally {
      setCompleting(false);
    }
  };

  // Calculate overall progress
  const totalModules = modules.length;
  const completedCount = progress.filter(p => p.is_completed).length;
  const progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  // Determine current active week (first uncompleted week)
  let activeWeek = 1;
  for (let m of modules) {
    if (!progress.find(p => p.module_id === m.id && p.is_completed)) {
      activeWeek = m.week_number;
      break;
    }
  }

  // The student is fully done if all modules are completed
  const isFullyCompleted = totalModules > 0 && completedCount === totalModules;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center fixed top-0 w-full z-10 mt-16">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
            {student?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="font-bold text-slate-800">👋 Welcome, {student?.full_name?.split(' ')[0] || 'Student'}</h2>
            <p className="text-xs text-slate-500 font-mono">{student?.intern_number || 'DES/INT/2026/XXXX'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Modules & Progress */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Internship Progress: {progressPercentage}%
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 text-right">Keep up the good work!</p>
          </div>

          {/* Weekly Modules */}
          <h3 className="text-xl font-bold text-slate-800 pt-4">Weekly Modules</h3>
          
          {modules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border">
              No modules available for your domain yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {modules.map((module) => {
                const isCompleted = progress.some(p => p.module_id === module.id && p.is_completed);
                const isCurrent = !isCompleted && module.week_number === activeWeek;
                const isLocked = !isCompleted && module.week_number > activeWeek;
                
                return (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    key={module.id} 
                    className={`bg-white rounded-2xl p-6 border shadow-sm ${isCurrent ? 'border-purple-300 ring-1 ring-purple-100' : 'border-slate-100'} ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Week {module.week_number}</span>
                        <h4 className="text-lg font-bold text-slate-800 mt-1">{module.title}</h4>
                      </div>
                      {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                      {isCurrent && <Clock className="w-6 h-6 text-blue-500" />}
                      {isLocked && <Clock className="w-6 h-6 text-slate-300" />}
                    </div>
                    
                    <div className="space-y-4 text-sm text-slate-600">
                      {module.task_details && (
                        <div className="bg-slate-50 p-4 rounded-xl">
                          <p className="font-bold mb-1">Task Instructions:</p>
                          <p className="whitespace-pre-wrap">{module.task_details}</p>
                          {module.pass_mark > 0 && (
                            <p className="mt-2 text-purple-600 font-bold text-xs">Required Pass Mark: {module.pass_mark}%</p>
                          )}
                        </div>
                      )}
                    </div>

                    {isCurrent && (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-4">
                        
                        {module.video_url && (
                           <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                             {/* Attempt to parse Youtube ID for embed */}
                             {module.video_url.includes('youtube.com') || module.video_url.includes('youtu.be') ? (
                               <iframe 
                                 width="100%" 
                                 height="100%" 
                                 src={`https://www.youtube.com/embed/${module.video_url.split('v=')[1]?.split('&')[0] || module.video_url.split('youtu.be/')[1]?.split('?')[0]}`} 
                                 title="YouTube video player" 
                                 frameBorder="0" 
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                 allowFullScreen
                               ></iframe>
                             ) : (
                               <a href={module.video_url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full text-white hover:text-purple-400">
                                 <PlayCircle className="w-12 h-12 mb-2" />
                                 Click to view video
                               </a>
                             )}
                           </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2">
                          <button 
                            onClick={() => handleMarkCompleted(module.id)}
                            disabled={completing}
                            className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md ml-auto disabled:opacity-50"
                          >
                            <CheckCircle className="w-5 h-5" /> 
                            {completing ? 'Updating...' : 'I Passed! Mark as Completed'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Announcements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Announcements
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-1">Today</p>
                <p className="text-sm text-amber-900">Week 2 modules are now live. Make sure to watch the introduction video before starting tasks.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-1">Yesterday</p>
                <p className="text-sm text-slate-700">Live doubt clearing session will be held tomorrow at 6 PM.</p>
              </div>
            </div>
          </div>

          {/* Today's Module */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-md text-white">
            <h3 className="text-sm font-bold text-purple-200 mb-1 uppercase tracking-wider">Today's Module</h3>
            <h2 className="text-2xl font-bold mb-4">JavaScript Basics</h2>
            <button className="w-full bg-white text-purple-700 font-bold py-2 rounded-xl text-sm hover:bg-purple-50 transition-colors">
              Continue Learning
            </button>
          </div>

          {/* Certificate Status */}
          <div className={`rounded-2xl p-6 shadow-sm border ${isFullyCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isFullyCompleted ? 'text-green-600' : 'text-slate-400'}`} />
              Certificate Status
            </h3>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFullyCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                <Award className="w-5 h-5" />
              </div>
              <div>
                {isFullyCompleted ? (
                  <>
                    <p className="text-sm font-bold text-green-700">Congratulations!</p>
                    <p className="text-xs text-green-600 mt-1 font-medium leading-relaxed">
                      Your certificate is preparing from our team, it will be shared to you soon.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-800">Pending</p>
                    <p className="text-xs text-slate-500 mt-1">Complete all modules with passing marks to unlock.</p>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
