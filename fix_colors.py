import os

file_path = os.path.join(os.getcwd(), 'src', 'pages', 'TeamDashboard.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For Intern Projects and Products forms
content = content.replace(
    'text-slate-900 bg-slate-50 placeholder-slate-400',
    'text-gray-900 bg-white placeholder-gray-500'
)

# For Partner form inputs
content = content.replace(
    'bg-gray-50 text-slate-900',
    'bg-white text-gray-900 placeholder-gray-500'
)
content = content.replace(
    'bg-gray-50 resize-none text-slate-900',
    'bg-white resize-none text-gray-900 placeholder-gray-500'
)
content = content.replace(
    'bg-gray-50 font-medium text-slate-900',
    'bg-white font-medium text-gray-900'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Colors fixed to text-gray-900 and bg-white.")
