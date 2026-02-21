import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// Fix markdown links with angle brackets: [text](<url>) → [text](url)
function fixMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(<([^>]+)>\)/g, '[$1]($2)')
}

export function parseMarkdown(content: string): string {
  if (!content) return ''
  const fixed = fixMarkdownLinks(content)
  return md.render(fixed)
}
