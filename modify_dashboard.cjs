const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TeamDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove states for analytics, lms, coldcalling, weekly tasks
// They are around lines 60-95
content = content.replace(/const \[tasks, setTasks\].*?setShowTargetSetupModal\(false\);/gs, `
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
`);

// 2. Change default active tab
content = content.replace(/useState\('analytics'\)/g, "useState('intern-projects')");

// 3. Remove fetch functions for tasks, cold leads
content = content.replace(/const fetchTeamTasks = async.*?setColdLeads\(data\);\s*};/gs, `
  const fetchInternProjects = async () => {
    const { data, error } = await supabase.from('intern_projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setInternProjects(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };
`);

// 4. Update verifyTeamAccess to call new fetch functions
content = content.replace(/fetchTeamTasks\(\);\s*fetchTeamMembers\(\);\s*fetchColdLeads\(\);/gs, 'fetchTeamMembers(); fetchInternProjects(); fetchProducts();');

fs.writeFileSync(filePath, content);
console.log('Script executed');
