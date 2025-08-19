# Content Management Guide

This guide explains how WAVES Lab members can create and manage content for the lab website.

## 🎯 **Quick Start**

### **For Lab Members:**

1. **Visit the admin dashboard**: `/admin` (only visible when logged in)
2. **Use Slack commands**: Quick content creation via Slack
3. **Direct Studio access**: `/studio` for full content management

## 📝 **Content Management Methods**

### **1. Admin Dashboard** (Recommended)

Visit `/admin` for a user-friendly dashboard with:

- **Quick actions** for creating new content
- **Direct links** to edit existing content
- **System status** monitoring
- **Help resources**

### **2. Sanity Studio** (Full-featured)

Access `/studio` for the complete content management experience:

- **Rich text editing** with markdown support
- **Image management** with optimization
- **Content relationships** (linking people to publications)
- **Preview mode** for draft review
- **Version history** and change tracking

### **3. Slack Integration** (Quick Actions)

Use Slack slash commands for rapid content creation:

#### **Add Team Member**

```
/add-person "Full Name" "Title" [userGroup]
```

**Examples:**

- `/add-person "Jane Smith" "Research Scientist" current`
- `/add-person "John Doe" "Postdoc" current`
- `/add-person "Alice Johnson" "Alumni" alumni`

#### **Add Publication**

```
/add-publication "Title" "publicationType"
```

**Examples:**

- `/add-publication "New Research Paper" journal-article`
- `/add-publication "Conference Presentation" conference-paper`
- `/add-publication "Preprint" preprint`

#### **Add News Post**

```
/add-news "Title" "category"
```

**Examples:**

- `/add-news "New Research Grant Awarded" lab-news`
- `/add-news "Paper Published in Nature" publication`
- `/add-news "Conference Presentation" conference`

## 👥 **Managing People**

### **Creating a New Person Profile**

1. **Via Admin Dashboard:**
   - Go to `/admin`
   - Click "Add Team Member"
   - Fill out the form in Sanity Studio

2. **Via Slack:**
   - Use `/add-person "Name" "Title" userGroup`
   - Edit details in Sanity Studio

3. **Via Sanity Studio:**
   - Go to `/studio`
   - Navigate to "People" → "All People"
   - Click "Create new"

### **Required Fields**

- **Name**: Full name of the person
- **Title**: Current position/title
- **User Group**: `current`, `alumni`, `collaborator`, or `visitor`
- **Slug**: Auto-generated from name (can be customized)

### **Optional Fields**

- **Avatar**: Profile photo (recommended)
- **Email**: Contact email
- **Website**: Personal website
- **Social Media**: ORCID, Google Scholar, LinkedIn, etc.
- **Education**: Academic background
- **Research Interests**: Areas of expertise
- **Bio**: Short biography
- **Bio Long**: Detailed biography

## 📄 **Managing Publications**

### **Creating a New Publication**

1. **Via Admin Dashboard:**
   - Go to `/admin`
   - Click "Add Publication"
   - Fill out the form in Sanity Studio

2. **Via Slack:**
   - Use `/add-publication "Title" "type"`
   - Edit details in Sanity Studio

3. **Via Sanity Studio:**
   - Go to `/studio`
   - Navigate to "Publications" → "All Publications"
   - Click "Create new"

### **Publication Types**

- **Journal Article**: Peer-reviewed journal papers
- **Conference Paper**: Conference proceedings
- **Book Chapter**: Book chapters
- **Preprint**: Preprints and working papers
- **Thesis**: Theses and dissertations
- **Report**: Technical reports
- **Book**: Books and monographs
- **Other**: Other publication types

### **Required Fields**

- **Title**: Publication title
- **Publication Type**: Type of publication
- **Authors**: List of authors (can link to people)
- **Published Date**: Publication date
- **Status**: Publication status

### **Optional Fields**

- **Abstract**: Publication abstract
- **Keywords**: Research keywords
- **Venue**: Journal/conference information
- **DOI**: Digital Object Identifier
- **Links**: Publisher, preprint, PDF links
- **Metrics**: Citations, impact factor
- **Featured**: Mark as featured publication

## 📰 **Managing News**

### **Creating a News Post**

1. **Via Admin Dashboard:**
   - Go to `/admin`
   - Click "Add News Post"
   - Fill out the form in Sanity Studio

2. **Via Slack:**
   - Use `/add-news "Title" "category"`
   - Edit details in Sanity Studio

3. **Via Sanity Studio:**
   - Go to `/studio`
   - Navigate to "News & Updates"
   - Click "Create new"

### **News Categories**

- **Lab News**: General lab updates
- **Research**: Research-related news
- **Publication**: Publication announcements
- **Conference**: Conference presentations
- **Award**: Awards and recognition
- **Outreach**: Outreach activities
- **Collaboration**: Collaboration news
- **Event**: Events and workshops
- **General**: Other news

### **Required Fields**

- **Title**: News post title
- **Excerpt**: Short summary
- **Content**: Full news content (markdown supported)
- **Category**: News category
- **Published Date**: Publication date
- **Status**: Draft, published, scheduled, or archived

### **Optional Fields**

- **Featured Image**: Main image for the post
- **Author**: Link to lab member
- **Related Content**: Link to publications, projects, people
- **Social Media**: Custom sharing text
- **Featured**: Mark as featured news
- **Sticky**: Pin to top of news page

## 🔬 **Managing Projects**

### **Creating a Research Project**

1. **Via Admin Dashboard:**
   - Go to `/admin`
   - Click "Add Project"
   - Fill out the form in Sanity Studio

2. **Via Sanity Studio:**
   - Go to `/studio`
   - Navigate to "Research Projects"
   - Click "Create new"

### **Required Fields**

- **Title**: Project title
- **Short Description**: Brief project description
- **Status**: Active, completed, on-hold, planning, or cancelled

### **Optional Fields**

- **Description**: Detailed project description
- **Featured Image**: Project image
- **Timeline**: Start and end dates
- **Participants**: Lab members involved
- **Funding**: Funding information
- **Related Content**: Publications and other projects
- **External Links**: Project website, code, data

## 🖼️ **Image Management**

### **Uploading Images**

1. **In Sanity Studio:**
   - Click the image field
   - Drag and drop or click to upload
   - Images are automatically optimized

2. **Image Optimization:**
   - Images are automatically resized
   - Multiple formats generated (WebP, AVIF)
   - CDN delivery for fast loading

### **Image Best Practices**

- **Use descriptive filenames**: `jane-smith-profile.jpg`
- **Add alt text**: For accessibility
- **Optimize before upload**: Keep file sizes reasonable
- **Use appropriate dimensions**: Profile photos: 400x400px, Featured images: 1200x630px

## 🔗 **Content Relationships**

### **Linking People to Publications**

1. **In publication form:**
   - Add author field
   - Search for existing people
   - Or create new person inline

### **Linking Publications to Projects**

1. **In project form:**
   - Add related publications
   - Search and select existing publications

### **Cross-referencing Content**

- **News posts** can link to people, publications, and projects
- **Projects** can link to participants and related content
- **People** can be linked as authors or participants

## 📊 **Content Status and Workflow**

### **Publication Status**

- **In Preparation**: Work in progress
- **Submitted**: Submitted for review
- **Under Review**: Under peer review
- **Accepted**: Accepted for publication
- **In Press**: Accepted, awaiting publication
- **Published**: Published and available

### **News Status**

- **Draft**: Work in progress
- **Scheduled**: Scheduled for publication
- **Published**: Live on the website
- **Archived**: Archived content

### **Project Status**

- **Planning**: In planning phase
- **Active**: Currently active
- **On Hold**: Temporarily paused
- **Completed**: Project completed
- **Cancelled**: Project cancelled

## 🔧 **Tips and Best Practices**

### **Content Creation**

- **Be consistent**: Use consistent formatting and style
- **Add metadata**: Fill out all relevant fields
- **Use relationships**: Link related content together
- **Preview before publishing**: Use preview mode to check content

### **SEO and Accessibility**

- **Use descriptive titles**: Clear, informative titles
- **Add alt text**: For all images
- **Use keywords**: In titles and descriptions
- **Write good excerpts**: Clear summaries for news posts

### **Collaboration**

- **Communicate changes**: Let team know about major updates
- **Use drafts**: Work in draft mode for major changes
- **Review content**: Have others review before publishing
- **Backup important content**: Export important data regularly

## 🆘 **Getting Help**

### **Common Issues**

- **Can't access Studio**: Check if you're logged in
- **Content not appearing**: Check publication status
- **Images not loading**: Check image upload
- **Links not working**: Verify URL format

### **Support Resources**

- **Admin Dashboard**: `/admin` for quick access
- **API Documentation**: `/api-keys` for technical users
- **System Status**: `/api/cms/health` for system health
- **Contact**: Reach out to lab administrators

### **Training and Onboarding**

- **New members**: Schedule training session
- **Content guidelines**: Follow established patterns
- **Best practices**: Review this guide regularly
- **Updates**: Stay informed about new features

## 🚀 **Advanced Features**

### **API Access**

For technical users who need programmatic access:

- **API Keys**: Manage at `/api-keys`
- **Direct API**: Use Sanity's API directly
- **Automation**: Integrate with external tools

### **Slack Integration**

For quick content creation:

- **Slash commands**: Quick content creation
- **Notifications**: Get notified of content updates
- **Team collaboration**: Share content updates

### **Preview Mode**

For content review:

- **Draft preview**: Preview unpublished content
- **Live preview**: See changes in real-time
- **Mobile preview**: Check mobile layout

This guide should help you effectively manage content for the WAVES Lab website. For additional help or questions, contact the lab administrators.
