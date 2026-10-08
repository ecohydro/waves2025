# Validation

1. Run the feature-specific Vitest file listed in plan.md. All service requests in unit tests are mocked.
2. Run `npm run dev -- --port 3100` and inspect changed routes with keyboard at desktop and mobile widths. Do not submit live forms.
3. Check labels, headings, focus, error/empty states, dark/light appearance, reduced motion, 200% zoom and 320px reflow as applicable.
4. Run `npm run lint`, `npm run type-check`, `npm run test:fast`, and `npm run build` for the batch.
5. Record actual results and remaining limits in validation.md; do not claim inbox delivery or full WCAG certification.
