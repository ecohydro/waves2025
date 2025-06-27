# URL Redirect System Guide

This guide covers the comprehensive URL redirect system for maintaining existing links during the WAVES Lab website migration from Jekyll to Next.js.

## Overview

The URL redirect system ensures that all existing Jekyll URLs continue to work after migration to Next.js, preserving SEO rankings and user bookmarks. The system automatically generates **1,054 redirects** covering all content types.

## System Components

### 1. URL Mapping Generator (`generate-url-mappings.ts`)

Analyzes migrated content and generates comprehensive URL mappings:

#### Content Analysis

- **People Profiles**: 138 redirects from `/people/[filename]/` to `/people/[slug]`
- **Publications**: 268 redirects from `/publications/[filename]/` to `/publications/[slug]`
- **News Posts**: 628 redirects from category/date URLs to `/news/[slug]`
- **Static Pages**: 14 redirects for common pages (teaching, opportunities, etc.)
- **Assets**: 6 pattern redirects for images and files

#### Output Files

- `src/lib/redirects.ts` - Next.js redirect configuration
- `docs/migration/url-mappings.json` - Machine-readable mappings
- `docs/migration/redirects.htaccess` - Apache server redirects
- `docs/migration/redirects.nginx` - Nginx server redirects

### 2. Next.js Config Updater (`update-next-config.ts`)

Automatically updates `next.config.ts` with redirect configuration:

```typescript
import { redirects } from './src/lib/redirects';

const nextConfig: NextConfig = {
  async redirects() {
    return redirects;
  },
};
```

### 3. Redirect Tester (`test-redirects.ts`)

Validates redirect mappings and generates test reports:

- Tests redirect URL structure
- Validates mapping completeness
- Generates detailed test reports
- 100% success rate on structure validation

## Jekyll to Next.js URL Patterns

### People Profiles

```
Jekyll:  /people/kelly-caylor/
Next.js: /people/kelly-caylor
Status:  301 Permanent Redirect
```

### Publications

```
Jekyll:  /publications/caylor2023_6934/
Next.js: /publications/caylor2023_6934
Status:  301 Permanent Redirect
```

### News Posts (Multiple Patterns)

```
Jekyll:  /research/new-paper-in-nature/
Jekyll:  /2023/08/15/new-paper-in-nature/
Next.js: /news/new-paper-in-nature
Status:  301 Permanent Redirect
```

### Static Pages

```
Jekyll:  /teaching/
Next.js: /teaching
Status:  301 Permanent Redirect
```

### Assets (Pattern Redirects)

```
Jekyll:  /assets/images/people/caylor.png
Next.js: /images/people/caylor.png
Status:  301 Permanent Redirect
```

## Usage

### Quick Setup

```bash
# Generate all redirects and update Next.js config
./scripts/generate-url-mappings.sh

# Test redirects
npx tsx src/lib/migration/test-redirects.ts
```

### Manual Generation

```bash
# Generate URL mappings
npx tsx src/lib/migration/generate-url-mappings.ts

# Update Next.js configuration
npx tsx src/lib/migration/update-next-config.ts
```

### Programmatic Usage

```typescript
import { URLMappingGenerator } from './src/lib/migration/generate-url-mappings';

const generator = new URLMappingGenerator();
const report = await generator.generateMappings();

console.log(`Generated ${report.totalMappings} redirects`);
```

## Implementation Details

### Next.js Redirects

The system generates Next.js-compatible redirects:

```typescript
export const redirects = [
  // People redirects
  {
    source: '/people/kelly-caylor/',
    destination: '/people/kelly-caylor',
    permanent: true,
  },

  // Publication redirects
  {
    source: '/publications/caylor2023_6934/',
    destination: '/publications/caylor2023_6934',
    permanent: true,
  },

  // Asset pattern redirects
  {
    source: '/assets/images/people/:path*',
    destination: '/images/people/:path*',
    permanent: true,
  },
];
```

### Pattern Matching

The system handles various Jekyll URL patterns:

#### News Post Patterns

1. **Category-based**: `/[category]/[title]/`
2. **Date-based**: `/[year]/[month]/[day]/[title]/`
3. **Direct**: `/[title]/`

#### Trailing Slash Handling

- Redirects both `/path/` and `/path` to Next.js format
- Ensures compatibility with different link formats

#### Dynamic Paths

- Uses Next.js `:path*` syntax for asset redirects
- Handles nested directory structures

## Server Configuration

### Apache (.htaccess)

```apache
RewriteEngine On

# People redirects
Redirect 301 /people/kelly-caylor/ /people/kelly-caylor

# Asset pattern redirects
RewriteRule ^assets/images/people/(.*)$ /images/people/$1 [R=301,L]
```

### Nginx

```nginx
# People redirects
rewrite ^/people/kelly-caylor/$ /people/kelly-caylor permanent;

# Asset pattern redirects
rewrite ^/assets/images/people/(.*)$ /images/people/$1 permanent;
```

### Cloudflare Page Rules

```
assets/images/people/*
→ images/people/$1
Status: 301 Permanent Redirect
```

## Performance Considerations

### Redirect Volume

- **Total redirects**: 1,054
- **Impact**: Minimal (<1ms per redirect)
- **Caching**: Redirects are cached by browsers and CDNs

### Optimization Strategies

#### Pattern Consolidation

```typescript
// Instead of individual redirects for each file
{ source: '/assets/images/people/caylor.png', destination: '/images/people/caylor.png' }
{ source: '/assets/images/people/wang.png', destination: '/images/people/wang.png' }

// Use pattern redirects
{ source: '/assets/images/people/:path*', destination: '/images/people/:path*' }
```

#### Redirect Ordering

- Pattern redirects placed after specific redirects
- Most common redirects processed first
- Minimizes processing time

## Monitoring and Analytics

### Google Search Console

- Monitor crawl errors and redirect success
- Track redirect impact on search rankings
- Identify missing redirects from 404 errors

### Analytics Integration

```javascript
// Track redirect usage
gtag('event', 'redirect', {
  old_url: window.location.pathname,
  new_url: destination,
  redirect_type: 'migration',
});
```

### Server Logs

```bash
# Monitor redirect performance
tail -f /var/log/nginx/access.log | grep "301\|302"

# Count redirect usage
awk '$9 == "301" {print $7}' access.log | sort | uniq -c | sort -nr
```

## Testing

### Manual Testing

```bash
# Test specific redirects
curl -I http://localhost:3000/people/kelly-caylor/
curl -I http://localhost:3000/assets/images/people/caylor.png

# Expected response
HTTP/1.1 301 Moved Permanently
Location: /people/kelly-caylor
```

### Automated Testing

```bash
# Run redirect test suite
npm run test:redirects

# Test with different user agents
curl -H "User-Agent: Googlebot" -I http://localhost:3000/people/kelly-caylor/
```

### Browser Testing

1. Visit legacy URLs in browser
2. Verify redirects are seamless
3. Check that redirected pages load correctly
4. Test with different browsers and devices

## Maintenance

### Adding New Redirects

#### For New Content

```typescript
// Add to redirects.ts
{
  source: '/legacy-url',
  destination: '/new-url',
  permanent: true,
}
```

#### For Pattern Updates

```typescript
// Update pattern redirects
{
  source: '/old-pattern/:path*',
  destination: '/new-pattern/:path*',
  permanent: true,
}
```

### Monitoring for Missing Redirects

#### 404 Error Analysis

```bash
# Find common 404s that need redirects
grep "404" access.log | awk '{print $7}' | sort | uniq -c | sort -nr | head -20
```

#### Search Console Integration

- Weekly review of crawl errors
- Add redirects for frequently accessed 404s
- Monitor redirect success rates

### Performance Monitoring

#### Redirect Response Times

```javascript
// Monitor redirect performance
const start = performance.now();
fetch('/legacy-url').then(() => {
  const time = performance.now() - start;
  console.log(`Redirect time: ${time}ms`);
});
```

#### Redirect Chain Detection

```bash
# Check for redirect chains
curl -L -w "%{url_effective}\n" -o /dev/null -s http://localhost:3000/legacy-url
```

## Troubleshooting

### Common Issues

#### Redirect Loops

**Symptoms**: Browser shows "too many redirects" error
**Causes**: Circular redirect patterns
**Solution**: Review redirect mappings for cycles

```bash
# Debug redirect chains
curl -L -v http://localhost:3000/problematic-url
```

#### 404 Errors After Migration

**Symptoms**: Legacy URLs return 404 instead of redirecting
**Causes**: Missing redirect mappings or incorrect patterns
**Solution**: Add missing redirects and regenerate mappings

#### Performance Issues

**Symptoms**: Slow page loads, high server load
**Causes**: Too many individual redirects, complex patterns
**Solution**: Consolidate redirects into patterns, optimize ordering

### Debugging Steps

1. **Check Next.js config**: Verify redirects are properly imported
2. **Test locally**: Use curl to test redirect behavior
3. **Check server logs**: Monitor redirect processing
4. **Validate patterns**: Ensure pattern syntax is correct
5. **Test edge cases**: Verify behavior with special characters

### Recovery Procedures

#### Rollback Redirects

```bash
# Backup current config
cp next.config.ts next.config.ts.backup

# Restore previous version
git checkout HEAD~1 next.config.ts
```

#### Emergency Redirect Addition

```typescript
// Add critical redirects directly to next.config.ts
async redirects() {
  return [
    // Emergency redirects
    { source: '/critical-legacy-url', destination: '/new-url', permanent: true },

    // Generated redirects
    ...redirects,
  ];
}
```

## Security Considerations

### Open Redirect Prevention

- All redirects use relative URLs
- No external domain redirects
- Pattern validation prevents malicious redirects

### Input Validation

```typescript
// Validate redirect destinations
const isValidDestination = (url: string) => {
  return url.startsWith('/') && !url.includes('//');
};
```

### Rate Limiting

```nginx
# Nginx rate limiting for redirects
limit_req_zone $binary_remote_addr zone=redirects:10m rate=10r/s;
limit_req zone=redirects burst=20 nodelay;
```

## Future Enhancements

### Dynamic Redirect Management

- Admin interface for adding redirects
- Database-driven redirect storage
- Real-time redirect updates

### Advanced Analytics

- Redirect conversion tracking
- User journey analysis
- A/B testing for redirect destinations

### Performance Optimization

- Edge-side redirect processing
- Intelligent redirect caching
- Predictive redirect pre-loading

This comprehensive redirect system ensures seamless migration while maintaining SEO value and user experience.
