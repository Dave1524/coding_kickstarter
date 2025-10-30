# 🎯 Cursor Tips for Beginners

## What is Cursor?
Cursor is a code editor made for AI-powered development. It's like VS Code but with built-in AI helpers!

---

## 📌 Essential Cursor Features

### 1. **Open Terminal**
```
Press: Ctrl + `  (backtick, same key as ~)
```
The terminal appears at the bottom. This is where you type commands like `npm run dev`

### 2. **File Explorer**
- Left sidebar shows all your files
- Click to open files
- Right-click to create new files
- Hover over folder icons to see options

### 3. **Extensions** (Ctrl+Shift+X)
These add extra powers to Cursor:

**Install these for Next.js:**
1. **Tailwind CSS IntelliSense** - Shows CSS helpers as you type
2. **ES7+ React Snippets** - Quick code templates
3. **Prettier** - Auto-formats your code
4. **REST Client** - Test your APIs
5. **GitLens** - See who changed what code

**How to install:**
1. Press `Ctrl+Shift+X`
2. Search for extension name
3. Click "Install"
4. Reload Cursor

---

## 🚀 Cursor's AI Features (Advanced)

### Cmd+K (Mac) or Ctrl+K (Windows) - Ask AI
```
Press: Ctrl+K
Type: "Create a login button"
AI generates code!
```

### Cmd+Shift+L (Mac) or Ctrl+Shift+L (Windows) - Multi-line Edit
```
Click at start of line
Press: Ctrl+Shift+L
Click at lines you want to change
Type once, changes all lines!
```

---

## 💡 Pro Tips

### **Jump to Line**
```
Press: Ctrl+G
Type: 25
Jumps to line 25 instantly
```

### **Search Files**
```
Press: Ctrl+P
Type: page.tsx
Finds and opens the file
```

### **Find & Replace**
```
Press: Ctrl+H
Type what to find
Type what to replace
Perfect for renaming things everywhere
```

### **Format Your Code**
```
Right-click in editor
Choose: Format Document
Your messy code becomes beautiful!
```

### **Collapse/Expand Folders**
```
Click arrow (▼) next to folder name
Keeps your explorer clean
```

---

## 🎨 Useful Keyboard Shortcuts

| Action | Windows |
|--------|---------|
| Save | Ctrl+S |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Cut line | Ctrl+X |
| Copy line | Ctrl+C |
| Delete line | Ctrl+Shift+K |
| Duplicate line | Ctrl+D |
| Comment out | Ctrl+/ |
| Multi-select | Hold Ctrl + Click |
| Go to definition | F12 or Ctrl+Click |

---

## 🐛 Debugging in Cursor

### **Check Errors**
Look at the bottom-right corner:
- 🟠 Orange dot = warnings
- 🔴 Red dot = errors
- Click to see problems

### **Terminal Output**
When you run `npm run dev`:
- Green checkmark ✓ = success
- Red X ✗ = error (read the message!)
- Hover over links to jump to the problem

---

## 📝 Creating Files and Folders

### **New File**
```
Right-click in Explorer
→ New File
→ Type name: my-component.tsx
```

### **New Folder**
```
Right-click in Explorer
→ New Folder
→ Type name: components
```

### **Delete File/Folder**
```
Right-click file/folder
→ Delete
→ Confirm
```

---

## 🔧 Useful Settings

### Open Settings
```
Press: Ctrl+,
```

### Popular Settings to Change
1. **Font Size**
   - Search: "font size"
   - Set to 14 or 16 (easier to read)

2. **Auto Save**
   - Search: "auto save"
   - Change to: "afterDelay" or "onFocusChange"
   - Never lose work!

3. **Word Wrap**
   - Search: "word wrap"
   - Enable it so long lines don't go off-screen

4. **Bracket Color**
   - Search: "bracket pair colorizer"
   - Install this extension for clarity

---

## 📂 Smart Project Organization

### Organize your app like this:
```
app/
├── page.tsx              # Home page
├── layout.tsx            # Shared layout
├── dashboard/            # Dashboard section
│   ├── page.tsx         # Dashboard home
│   └── settings.tsx     # Dashboard settings

components/              # Reusable components
├── Button.tsx
├── Header.tsx
└── Footer.tsx

lib/                     # Helper functions
├── supabase.ts
└── api.ts

styles/                  # CSS files
└── globals.css
```

---

## ✨ VS Code Command Palette

Press: `Ctrl+Shift+P`

Useful commands:
- `> Preferences: Open Settings` - Open settings
- `> File: New File` - Create new file
- `> View: Toggle Terminal` - Show/hide terminal
- `> Format Document` - Auto-format code
- `> Git: Clone Repository` - Clone from GitHub

---

## 🎓 Learning Resources in Cursor

### Install "Learn" Extension
This gives you tutorials right in Cursor!

---

## 🆘 If You Get Stuck

1. **Check the Problems Tab**
   - Bottom of screen shows errors
   - Red squiggly lines point to issues

2. **Read Error Messages Carefully**
   - They usually tell you exactly what's wrong!

3. **Check Terminal Output**
   - `npm run dev` shows helpful messages

4. **Ask Cursor AI**
   - Press Ctrl+K
   - Describe your problem
   - Get suggestions

---

## 🔐 Security Reminder

### NEVER share these files:
- `.env.local` - Your secret keys!
- `node_modules/` - Auto-generated, huge
- Any API keys or passwords

### Check `.gitignore`
It already protects `.env.local` for you ✓

---

## 📊 Useful Extensions Summary

| Extension | Why Install | Shortcut |
|-----------|-------------|----------|
| Prettier | Auto-format code | Right-click → Format |
| Tailwind IntelliSense | See CSS classes | Type class name |
| ES7+ Snippets | Faster typing | Type `const` + autocomplete |
| REST Client | Test APIs | Create `.rest` file |
| GitLens | See code history | Hover over code |

---

## 🎬 Quick Start Workflow

1. **Open Cursor** → Your project loads
2. **Press Ctrl+` ** → Terminal opens
3. **Type: npm run dev** → Start coding!
4. **Edit files** → See changes instantly
5. **Save with Ctrl+S** → Auto-updates browser
6. **Stop with Ctrl+C** → Ctrl+C in terminal

---

Good luck! Cursor + Next.js = Super powers! 🚀
