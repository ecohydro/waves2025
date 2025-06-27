# URL Mapping Report

Generated on: 2025-06-27T22:42:05.509Z

## Summary

- **Total URL Mappings**: 243
- **People Mappings**: 0
- **Publication Mappings**: 0
- **News Mappings**: 237
- **Page Mappings**: 0
- **Asset Mappings**: 6

## URL Mapping Strategy

This system maintains SEO and user experience by redirecting all legacy Jekyll URLs to their new Next.js equivalents.

### Jekyll URL Patterns → Next.js URLs

#### People Profiles
- **Jekyll**: `/people/[filename]/`
- **Next.js**: `/people/[slug]`
- **Example**: `/people/kelly-caylor/` → `/people/kelly-caylor`

#### Publications
- **Jekyll**: `/publications/[filename]/`
- **Next.js**: `/publications/[slug]`
- **Example**: `/publications/caylor2023_6934/` → `/publications/caylor2023_6934`

#### News Posts
- **Jekyll**: `/[category]/[title]/` or `/[year]/[month]/[day]/[title]/`
- **Next.js**: `/news/[slug]`
- **Example**: `/research/new-paper-in-nature/` → `/news/new-paper-in-nature`

#### Static Pages
- **Jekyll**: `/[page]/`
- **Next.js**: `/[page]`
- **Example**: `/teaching/` → `/teaching`

#### Assets
- **Jekyll**: `/assets/images/[path]`
- **Next.js**: `/images/[organized-path]`
- **Example**: `/assets/images/people/caylor.png` → `/images/people/caylor.png`

## Implementation

### Next.js Configuration

Add to `next.config.ts`:

```typescript
import { redirects } from './src/lib/redirects';

const nextConfig = {
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
```

### Alternative Implementations

- **Apache**: Use `redirects.htaccess` file
- **Nginx**: Use `redirects.nginx` configuration
- **Cloudflare**: Use Page Rules or Workers

## Detailed Mappings

### News Mappings

- `/collaboration/where-does-water-go-when-it-doesn8217t-flow/` → `/news/where-does-water-go-when-it-doesn8217t-flow` (301)
- `/2015/07/13/where-does-water-go-when-it-doesn8217t-flow/` → `/news/where-does-water-go-when-it-doesn8217t-flow` (301)
- `/2017/09/20/waves-lab-researchers-participate-in-kenyan-national-science-week-exhibition/` → `/news/waves-lab-researchers-participate-in-kenyan-national-science-week-exhibition` (301)
- `/research/waves-lab-recieves-funding-for-riparian-ecohydrology-projects/` → `/news/waves-lab-recieves-funding-for-riparian-ecohydrology-projects` (301)
- `/2018/01/26/waves-lab-recieves-funding-for-riparian-ecohydrology-projects/` → `/news/waves-lab-recieves-funding-for-riparian-ecohydrology-projects` (301)
- `/2018/05/10/waves-lab-postdoctoral-positions-available/` → `/news/waves-lab-postdoctoral-positions-available` (301)
- `/policy/waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report/` → `/news/waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report` (301)
- `/2017/10/10/waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report/` → `/news/waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report` (301)
- `/conferences/waves-lab-at-the-agu-fall-meeting-2019/` → `/news/waves-lab-at-the-agu-fall-meeting-2019` (301)
- `/2019/10/06/waves-lab-at-the-agu-fall-meeting-2019/` → `/news/waves-lab-at-the-agu-fall-meeting-2019` (301)

*... and 227 more mappings*

### Assets Mappings

- `/assets/images/people/:path*` → `/images/people/:path*` (301)
- `/assets/images/publications/:path*` → `/images/publications/:path*` (301)
- `/assets/images/:path*` → `/images/site/:path*` (301)
- `/assets/files/:path*` → `/files/:path*` (301)
- `/uploads/:path*` → `/files/:path*` (301)
- `/wp-content/uploads/:path*` → `/files/:path*` (301)



## Testing Redirects

### Manual Testing
```bash
# Test with curl
curl -I http://localhost:3000/people/kelly-caylor/
curl -I http://localhost:3000/publications/caylor2023_6934/
curl -I http://localhost:3000/research/new-paper-in-nature/
```

### Automated Testing
```bash
# Run redirect tests
npm run test:redirects
```

## Monitoring

- **Google Search Console**: Monitor 404 errors and redirect success
- **Analytics**: Track redirect usage and identify missing mappings
- **Server Logs**: Monitor redirect performance and identify issues

## Maintenance

- **New Content**: Ensure new content follows slug conventions
- **Legacy Links**: Monitor for new legacy links that need mapping
- **Performance**: Regularly review redirect performance impact

---

*This report was generated automatically by the URL mapping system.*
