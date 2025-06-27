# 🚀 Next.js Beginner's Guide for Research Lab Website

## 🎯 What You Need to Know (Minimal React Required!)

### The Good News
- **Next.js handles most React complexity** for you
- **File-based routing** - just create files in folders
- **Built-in optimizations** - images, fonts, performance
- **Great documentation** and community support
- **You can start simple** and add complexity later

### React Basics (5-minute overview)
React is just JavaScript that helps you build reusable UI pieces. Here's all you need to know:

```jsx
// A React component is just a function that returns HTML
function Welcome() {
  return <h1>Hello, Research Lab!</h1>
}

// You can use variables in your HTML
function PersonCard({ name, title }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{title}</p>
    </div>
  )
}
```

That's it! The rest is just styling and logic.

---

## 🛠 Getting Started (Step-by-Step)

### Step 1: Set Up Your Development Environment

1. **Install Node.js** (if you don't have it)
   - Go to [nodejs.org](https://nodejs.org)
   - Download the LTS version
   - Install it on your computer

2. **Install VS Code** (recommended editor)
   - Download from [code.visualstudio.com](https://code.visualstudio.com)
   - Install helpful extensions:
     - "ES7+ React/Redux/React-Native snippets"
     - "Tailwind CSS IntelliSense"
     - "Prettier - Code formatter"

### Step 2: Create Your Next.js Project

Open your terminal and run these commands:

```bash
# Create a new Next.js project
npx create-next-app@latest research-lab-website --typescript --tailwind --eslint

# Navigate to your project
cd research-lab-website

# Start the development server
npm run dev
```

Your website will be running at `http://localhost:3000`!

### Step 3: Understand the Project Structure

```
research-lab-website/
├── app/                    # This is where your pages go
│   ├── page.tsx           # Homepage (http://localhost:3000)
│   ├── about/page.tsx     # About page (http://localhost:3000/about)
│   └── globals.css        # Global styles
├── components/            # Reusable UI pieces
├── public/               # Images and other files
└── package.json          # Project configuration
```

---

## 📝 Your First Pages (Copy & Paste Examples)

### Simple Homepage
Replace `app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Our Research Lab
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          We conduct cutting-edge research in [your field]. Our team is dedicated to 
          advancing knowledge and solving real-world problems.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Latest Research</h2>
            <p className="text-gray-600">
              Check out our most recent publications and findings.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Meet Our Team</h2>
            <p className="text-gray-600">
              Learn about our researchers and their expertise.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
```

### People Page
Create `app/people/page.tsx`:

```tsx
const teamMembers = [
  {
    name: "Dr. Jane Smith",
    title: "Principal Investigator",
    bio: "Leading research in environmental science with 15+ years of experience.",
    image: "/images/jane-smith.jpg"
  },
  {
    name: "Dr. John Doe",
    title: "Postdoctoral Researcher",
    bio: "Specializing in data analysis and machine learning applications.",
    image: "/images/john-doe.jpg"
  }
]

export default function People() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Team</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200">
                {/* Image placeholder - add actual images later */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.title}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
```

### Publications Page
Create `app/publications/page.tsx`:

```tsx
const publications = [
  {
    title: "Climate Change Impacts on Coastal Ecosystems",
    authors: "Smith, J., Doe, J., Johnson, A.",
    journal: "Nature Climate Change",
    year: 2024,
    doi: "10.1038/s41558-024-01234-5"
  },
  {
    title: "Machine Learning Approaches to Environmental Data",
    authors: "Doe, J., Smith, J.",
    journal: "Environmental Science & Technology",
    year: 2023,
    doi: "10.1021/acs.est.3c01234"
  }
]

export default function Publications() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Publications</h1>
        
        <div className="space-y-6">
          {publications.map((pub, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{pub.title}</h3>
              <p className="text-gray-600 mb-2">{pub.authors}</p>
              <p className="text-gray-500 mb-2">
                {pub.journal} ({pub.year})
              </p>
              <a 
                href={`https://doi.org/${pub.doi}`}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI: {pub.doi}
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
```

---

## 🎨 Styling with Tailwind CSS

Tailwind CSS makes styling super easy. Here are the basics:

### Common Classes You'll Use
```html
<!-- Spacing -->
<div className="p-4">Padding on all sides</div>
<div className="m-4">Margin on all sides</div>
<div className="px-4 py-2">Padding horizontal and vertical</div>

<!-- Colors -->
<div className="bg-blue-500">Blue background</div>
<div className="text-gray-600">Gray text</div>
<div className="border border-gray-300">Gray border</div>

<!-- Typography -->
<h1 className="text-4xl font-bold">Large bold heading</h1>
<p className="text-lg text-gray-600">Large gray paragraph</p>

<!-- Layout -->
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">Responsive grid</div>
<div className="flex items-center justify-between">Flexbox layout</div>
```

### Responsive Design
```html
<!-- Mobile first - starts small, gets bigger -->
<div className="text-sm md:text-base lg:text-lg">
  Small on mobile, normal on tablet, large on desktop
</div>
```

---

## 🔧 Common Next.js Patterns

### Creating New Pages
Just create a new folder and `page.tsx` file:

```
app/
├── page.tsx              # Homepage (/)
├── about/
│   └── page.tsx         # About page (/about)
├── people/
│   └── page.tsx         # People page (/people)
└── publications/
    └── page.tsx         # Publications page (/publications)
```

### Adding Images
1. Put images in the `public` folder
2. Reference them like this:

```tsx
import Image from 'next/image'

export default function TeamMember() {
  return (
    <Image
      src="/images/jane-smith.jpg"
      alt="Dr. Jane Smith"
      width={300}
      height={300}
      className="rounded-lg"
    />
  )
}
```

### Navigation Between Pages
```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-6xl mx-auto flex space-x-6">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <Link href="/people" className="text-blue-600 hover:underline">
          People
        </Link>
        <Link href="/publications" className="text-blue-600 hover:underline">
          Publications
        </Link>
      </div>
    </nav>
  )
}
```

---

## 🚀 Next Steps

### Week 1 Goals
1. ✅ Set up your development environment
2. ✅ Create the basic project structure
3. ✅ Build simple homepage, people, and publications pages
4. ✅ Add basic navigation between pages
5. ✅ Style your pages with Tailwind CSS

### Week 2 Goals
1. Add real content from your existing site
2. Create reusable components
3. Add images and optimize them
4. Make the site responsive
5. Deploy to Vercel

### Learning Resources
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **React Basics**: [react.dev/learn](https://react.dev/learn)

---

## 💡 Pro Tips for Beginners

1. **Start Simple**: Don't try to build everything at once
2. **Copy & Paste**: Use the examples above as starting points
3. **Experiment**: Change colors, text, and layouts to see what happens
4. **Use the Browser**: Check your changes in real-time at localhost:3000
5. **Don't Panic**: If something breaks, just refresh the page and try again

### Common Issues & Solutions

**"Module not found" error?**
- Make sure you're in the right folder
- Run `npm install` to install dependencies

**Page not updating?**
- Check that you saved the file
- Make sure the development server is running (`npm run dev`)

**Styling not working?**
- Check that Tailwind classes are spelled correctly
- Make sure `globals.css` includes Tailwind directives

---

## 🎯 You're Ready!

You now have everything you need to start building your research lab website. The examples above will give you a solid foundation, and you can build from there.

Remember: **Start simple, iterate often, and don't be afraid to experiment!**

Need help? The Next.js community is very beginner-friendly, and you can always ask questions in their Discord or GitHub discussions. 