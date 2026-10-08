# Interface

GET /news/archive?category=<encoded stored category> returns matching dated stories, active category text, result count, and All lab news link. GET /news/archive remains the complete archive. Unknown categories return an empty state with reset; query failure states that news could not load.
