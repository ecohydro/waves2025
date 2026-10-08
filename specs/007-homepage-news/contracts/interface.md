# Interface contract

Visitors see available published news and can distinguish temporary loading failures from an empty collection.

- Published news returned by the CMS must not be discarded because an unprojected status field is absent.
- Retain the published-only query boundary and return status consistently with the declared news contract.
- Handle news and publication requests independently so one failure does not blank Home.
- Differentiate empty and unavailable states and keep archive links available.
- Use descriptive archive links and concise title links rather than whole abstracts as link names.

Existing URLs remain valid. Tests must exercise the public rendered behavior, including errors and empty states, rather than only checking implementation text.
