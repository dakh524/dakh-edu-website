import os

file_path = os.path.join(os.getcwd(), 'src', 'pages', 'TeamDashboard.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_index(search_str, start=0):
    for j in range(start, len(lines)):
        if search_str in lines[j]:
            return j
    return -1

# 1. State Replacement (Remove states for tasks, coldLeads)
idx1 = get_index("const [tasks, setTasks] = useState")
idx2 = get_index("const [showTargetSetupModal, setShowTargetSetupModal] = useState", idx1)

if idx1 != -1 and idx2 != -1:
    lines = lines[:idx1] + ["""
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
"""] + lines[idx2:]

# 2. activeTab
idx3 = get_index("const [activeTab, setActiveTab] = useState('analytics');")
if idx3 != -1:
    lines[idx3] = "  const [activeTab, setActiveTab] = useState('intern-projects');\n"

# 3. Remove fetchTeamTasks
idx4 = get_index("const fetchTeamTasks = async () => {")
idx5 = get_index("  };", idx4) + 1
if idx4 != -1 and idx5 != -1:
    lines = lines[:idx4] + ["""
  const fetchInternProjects = async () => {
    const { data, error } = await supabase.from('intern_projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setInternProjects(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };
"""] + lines[idx5:]

# 4. Remove fetchColdLeads
idx6 = get_index("const fetchColdLeads = async () => {")
idx7 = get_index("  };", idx6) + 1
if idx6 != -1 and idx7 != -1:
    lines = lines[:idx6] + lines[idx7:]

# 5. Fix verification fetch calls
for j in range(len(lines)):
    if "fetchTeamTasks();" in lines[j] and "fetchColdLeads();" not in lines[j]:
        lines[j] = ""
    elif "fetchColdLeads();" in lines[j] and "fetchTeamTasks();" not in lines[j]:
        lines[j] = lines[j].replace("fetchColdLeads();", "fetchInternProjects();\\n        fetchProducts();")
    elif "fetchTeamTasks(); fetchTeamMembers(); fetchColdLeads();" in lines[j]:
        lines[j] = lines[j].replace("fetchTeamTasks(); fetchTeamMembers(); fetchColdLeads();", "fetchTeamMembers(); fetchInternProjects(); fetchProducts();")

# 6. Sidebar buttons
# Find analytics button
idx_btn_analytics = get_index("onClick={() => setActiveTab('analytics')}")
idx_btn_analytics_end = get_index("</button>", idx_btn_analytics) + 1
if idx_btn_analytics != -1 and idx_btn_analytics_end != -1:
    # also we need to find where the button actually started. It's usually 1 line before.
    idx_btn_analytics_start = idx_btn_analytics - 1
    lines = lines[:idx_btn_analytics_start] + ["""
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
"""] + lines[idx_btn_analytics_end:]

# LMS button
idx_btn_lms = get_index("onClick={() => setActiveTab('lms')}")
if idx_btn_lms != -1:
    idx_btn_lms_end = get_index("</button>", idx_btn_lms) + 1
    lines = lines[:idx_btn_lms - 1] + lines[idx_btn_lms_end:]

# Tasks button
idx_btn_tasks = get_index("onClick={() => setActiveTab('tasks')}")
if idx_btn_tasks != -1:
    idx_btn_tasks_end = get_index("</button>", idx_btn_tasks) + 1
    lines = lines[:idx_btn_tasks - 1] + lines[idx_btn_tasks_end:]

# Cold calling button
idx_btn_cold = get_index("onClick={() => setActiveTab('coldcalling')}")
if idx_btn_cold != -1:
    idx_btn_cold_end = get_index(")}", idx_btn_cold) + 1
    # also it's wrapped in {isColdCallingEligible && (
    idx_btn_cold_start = get_index("{isColdCallingEligible && (", idx_btn_cold - 20)
    if idx_btn_cold_start != -1:
        lines = lines[:idx_btn_cold_start] + lines[idx_btn_cold_end:]

# 7. Analytics Block
idx_analytics = get_index("{activeTab === 'analytics' && (")
idx_analytics_end = get_index("{activeTab === 'registrations' && (", idx_analytics)
if idx_analytics != -1 and idx_analytics_end != -1:
    lines = lines[:idx_analytics] + ["""
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
                  <input type="text" placeholder="Title" required value={ipTitle} onChange={e => setIpTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
                  <textarea placeholder="Description" value={ipDesc} onChange={e => setIpDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
                  <input type="url" placeholder="Vercel Link" required value={ipVercelLink} onChange={e => setIpVercelLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
                  <input type="url" placeholder="GitHub Link" required value={ipGithubLink} onChange={e => setIpGithubLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
                  <input type="url" placeholder="LinkedIn Image URL" required value={ipLinkedinLink} onChange={e => setIpLinkedinLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
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
"""] + lines[idx_analytics_end:]

# 8. LMS Block
idx_lms = get_index("{activeTab === 'lms' && (")
idx_tasks = get_index("{activeTab === 'tasks' && (", idx_lms)
if idx_lms != -1 and idx_tasks != -1:
    lines = lines[:idx_lms] + lines[idx_tasks:]

# 9. Tasks Block
idx_tasks2 = get_index("{activeTab === 'tasks' && (")
idx_cold = get_index("{activeTab === 'coldcalling' && (", idx_tasks2)
if idx_tasks2 != -1 and idx_cold != -1:
    lines = lines[:idx_tasks2] + ["""
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
                  <input type="text" placeholder="Title" required value={prodTitle} onChange={e => setProdTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
                  <textarea placeholder="Description" required value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
                  <input type="url" placeholder="Image URL" required value={prodImageUrl} onChange={e => setProdImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
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
"""] + lines[idx_cold:]

# 10. ColdCalling Block
idx_cold2 = get_index("{activeTab === 'coldcalling' && (")
idx_ad = get_index("{activeTab === 'advertisement' && (", idx_cold2)
if idx_cold2 != -1 and idx_ad != -1:
    lines = lines[:idx_cold2] + lines[idx_ad:]

# 11. Remove isColdCallingEligible and coldLeads logic
idx_eligible = get_index("const isColdCallingEligible = ")
idx_end_leads = get_index("const leadsToDisplay = ", idx_eligible)
idx_end_leads_block = get_index("return (", idx_end_leads)
if idx_eligible != -1 and idx_end_leads_block != -1:
    # wait, leadsToDisplay block ends before return (
    # let's just delete from isCeo to return (
    idx_is_ceo = get_index("const isCeo = ['ceo'", idx_eligible - 30)
    if idx_is_ceo != -1 and idx_is_ceo < idx_eligible:
        lines = lines[:idx_is_ceo] + lines[idx_end_leads_block:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Modification complete.")
