# Interface contract

Visitors can reach Research, Join the Lab, and every mobile link using keyboard and assistive technology.

- Navigation must expose expanded state, use ordinary links, and never hide focusable content from assistive technology.
- Use an inline disclosure rather than a modal so normal Tab order reaches page content; Escape closes and restores focus.
- Do not move focus on initial render; close on route change and desktop breakpoint transition.
- Keep the header visible and allow the brand and navigation to reflow at 320 CSS pixels.
- Retain all existing routes; label the recruiting route Join the Lab and expose Research as a primary destination.

Existing URLs remain valid. Tests must exercise the public rendered behavior, including errors and empty states, rather than only checking implementation text.
