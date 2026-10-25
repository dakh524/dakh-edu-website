import os
import re

file_path = os.path.join(os.getcwd(), 'src', 'pages', 'TeamDashboard.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix input colors for Intern Projects & Products
# It's currently: className="w-full px-4 py-3 rounded-xl border"
better_class = 'className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-slate-50 placeholder-slate-400 font-bold"'
content = content.replace('className="w-full px-4 py-3 rounded-xl border"', better_class)

# 2. Add scrollTo for Intern Projects Edit Button
ip_edit_old = """setIpLinkedinLink(proj.linkedin_image_link);
                      }} className="text-blue-600 font-bold text-sm">Edit</button>"""
ip_edit_new = """setIpLinkedinLink(proj.linkedin_image_link);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-blue-600 font-bold text-sm">Edit</button>"""
content = content.replace(ip_edit_old, ip_edit_new)

# 3. Add scrollTo for Products Edit Button
prod_edit_old = """setProdImageUrl(prod.image_url);
                      }} className="text-blue-600 font-bold text-sm">Edit</button>"""
prod_edit_new = """setProdImageUrl(prod.image_url);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-blue-600 font-bold text-sm">Edit</button>"""
content = content.replace(prod_edit_old, prod_edit_new)

# 4. Add editingPartner state
partner_state_old = "const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);"
partner_state_new = "const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);\n  const [editingPartner, setEditingPartner] = useState(null);"
if "const [editingPartner, setEditingPartner] = useState(null);" not in content:
    content = content.replace(partner_state_old, partner_state_new)

# 5. Modify handleAddPartner to handle Save (Insert or Update)
handle_partner_old = """const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerName || !partnerLogoUrl || !partnerDescription || !partnerCategory) return;
    setIsSubmittingPartner(true);
    const { error } = await supabase.from('partnered_companies').insert([{ name: partnerName, logo_url: partnerLogoUrl, description: partnerDescription, category: partnerCategory }]);
    setIsSubmittingPartner(false);
    
    if (error) {
      alert("Error adding partner: " + error.message);
    } else {
      alert("Partner added successfully!");
      setPartnerName('');
      setPartnerLogoUrl('');
      setPartnerDescription('');
      setPartnerCategory('Community');
      fetchPartners();
    }
  };"""

handle_partner_new = """const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerName || !partnerLogoUrl || !partnerDescription || !partnerCategory) return;
    setIsSubmittingPartner(true);
    let error;
    if (editingPartner) {
        const res = await supabase.from('partnered_companies').update({ name: partnerName, logo_url: partnerLogoUrl, description: partnerDescription, category: partnerCategory }).eq('id', editingPartner.id);
        error = res.error;
    } else {
        const res = await supabase.from('partnered_companies').insert([{ name: partnerName, logo_url: partnerLogoUrl, description: partnerDescription, category: partnerCategory }]);
        error = res.error;
    }
    setIsSubmittingPartner(false);
    
    if (error) {
      alert("Error saving partner: " + error.message);
    } else {
      alert(editingPartner ? "Partner updated successfully!" : "Partner added successfully!");
      setEditingPartner(null);
      setPartnerName('');
      setPartnerLogoUrl('');
      setPartnerDescription('');
      setPartnerCategory('Community');
      fetchPartners();
    }
  };"""
content = content.replace(handle_partner_old, handle_partner_new)

# 6. Change "Add New Partner" header
partner_header_old = """<h2 className="text-2xl font-black text-gray-900">Add New Partner</h2>"""
partner_header_new = """<h2 className="text-2xl font-black text-gray-900">{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h2>"""
content = content.replace(partner_header_old, partner_header_new)

# 7. Add Cancel button and change Save button text for Partner
partner_submit_old = """<button 
                      type="submit" 
                      disabled={isSubmittingPartner}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 cursor-pointer text-sm"
                    >
                      {isSubmittingPartner ? 'Adding...' : 'Add Partner'}
                    </button>"""
partner_submit_new = """<div className="flex gap-4">
                      <button 
                        type="submit" 
                        disabled={isSubmittingPartner}
                        className="flex-grow py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 cursor-pointer text-sm"
                      >
                        {isSubmittingPartner ? 'Saving...' : (editingPartner ? 'Save Partner' : 'Add Partner')}
                      </button>
                      {editingPartner && (
                        <button 
                          type="button" 
                          onClick={() => {
                              setEditingPartner(null);
                              setPartnerName('');
                              setPartnerLogoUrl('');
                              setPartnerDescription('');
                              setPartnerCategory('Community');
                          }}
                          className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl transition-all duration-200 cursor-pointer text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>"""
content = content.replace(partner_submit_old, partner_submit_new)

# 8. Add Edit button to Partner cards
partner_card_delete_old = """<button 
                        onClick={() => handleDeletePartner(partner.id)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>"""
partner_card_edit_new = """
                      <button 
                        onClick={() => {
                          setEditingPartner(partner);
                          setPartnerName(partner.name);
                          setPartnerLogoUrl(partner.logo_url);
                          setPartnerDescription(partner.description);
                          setPartnerCategory(partner.category || 'Community');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors cursor-pointer font-bold text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePartner(partner.id)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>"""
content = content.replace(partner_card_delete_old, partner_card_edit_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("UI fixes applied successfully.")
