# 🔧 Cursor IDE Extensions Setup for Next.js

## 🎯 Essential Extensions to Install

### 1. **ES7+ React/Redux/React-Native snippets**
- **What it does**: Provides code shortcuts for React components
- **How to install**: 
  1. Open Cursor IDE
  2. Press `Cmd+Shift+X` (or `Ctrl+Shift+X` on Windows/Linux)
  3. Search for "ES7+ React/Redux/React-Native snippets"
  4. Click "Install"

**Usage examples:**
```tsx
// Type 'rafce' and press Tab to create:
export default function ComponentName() {
  return (
    <div>
      
    </div>
  )
}

// Type 'rfc' and press Tab to create:
function ComponentName() {
  return (
    <div>
      
    </div>
  )
}
```

### 2. **Tailwind CSS IntelliSense**
- **What it does**: Autocomplete for Tailwind CSS classes
- **How to install**:
  1. Press `Cmd+Shift+X`
  2. Search for "Tailwind CSS IntelliSense"
  3. Click "Install"

**Usage**: Start typing a Tailwind class and you'll get autocomplete:
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  {/* Type 'bg-' and you'll see all background color options */}
</div>
```

### 3. **Prettier - Code formatter**
- **What it does**: Automatically formats your code
- **How to install**:
  1. Press `Cmd+Shift+X`
  2. Search for "Prettier - Code formatter"
  3. Click "Install"

### 4. **ESLint**
- **What it does**: Shows code quality issues and errors
- **How to install**:
  1. Press `Cmd+Shift+X`
  2. Search for "ESLint"
  3. Click "Install"

### 5. **TypeScript and JavaScript Language Features** (Built-in)
- **What it does**: Built-in TypeScript support, auto-imports, and IntelliSense
- **Status**: Already included with Cursor IDE
- **No installation needed** - it's built-in!

---

## ⚙️ Cursor Settings Configuration

### Step 1: Open Settings
1. Press `Cmd+,` (or `Ctrl+,` on Windows/Linux)
2. Or go to `Cursor > Preferences > Settings`

### Step 2: Add These Settings
Click the "Open Settings (JSON)" button (top right corner) and add these settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.quickSuggestions": {
    "strings": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "javascript.preferences.includePackageJsonAutoImports": "auto"
}
```

### Step 3: What These Settings Do
- **`formatOnSave`**: Automatically format code when you save
- **`defaultFormatter`**: Use Prettier for formatting
- **`importModuleSpecifier`**: Use relative imports (cleaner)
- **`tailwindCSS.includeLanguages`**: Enable Tailwind in TypeScript files
- **`codeActionsOnSave`**: Auto-fix ESLint issues on save
- **`autoImports`**: Auto-import TypeScript modules
- **`quickSuggestions`**: Show suggestions in strings (for Tailwind classes)
- **`includePackageJsonAutoImports`**: Auto-import from package.json dependencies

---

## 🧪 Test Your Setup

### Test 1: React Snippets
1. Create a new file: `src/app/test.tsx`
2. Type `rafce` and press Tab
3. You should see a React component template

### Test 2: Tailwind Autocomplete
1. In any `.tsx` file, add: `<div className="">`
2. Click inside the quotes and type `bg-`
3. You should see Tailwind color suggestions

### Test 3: Auto-formatting
1. Add some poorly formatted code
2. Press `Cmd+S` to save
3. The code should automatically format

### Test 4: ESLint
1. Add a variable but don't use it: `const unused = "test"`
2. You should see a warning about the unused variable

### Test 5: TypeScript Auto-imports
1. Type `useState` in a component
2. Press `Cmd+Shift+P` and select "TypeScript: Organize Imports"
3. It should auto-import React hooks

---

## 🚀 Additional Helpful Extensions (Optional)

### 6. **Auto Rename Tag**
- Automatically renames paired HTML/JSX tags
- Search: "Auto Rename Tag"

### 7. **Bracket Pair Colorizer**
- Colors matching brackets for easier reading
- Search: "Bracket Pair Colorizer 2"

### 8. **GitLens**
- Enhanced Git integration
- Search: "GitLens — Git supercharged"

### 9. **Thunder Client**
- API testing (if you add backend features later)
- Search: "Thunder Client"

### 10. **Error Lens**
- Shows errors inline with your code
- Search: "Error Lens"

---

## 🔍 Troubleshooting

### Extension Not Working?
1. **Restart Cursor**: Sometimes extensions need a restart
2. **Check if installed**: Go to Extensions panel (`Cmd+Shift+X`)
3. **Check settings**: Make sure settings are saved correctly

### Tailwind Classes Not Showing?
1. Make sure you're in a `.tsx` or `.jsx` file
2. Check that the Tailwind extension is enabled
3. Try typing `className=""` and then start typing

### Prettier Not Formatting?
1. Check that Prettier is set as default formatter
2. Make sure `formatOnSave` is enabled
3. Try manual formatting: `Cmd+Shift+P` → "Format Document"

### TypeScript Auto-imports Not Working?
1. Make sure you're in a `.tsx` file
2. Try `Cmd+Shift+P` → "TypeScript: Organize Imports"
3. Check that the TypeScript language server is running

---

## ✅ Verification Checklist

- [ ] ES7+ React/Redux/React-Native snippets installed
- [ ] Tailwind CSS IntelliSense installed
- [ ] Prettier - Code formatter installed
- [ ] ESLint installed
- [ ] TypeScript support (built-in) working
- [ ] Cursor settings configured
- [ ] React snippets working (`rafce` → Tab)
- [ ] Tailwind autocomplete working
- [ ] Auto-formatting on save working
- [ ] ESLint showing warnings
- [ ] TypeScript auto-imports working

---

## 🎯 You're All Set!

With these extensions installed and configured, you'll have:
- **Code completion** for React and Tailwind
- **Auto-formatting** on save
- **Error detection** with ESLint
- **Auto-imports** for TypeScript (built-in)
- **Professional development experience**

Now you can start building your research lab website with a fully optimized development environment! 