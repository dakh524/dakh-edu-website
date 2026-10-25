import os

file_path = os.path.join(os.getcwd(), 'src', 'pages', 'TeamDashboard.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
i = 0

while i < len(lines):
    line = lines[i]

    # 1. State Replacement (Remove states for tasks, coldLeads)
    if "const [tasks, setTasks] = useState(" in line:
        # skip until we find events states or something after tasks
        pass # Wait, let's just skip the specific lines
        i += 1
        continue
    
    if "const [coldLeads, setColdLeads] = useState(" in line:
        i += 1
        continue
        
    if "const [coldLeadsFilter, setColdLeadsFilter] = useState(" in line:
        i += 1
        continue
        
    if "const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState(" in line:
        i += 1
        continue
        
    if "const [isSavingWeeklyTarget, setIsSavingWeeklyTarget] = useState(" in line:
        i += 1
        continue
        
    if "const [weeklyTargetInput, setWeeklyTargetInput] = useState(" in line:
        i += 1
        continue

    # Inject Intern Projects and Products State exactly before showTargetSetupModal
    if "const [showTargetSetupModal, setShowTargetSetupModal] = useState(" in line:
        new_lines.append("""
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
""")
        new_lines.append(line)
        i += 1
        continue
        
    if line.strip() == "const [activeTab, setActiveTab] = useState('analytics');":
        new_lines.append("  const [activeTab, setActiveTab] = useState('intern-projects');\n")
        i += 1
        continue
        
    # Remove fetchTeamTasks
    if "const fetchTeamTasks = async () => {" in line:
        skip = True
        new_lines.append("""
  const fetchInternProjects = async () => {
    const { data, error } = await supabase.from('intern_projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setInternProjects(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };
""")
        i += 1
        continue
        
    if skip and "if (!error && data) setTasks(data);" in line:
        skip = False
        i += 2
        continue
        
    if skip:
        i += 1
        continue
        
    # Remove fetchColdLeads
    if "const fetchColdLeads = async () => {" in line:
        skip = True
        i += 1
        continue
        
    if skip and "if (!error && data) setColdLeads(data);" in line:
        skip = False
        i += 2
        continue
        
    if skip:
        i += 1
        continue

    # Update fetch calls
    if "fetchTeamTasks();" in line:
        i += 1
        continue
    if "fetchColdLeads();" in line:
        new_lines.append("        fetchInternProjects();\n        fetchProducts();\n")
        i += 1
        continue
    if "fetchTeamTasks(); fetchTeamMembers(); fetchColdLeads();" in line:
        new_lines.append(line.replace("fetchTeamTasks(); fetchTeamMembers(); fetchColdLeads();", "fetchTeamMembers(); fetchInternProjects(); fetchProducts();"))
        i += 1
        continue

    # UI blocks for Sidebar
    if "onClick={() => setActiveTab('analytics')}" in line:
        new_lines.append("""
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
""")
        i += 12
        continue

    if "onClick={() => setActiveTab('lms')}" in line:
        i += 12
        continue

    if "onClick={() => setActiveTab('tasks')}" in line:
        i += 12
        continue
        
    if "{isColdCallingEligible && (" in line and "onClick={() => setActiveTab('coldcalling')}" in "".join(lines[i:i+15]):
        i += 15
        continue

    # Analytics block removal
    if "{activeTab === 'analytics' && (" in line:
        # inject Intern Projects UI
        new_lines.append("""
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
""")
        # Now find end of Analytics block (right before registrations)
        while "{activeTab === 'registrations' && (" not in lines[i]:
            i += 1
        continue

    # LMS block removal
    if "{activeTab === 'lms' && (" in line:
        while "{activeTab === 'tasks' && (" not in lines[i]:
            i += 1
        continue
        
    # Tasks block removal
    if "{activeTab === 'tasks' && (" in line:
        # inject Products UI
        new_lines.append("""
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
""")
        while "{activeTab === 'coldcalling' && (" not in lines[i]:
            i += 1
        continue
        
    # ColdCalling block removal
    if "{activeTab === 'coldcalling' && (" in line:
        while "{activeTab === 'advertisement' && (" not in lines[i]:
            i += 1
        continue
        
    # Remove isColdCallingEligible and related stuff
    if "const isColdCallingEligible = " in line:
        while "const todayStart = new Date();" not in lines[i]:
            i += 1
        continue

    if "const todayStart = new Date();" in line:
        while "const totalLeadsCount = myLeads.length;" not in lines[i]:
            i += 1
        continue

    if "const totalLeadsCount = myLeads.length;" in line:
        while "const getActiveStatus = (lastActiveAt) => {" not in lines[i]:
            i += 1
        continue
        
    if "const leadsToDisplay = coldLeadsFilter === 'History'" in line:
        while "  return (" not in lines[i]:
            i += 1
        continue
        
    if "const isCeo = ['ceo'" in line:
        while "const myLeads = coldLeads" not in lines[i]:
            i += 1
        continue
        
    if "const myLeads = coldLeads" in line:
        while "  const isColdCallingEligible" not in lines[i]:
            i += 1
        continue

    new_lines.append(line)
    i += 1

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Modification complete.")
