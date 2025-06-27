# Redirect Test Report

Generated on: 2025-06-27T22:29:38.556Z

## Summary

- **Total Tests**: 20
- **Passed**: 20 ✅
- **Failed**: 0 ❌
- **Success Rate**: 100%

## Test Results

### Passed Tests

- `/people/trenton-franz/` → `/people/trenton-franz` (301)
- `/people/trenton-franz` → `/people/trenton-franz` (301)
- `/people/taylor-morgan/` → `/people/taylor-morgan` (301)
- `/people/taylor-morgan` → `/people/taylor-morgan` (301)
- `/publications/zack-guido20201267/` → `/publications/zack-guido20201267` (301)
- `/publications/zack-guido20201267` → `/publications/zack-guido20201267` (301)
- `/publications/trenton-franz20121681/` → `/publications/trenton-franz20121681` (301)
- `/publications/trenton-franz20121681` → `/publications/trenton-franz20121681` (301)
- `/collaboration/where-does-water-go-when-it-doesn8217t-flow/` → `/news/where-does-water-go-when-it-doesn8217t-flow` (301)
- `/collaboration/where-does-water-go-when-it-doesn8217t-flow` → `/news/where-does-water-go-when-it-doesn8217t-flow` (301)
- `/2015/07/13/where-does-water-go-when-it-doesn8217t-flow/` → `/news/where-does-water-go-when-it-doesn8217t-flow` (301)
- `/2015/07/13/where-does-water-go-when-it-doesn8217t-flow` → `/news/where-does-water-go-when-it-doesn8217t-flow` (301)
- `/teaching/` → `/teaching` (301)
- `/teaching` → `/teaching` (301)
- `/opportunities/` → `/opportunities` (301)
- `/opportunities` → `/opportunities` (301)
- `/assets/images/people/:path*` → `/images/people/:path*` 
- `/assets/images/publications/:path*` → `/images/publications/:path*` 
- `/assets/images/:path*` → `/images/site/:path*` 
- `/assets/files/:path*` → `/files/:path*` 



## Testing Instructions

### Manual Testing

Test redirects manually using curl:

```bash
# Test people redirect
curl -I http://localhost:3000/people/kelly-caylor/

# Test publication redirect  
curl -I http://localhost:3000/publications/caylor2023_6934/

# Test news redirect
curl -I http://localhost:3000/research/new-paper-in-nature/

# Test asset redirect
curl -I http://localhost:3000/assets/images/people/caylor.png
```

Expected response headers:
```
HTTP/1.1 301 Moved Permanently
Location: /people/kelly-caylor
```

### Automated Testing

Run the full redirect test suite:

```bash
npm run test:redirects
```

### Browser Testing

1. Start the development server: `npm run dev`
2. Visit legacy URLs in your browser
3. Verify they redirect to the correct new URLs
4. Check that the redirect is seamless and fast

## Performance Considerations

- **Redirect Chain Length**: Ensure redirects don't create chains
- **Response Time**: Redirects should be fast (<100ms)
- **Caching**: Set appropriate cache headers for redirects
- **SEO Impact**: Use 301 redirects for permanent moves

## Monitoring

### Google Search Console

- Monitor crawl errors and redirect success
- Check for redirect loops or chains
- Verify that redirected pages maintain search rankings

### Analytics

- Track redirect usage patterns
- Identify frequently accessed legacy URLs
- Monitor bounce rates on redirected pages

### Server Logs

- Monitor redirect performance
- Identify 404 errors that need new redirects
- Track redirect usage statistics

## Troubleshooting

### Common Issues

#### Redirect Loops
- **Cause**: Circular redirects
- **Solution**: Review redirect mappings for cycles

#### 404 Errors
- **Cause**: Missing redirect mappings
- **Solution**: Add new mappings for discovered legacy URLs

#### Performance Issues
- **Cause**: Too many redirects or complex patterns
- **Solution**: Optimize redirect rules and patterns

### Debugging Steps

1. **Check redirect configuration** in `next.config.ts`
2. **Verify URL patterns** match exactly
3. **Test with curl** to see actual HTTP responses
4. **Check server logs** for redirect processing
5. **Use browser dev tools** to trace redirect chains

---

*This report was generated automatically by the redirect testing system.*
