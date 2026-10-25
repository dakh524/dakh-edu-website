import os

file_path = os.path.join(os.getcwd(), 'src', 'pages', 'TeamDashboard.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_index(search_str, start=0):
    for j in range(start, len(lines)):
        if search_str in lines[j]:
            return j
    return -1

# Remove showTargetSetupModal state
idx_modal_state = get_index("const [showTargetSetupModal, setShowTargetSetupModal] = useState(false);")
if idx_modal_state != -1:
    lines[idx_modal_state] = ""

# Remove useEffect with coldLeads.length
idx_ue = get_index("if (coldLeads.length >= 1000 && teamMemberData) {")
if idx_ue != -1:
    # it's wrapped in useEffect(() => {
    # start is idx_ue - 1
    idx_ue_start = idx_ue - 1
    idx_ue_end = get_index("}, [coldLeads, teamMemberData]);", idx_ue)
    if idx_ue_end != -1:
        lines = lines[:idx_ue_start] + lines[idx_ue_end + 1:]

# Remove handleSaveWeeklyTarget
idx_handle = get_index("const handleSaveWeeklyTarget = async (e) => {")
if idx_handle != -1:
    idx_handle_end = get_index("};", idx_handle)
    if idx_handle_end != -1:
        lines = lines[:idx_handle] + lines[idx_handle_end + 1:]

# Remove the Modal block at the bottom
idx_modal_block = get_index("{/* 1000+ leads goals configuration modal */}")
if idx_modal_block != -1:
    # The modal is wrapped in <AnimatePresence> which ends around 2250
    # Wait, the block starts at 2152, but it has an opening <AnimatePresence> and a closing </AnimatePresence>
    # So we find the next </AnimatePresence>
    idx_modal_end = get_index("</AnimatePresence>", idx_modal_block)
    if idx_modal_end != -1:
        lines = lines[:idx_modal_block] + lines[idx_modal_end + 1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Modification V3 complete.")
