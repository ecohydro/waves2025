# Files Directory Structure

This directory contains downloadable files migrated from the legacy Jekyll site.

## Directory Structure

```
public/files/
├── cv/              # Curriculum vitae files
├── publications/    # PDF reprints and supplementary materials
└── presentations/   # Presentation slides and materials
```

## File Types

### CV Files (`cv/`)

- **Format**: PDF files
- **Naming**: `[lastname]_cv.pdf` (e.g., `caylor_cv.pdf`)
- **Source**: `legacy/assets/files/` directory
- **Usage**: Linked from people profile pages

### Publication Files (`publications/`)

- **Format**: PDF files, supplementary materials
- **Naming**: `[author][year]_[id].pdf` or descriptive names
- **Source**: `legacy/assets/files/` directory
- **Usage**: Linked from publication detail pages

### Presentation Files (`presentations/`)

- **Format**: PDF, PPTX, or other presentation formats
- **Naming**: Descriptive names with dates
- **Source**: `legacy/assets/files/` directory
- **Usage**: Linked from relevant content pages

## Migration Process

1. Copy files from `legacy/assets/files/` to appropriate subdirectories
2. Organize by file type and content
3. Update file paths in migrated content
4. Ensure proper file permissions and accessibility
5. Add metadata for file downloads

## File Management

- **Size Limits**: Consider file size for web delivery
- **Accessibility**: Ensure files are accessible and properly labeled
- **Backup**: Maintain backup copies of original files
- **Updates**: Establish process for updating files when needed

## Security Considerations

- Validate file types before upload
- Scan files for malware
- Implement proper access controls
- Monitor file downloads for analytics
