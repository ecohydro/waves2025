# Interface contract

Readers can combine author, theme, and publication-type filters and discover deliberately featured research.

- Use single semantic links for URL filters, expose selected state, and preserve compatible filter parameters.
- Provide visible active-filter context, reset navigation, and a helpful zero-results state.
- Feature CMS-selected records instead of using a citation threshold; do not invent editorial rationales.
- Keep chronological results and publication-type distinctions; handle preprints distinctly from peer-reviewed papers.
- Use logical heading levels for publication years and nested titles; link research-theme titles to publication records.

Existing URLs remain valid. Tests must exercise the public rendered behavior, including errors and empty states, rather than only checking implementation text.
