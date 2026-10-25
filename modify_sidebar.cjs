const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TeamDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The strategy is to find the beginning of the sidebar buttons and replace them
const sidebarStart = content.indexOf("<button \n              onClick={() => setActiveTab('analytics')}");
const sidebarEnd = content.indexOf('</div>\n        </div>\n\n        {/* Profile Card & Logout */}');

if (sidebarStart !== -1 && sidebarEnd !== -1) {
  content = content.substring(0, sidebarStart) + `
            <button 
              onClick={() => setActiveTab('intern-projects')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'intern-projects' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <FileBadge className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'intern-projects' ? 'text-white' : 'text-gray-500'}\`} />
              Intern Projects
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'products' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <Briefcase className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'products' ? 'text-white' : 'text-gray-500'}\`} />
              Products & Services
            </button>
            <button 
              onClick={() => setActiveTab('registrations')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'registrations' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <Users className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'registrations' ? 'text-white' : 'text-gray-500'}\`} />
              Registrations
            </button>
            <button 
              onClick={() => setActiveTab('certificates')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'certificates' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <Award className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'certificates' ? 'text-white' : 'text-gray-500'}\`} />
              Certificates Link
            </button>
            <button 
              onClick={() => setActiveTab('freelancers')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'freelancers' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <ClipboardList className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'freelancers' ? 'text-white' : 'text-gray-500'}\`} />
              Freelancers
            </button>
            <button 
              onClick={() => setActiveTab('interns')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'interns' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <UserCircle className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'interns' ? 'text-white' : 'text-gray-500'}\`} />
              Intern Management
            </button>
            <button 
              onClick={() => setActiveTab('advertisement')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'advertisement' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <ImageIcon className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'advertisement' ? 'text-white' : 'text-gray-500'}\`} />
              Manage Ads
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'events' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <Calendar className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'events' ? 'text-white' : 'text-gray-500'}\`} />
              Events & Gallery
            </button>
            <button 
              onClick={() => setActiveTab('partners')}
              className={\`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer relative overflow-hidden group \${
                activeTab === 'partners' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500' 
                  : 'text-gray-400 bg-slate-900/30 hover:bg-slate-900/80 border border-slate-800/20 hover:text-slate-200'
              }\`}
            >
              <Handshake className={\`w-4 h-4 transition-transform group-hover:scale-110 duration-200 \${activeTab === 'partners' ? 'text-white' : 'text-gray-500'}\`} />
              Partners
            </button>
` + content.substring(sidebarEnd);
}

fs.writeFileSync(filePath, content);
console.log('Sidebar replaced');
