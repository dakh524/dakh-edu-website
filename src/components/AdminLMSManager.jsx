import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, Trash2, Loader2, Save } from 'lucide-react';

const AdminLMSManager = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState(['Web Development', 'UI/UX Design', 'App Development', 'Data Science']);
  
  // Form state
  const [selectedDomain, setSelectedDomain] = useState('Web Development');
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [passMark, setPassMark] = useState(70);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lms_modules')
      .select('*')
      .order('domain', { ascending: true })
      .order('week_number', { ascending: true });
      
    if (!error && data) {
      setModules(data);
    }
    setLoading(false);
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!title || !weekNumber) return;
    setIsSubmitting(true);
    
    const { error } = await supabase.from('lms_modules').insert([{
      domain: selectedDomain,
      week_number: parseInt(weekNumber),
      title,
      video_url: videoUrl,
      task_details: taskDetails,
      pass_mark: parseInt(passMark),
      is_published: true
    }]);

    setIsSubmitting(false);
    if (error) {
      alert("Error adding module: " + error.message);
    } else {
      alert("Module added successfully!");
      setTitle('');
      setVideoUrl('');
      setTaskDetails('');
      setWeekNumber(prev => parseInt(prev) + 1);
      fetchModules();
    }
  };

  const handleDeleteModule = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      const { error } = await supabase.from('lms_modules').delete().eq('id', id);
      if (!error) {
        setModules(modules.filter(m => m.id !== id));
      } else {
        alert("Failed to delete: " + error.message);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      
      {/* Create Module Form */}
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900">Create LMS Module</h2>
          <p className="text-gray-500 font-medium mt-1">Add domain-specific learning modules, unlisted videos, and task requirements.</p>
        </div>

        <form onSubmit={handleAddModule} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Domain</label>
              <select 
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Week Number</label>
              <input 
                type="number" 
                min="1"
                required
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Module Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JavaScript Fundamentals"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Unlisted YouTube Video URL</label>
            <input 
              type="url" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Task Details / Instructions</label>
            <textarea 
              rows={4}
              value={taskDetails}
              onChange={(e) => setTaskDetails(e.target.value)}
              placeholder="Describe what the student needs to build and submit..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
            ></textarea>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Pass Mark requirement (%)</label>
             <input 
                type="number" 
                min="0" max="100"
                value={passMark}
                onChange={(e) => setPassMark(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Students must hit this score on their task/test to unlock the next week.</p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSubmitting ? 'Saving Module...' : 'Save Module'}
          </button>
        </form>
      </div>

      {/* List Modules */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Existing Modules</h3>
        
        {domains.map(domain => {
          const domainModules = modules.filter(m => m.domain === domain);
          if (domainModules.length === 0) return null;
          
          return (
            <div key={domain} className="mb-8">
              <h4 className="font-bold text-lg text-purple-700 mb-4">{domain}</h4>
              <div className="space-y-3">
                {domainModules.map(mod => (
                  <div key={mod.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase">Week {mod.week_number}</div>
                      <div className="font-bold text-gray-900">{mod.title}</div>
                      {mod.video_url && <div className="text-xs text-blue-500 truncate max-w-xs">{mod.video_url}</div>}
                    </div>
                    <button 
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AdminLMSManager;
