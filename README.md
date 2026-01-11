# 🌊 Research Lab Website

A modern, responsive website for a research lab built with Next.js 14, TypeScript, and Tailwind CSS. This project represents a comprehensive migration from Jekyll to a modern web stack with enhanced content management and dynamic API integrations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## ✨ Key Features

- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Content Migration**: 97.8% successful migration from Jekyll
- **Enhanced Data**: CSV integration with advisor-advisee relationships
- **API Ready**: Dynamic metrics via Altmetric, Dimensions.ai APIs
- **Responsive Design**: Mobile-first, accessible interface
- **Performance Optimized**: Lighthouse score >90 target

## 📁 Project Structure

```
waves2025/
├── docs/                   # 📚 Comprehensive documentation
├── src/                    # 💻 Next.js application source
├── content/                # 📄 Migrated content (MDX)
├── public/                 # 🖼️ Static assets
├── csv_files/              # 📊 Enhanced data sources
└── legacy/                 # 🗄️ Original Jekyll site
```

## 📚 Documentation

**[📖 Full Documentation](./docs/)** - Comprehensive guides organized by topic:

- **[🔧 Setup Guides](./docs/setup/)** - Environment setup and getting started
- **[🚚 Migration Docs](./docs/migration/)** - Content migration results and schemas
- **[📋 Planning](./docs/planning/)** - Project roadmap and task tracking
- **[💻 Development](./docs/development/)** - Technical decisions and architecture

### Quick Links

- **New Developer?** → [Beginner Guide](./docs/setup/BEGINNER_GUIDE.md)
- **Environment Setup?** → [Node Environment Setup](./docs/setup/NODE_ENVIRONMENT_SETUP.md)
- **Migration Status?** → [Enhanced Migration Results](./docs/migration/ENHANCED_MIGRATION_RESULTS.md)
- **Project Overview?** → [Project Plan](./docs/planning/PROJECT_PLAN.md)
- **Semantic Scholar Integration** → [Guide and Workflows](./docs/content-management/SEMANTIC_SCHOLAR_README.md)

## 🧪 Testing

### Test Organization

This project uses a multi-tier testing strategy to balance speed and coverage:

- **Unit Tests** (`npm run test`, `npm run test:fast`): Fast tests for individual components and functions
- **Integration Tests** (`npm run test:full-integration`): Comprehensive tests that start servers and test real data flows

### Test Commands

```bash
# Fast tests (CI-friendly)
npm run test            # Jest unit tests
npm run test:fast       # Vitest unit tests (excludes integration)

# Integration tests (manual only - slow)
npm run test:full-integration  # Full CMS integration with real data
npm run test:sanity-data       # Sanity data validation only
```

### CI Integration

Integration tests are **excluded from CI by default** to maintain fast build times. They should only be run:

- Manually when validating major changes
- In staging environments before production deployments
- When debugging CMS integration issues

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Migration Tools
npm run migrate:people                    # Migrate people profiles
npm run migrate:publications:enhanced     # Enhanced publication migration
npm run migrate:people:enhanced          # Enhanced people migration

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript validation

# Testing
npm run test            # Run Jest unit tests (fast)
npm run test:fast       # Run Vitest unit tests (fast)
npm run test:vitest     # Run all Vitest tests (excludes integration)
npm run test:full-integration  # Run full CMS integration tests (slow, manual only)
```

## 📈 Migration Achievements

- ✅ **134/137 publications** successfully migrated (97.8%)
- ✅ **69/69 people profiles** migrated (100%)
- ✅ **170 CSV records** integrated for enhanced data
- ✅ **Complete relationship mapping** (advisor-advisee networks)
- ✅ **API-ready infrastructure** for dynamic metrics

## 🎯 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: MDX (Markdown + JSX)
- **Data**: CSV integration + API-based metrics
- **Deployment**: Vercel (planned)

## 🤝 Contributing

1. Review the [Development Documentation](./docs/development/)
2. Follow the [Setup Guide](./docs/setup/BEGINNER_GUIDE.md)
3. Check [Project Status](./docs/planning/PROJECT_STATUS.md) for current priorities

## 📞 Support

- 📖 **Documentation**: [./docs/](./docs/)
- 🐛 **Issues**: Check migration results and error logs
- 💬 **Questions**: Review setup guides and project status

---

**Built with ❤️ for advancing research impact and collaboration**
