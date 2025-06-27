# 🐍 Node.js Environment Setup (Python Developer's Guide)

## ✅ Your Current Setup
- **Node.js**: v24.1.0 ✅ (Excellent - latest LTS)
- **npm**: v11.3.0 ✅ (Latest version)
- **IDE**: Cursor ✅ (Great choice for Next.js)

---

## 🔒 Project Isolation (Node.js vs Python)

### How Node.js Isolation Works
Unlike Python's virtual environments, Node.js uses **per-project dependency management**:

```bash
# Python approach (what you're used to)
python -m venv myproject_env
source myproject_env/bin/activate
pip install -r requirements.txt

# Node.js approach (automatic isolation)
cd myproject
npm install  # Creates node_modules/ and package-lock.json
```

### Key Differences
| Python | Node.js |
|--------|---------|
| Virtual environments | Per-project `node_modules/` |
| `requirements.txt` | `package.json` + `package-lock.json` |
| `pip install` | `npm install` |
| Global packages | Global packages (avoid when possible) |

---

## 🛠 Setting Up Your Research Lab Project

### Step 1: Create Project Directory
```bash
# Navigate to your workspace
cd /Users/kellycaylor/dev/waves2025

# Create a new directory for the website
mkdir research-lab-website
cd research-lab-website
```

### Step 2: Initialize Next.js Project
```bash
# Create Next.js project with all the goodies
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# This will ask you some questions - here are the recommended answers:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes  
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias (@/*)? Yes
```

### Step 3: Verify Isolation
After the project is created, you'll have:

```
research-lab-website/
├── node_modules/          # Project dependencies (isolated)
├── package.json           # Project configuration
├── package-lock.json      # Exact dependency versions (like pip freeze)
├── src/
│   └── app/              # Your pages
├── public/               # Static files
└── .gitignore           # Git ignores node_modules/
```

---

## 🔧 Cursor IDE Setup

### Recommended Extensions
Install these in Cursor for the best Next.js experience:

1. **ES7+ React/Redux/React-Native snippets** - Code shortcuts
2. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
3. **Prettier - Code formatter** - Auto-formatting
4. **ESLint** - Code linting
5. **TypeScript Importer** - Auto-imports

### Cursor Settings
Add this to your Cursor settings (Cmd+,):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

---

## 🚀 Development Workflow

### Starting Development
```bash
# Start the development server
npm run dev

# Your site will be at http://localhost:3000
# Changes auto-reload in the browser
```

### Common Commands (Node.js equivalents to Python)
```bash
# Install dependencies (like pip install -r requirements.txt)
npm install

# Add a new package (like pip install package_name)
npm install package-name

# Add dev dependency (like pip install -e .)
npm install --save-dev package-name

# Run scripts (like python manage.py runserver)
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📦 Package Management Best Practices

### Dependencies vs DevDependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",        // Runtime dependencies
    "react": "^18.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",       // Development-only tools
    "prettier": "^3.0.0"
  }
}
```

### Lock Files
- **`package-lock.json`** = Exact versions (like `pip freeze`)
- **Always commit this file** to ensure consistent builds
- **Never edit manually** - npm manages it

---

## 🔍 Troubleshooting

### Common Issues & Solutions

**"Module not found" errors?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

**Cursor not recognizing TypeScript?**
- Make sure you're in the project directory
- Restart Cursor
- Check that `tsconfig.json` exists

---

## 🎯 Next Steps

1. **Create the project** using the commands above
2. **Open in Cursor** and install recommended extensions
3. **Start the dev server** with `npm run dev`
4. **Follow the beginner guide** to build your first pages

### Project Structure You'll Have
```
research-lab-website/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── people/
│   │   │   └── page.tsx       # People page
│   │   ├── publications/
│   │   │   └── page.tsx       # Publications page
│   │   └── globals.css        # Global styles
│   └── components/            # Reusable components
├── public/                    # Images, fonts, etc.
├── package.json              # Dependencies and scripts
└── tailwind.config.js        # Tailwind configuration
```

---

## 💡 Pro Tips

1. **Always use `npm install`** in the project directory
2. **Never install packages globally** unless absolutely necessary
3. **Commit `package-lock.json`** to version control
4. **Use `npm run dev`** for development (auto-reload)
5. **Use `npm run build`** before deploying

The isolation is automatic - each project has its own `node_modules/` folder, so you don't need to worry about conflicts between projects! 