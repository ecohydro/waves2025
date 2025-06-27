# Migration Data Gaps & Improvement Opportunities

This document tracks missing data, quality issues, and enhancement opportunities identified during the Jekyll to Next.js migration.

## 🚨 Critical Issues (Need Manual Fix)

### YAML Parsing Errors

**Files with malformed YAML that failed migration:**

- `Caylor2021_6353.md` - Malformed quotes in excerpt
- `Caylor2021_6673.md` - Malformed quotes in excerpt
- `Krell2021_1894.md` - Malformed quotes in excerpt

**Action Required:** Manually fix YAML syntax in these 3 files and re-run migration.

---

## 📧 Missing Contact Information (People)

### Missing Email Addresses (Current Members Only)

**Updated Policy:** Only current members require email addresses (identified by "current member" tag)

**Current Members Missing Emails (1 remaining):**

- Marc Mayes - Current member (only remaining current member without email)

**Current Members With Emails:**

- Kelly Caylor (PI) ✅
- Bryn Morgan ✅
- John Gitonga ✅
- Rachel Green ✅

**Note:** Former members (tagged as "former member") do not require email addresses for privacy/maintenance reasons.

**Action Required:**

1. Identify all people tagged as "current member"
2. Update `legacy/_data/authors.yml` with current member email addresses only
3. Re-run people migration to populate email fields for current members

---

## 📝 Missing Content (People)

### Missing Bio/Excerpt (21 people)

**Files missing excerpt/bio:**

- `choi.md`, `goodman.md`, `grossman.md`, `guenther.md`, `harkins.md`
- `ingram.md`, `jones.md`, `kemeny.md`, `lane.md`, `luo.md`
- `morgan.md`, `nyathi.md`, `ohlwiler.md`, `ragazzo.md`, `rodriguez.md`
- `rogers.md`, `ryan.md`, `safford.md`, `smith.md`, `zhao.md`

**Action Required:** Add brief bio/research description for these people.

### Missing Profile Images

**People without avatar images:**

- Several profiles reference missing image files

**Action Required:**

1. Audit `legacy/assets/images/people/` directory
2. Identify missing profile photos
3. Request photos from lab members or use placeholder

---

## 📚 Publication Data Gaps

### Missing DOI (2 publications)

- `Caylor2002_1384.md`
- `Caylor2007_1507.md`
- `Guan2014_4078.md`

**Action Required:** Research and add DOIs for these publications.

### Missing Journal Information (13 publications)

**Files missing journal metadata:**

- `Caylor2004_1444.md`, `Caylor2006_1491.md`, `Caylor2009_1572.md`
- `Caylor2022_6128.md`, `Caylor2023_4247.md`, `Caylor2023_9423.md`
- `Estes2023_1099.md`, `Franz2012_1681.md`, `Good2014_4073.md`
- `King2010_1629.md`, `Tuholske2018_1111.md`, `Wang2010_1619.md`
- `Wang2014_4189.md`

**Action Required:** Extract journal names from publication metadata or citations.

### Missing Publication Images

- `Soderberg2013_2153.md` - Missing teaser image

**Action Required:** Check if image exists in assets or create placeholder.

---

## 🔗 Data Enhancement Opportunities

### Author Information Improvements

#### 1. Enhanced Social/Academic Links

**Current Status:** Basic links from `authors.yml`
**Missing for many people:**

- ORCID IDs
- Google Scholar profiles
- ResearchGate profiles
- Personal websites
- GitHub profiles

**Action Required:**

1. Research and collect ORCID IDs for all researchers
2. Find Google Scholar and ResearchGate profiles
3. Update `authors.yml` with complete social links

#### 2. Education Information

**Current Status:** Basic parsing from header captions
**Improvements Needed:**

- Graduation years
- Thesis titles
- Advisor information
- More detailed degree information

#### 3. Research Areas Classification

**Current Status:** Empty arrays
**Action Required:**

1. Define research area taxonomy for the lab
2. Assign research areas to each person based on their work
3. Create research area pages/categories

### Publication Enhancements

#### 1. Author Parsing Improvements

**Current Issues:**

- Simple comma-based parsing misses complex author lists
- Author affiliations are defaulted to UCSB
- No corresponding author identification

**Action Required:**

1. Improve author parsing algorithm
2. Research actual author affiliations
3. Identify corresponding authors

#### 2. Abstract Content

**Current Status:** Most abstracts show "None"
**Action Required:**

1. Extract abstracts from PDF files or publisher APIs
2. Populate abstract fields for key publications

#### 3. Publication Metrics

**Current Status:** Placeholder zeros
**Action Required:**

1. Integrate with Google Scholar API for citation counts
2. Integrate with Altmetric API for impact scores
3. Set up automated metric updates

#### 4. Research Area Classification

**Current Status:** Basic keyword-based classification
**Action Required:**

1. Review and refine research area assignments
2. Create more sophisticated classification logic
3. Add manual overrides for specific publications

---

## 🖼️ Asset Management

### Image Optimization Needed

**Current Status:** Images copied with original paths
**Action Required:**

1. Migrate images from `legacy/assets/images/` to `public/images/`
2. Optimize image sizes and formats
3. Generate responsive image variants
4. Update all image references in migrated content

### Missing Images Audit

**Action Required:**

1. Compare image references in content with actual files
2. Identify missing images
3. Create placeholder images for missing assets
4. Optimize existing images for web

---

## 🔍 Content Validation & Quality

### URL Slug Validation

**Current Status:** Auto-generated from names/titles
**Action Required:**

1. Review generated slugs for conflicts
2. Ensure SEO-friendly URL structure
3. Create redirect mapping from old Jekyll URLs

### Content Cross-References

**Current Status:** No relationships established
**Action Required:**

1. Link people to their publications
2. Link publications to their authors
3. Create author collaboration networks
4. Add related content suggestions

### SEO Metadata

**Action Required:**

1. Add meta descriptions for all content
2. Generate Open Graph images
3. Create structured data markup
4. Optimize titles for search

---

## 🔧 Technical Improvements

### Migration Script Enhancements

1. **Better Error Handling:** More graceful handling of malformed YAML
2. **Author Matching:** Improve author name matching between files and authors.yml
3. **Content Validation:** Add post-migration validation checks
4. **Incremental Updates:** Support for updating individual files without full re-migration

### Data Integration

1. **External APIs:** Integrate ORCID, Google Scholar, Altmetric APIs
2. **Publication Databases:** Connect to DOI/CrossRef for metadata
3. **Image Processing:** Automated image optimization pipeline
4. **Content Relationships:** Automated relationship detection

---

## 📋 Prioritized Action Plan

### Phase 1: Critical Fixes (Week 1)

1. ✅ Fix 3 YAML parsing errors and re-migrate
2. ✅ Add missing email addresses for current lab members
3. ✅ Add missing journal information for recent publications
4. ✅ Audit and fix missing profile images

### Phase 2: Content Enhancement (Week 2)

1. ✅ Add bio/excerpt for people missing descriptions
2. ✅ Research and add missing DOIs
3. ✅ Collect ORCID IDs for all researchers
4. ✅ Define research area taxonomy

### Phase 3: Data Integration (Week 3)

1. ✅ Integrate external APIs for publication metrics
2. ✅ Improve author parsing and affiliations
3. ✅ Establish content relationships
4. ✅ Migrate and optimize images

### Phase 4: Quality & SEO (Week 4)

1. ✅ Add abstracts for key publications
2. ✅ Optimize SEO metadata
3. ✅ Create URL redirects
4. ✅ Final content validation

---

## 📊 Progress Tracking

### Migration Statistics

- **People:** 69/69 migrated (100%)
- **Publications:** 134/137 migrated (97.8%)
- **News Posts:** Not yet migrated
- **Images:** Not yet migrated

### Data Completeness

- **Email Addresses (Current Members):** 80% complete (4/5 current members)
- **Bio/Excerpts:** ~70% complete
- **Publication DOIs:** ~98% complete
- **Journal Information:** ~90% complete
- **ORCID IDs:** ~5% complete
- **Research Areas:** 0% complete

### Quality Metrics

- **YAML Errors:** 3 files (0.7%)
- **Missing Images:** TBD after asset audit
- **Broken Links:** TBD after validation
- **SEO Readiness:** ~30% complete

---

This document will be updated as we address each item and discover new improvement opportunities.
