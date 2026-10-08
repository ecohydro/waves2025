#!/usr/bin/env bash
#
# cleanup-sandbox-leftovers.sh
#
# Removes the files that the Cowork sandbox cannot delete itself. The sandbox
# mounts this repo with deletion turned off, so sessions that run here park
# unwanted files under _to_delete/ and rename git's own lock and temp files
# out of the way instead of removing them. This script finishes the job from a
# normal terminal.
#
# What it removes:
#   1. _to_delete/            the parking folder, whole subtree
#   2. .git/stale-*           git lock and temp-object files a sandbox session
#                             renamed (index.lock -> stale-index-lock-<ts>,
#                             objects/xx/tmp_obj_* -> stale-tmp-obj-*)
#   3. .git/index.lock and .git/objects/*/tmp_obj_*
#                             left by a git command that was killed before it
#                             could clean up; skipped while git is running
#   4. .fuse_hidden*          FUSE placeholders for files deleted while open
#                             (outside node_modules and .git)
#
# Usage:
#   scripts/cleanup-sandbox-leftovers.sh            # list what would go
#   scripts/cleanup-sandbox-leftovers.sh --apply    # delete it
#   npm run cleanup                                 # same as the dry run
#   npm run cleanup -- --apply
#
# Run it from a real terminal on the machine that holds the checkout. From
# inside the sandbox it will only report "Operation not permitted".

set -euo pipefail

APPLY=0
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    -h|--help) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$ROOT" ]; then ROOT="$(cd "$(dirname "$0")/.." && pwd)"; fi
cd "$ROOT"

targets=()
skipped=()

# 1. The parking folder.
if [ -d _to_delete ]; then
  targets+=("_to_delete")
fi

# 2. Lock and temp files a sandbox session already renamed.
while IFS= read -r f; do targets+=("$f"); done < <(find .git -maxdepth 1 -name 'stale-*' 2>/dev/null)

# 3. Live git lock and temp-object files. Only safe when no git is running:
#    a lock held by a real git process must not be pulled out from under it.
git_running=0
if pgrep -x git >/dev/null 2>&1; then git_running=1; fi
while IFS= read -r f; do
  if [ "$git_running" -eq 1 ]; then skipped+=("$f (git is running)"); else targets+=("$f"); fi
done < <(find .git -maxdepth 1 -name '*.lock' 2>/dev/null; find .git/objects -mindepth 2 -maxdepth 2 -name 'tmp_obj_*' 2>/dev/null)

# 4. FUSE placeholders.
while IFS= read -r f; do targets+=("$f"); done < <(find . \( -path ./node_modules -o -path ./.git \) -prune -o -name '.fuse_hidden*' -print 2>/dev/null)

if [ "${#targets[@]}" -eq 0 ] && [ "${#skipped[@]}" -eq 0 ]; then
  echo "Nothing to clean up."
  exit 0
fi

if [ "${#targets[@]}" -gt 0 ]; then
  if [ "$APPLY" -eq 1 ]; then echo "Removing:"; else echo "Would remove (dry run; pass --apply to delete):"; fi
  for t in "${targets[@]}"; do
    if [ -d "$t" ]; then
      n=$(find "$t" -type f | wc -l | tr -d ' ')
      echo "  $t/  ($n files)"
    else
      echo "  $t"
    fi
  done
fi

if [ "${#skipped[@]}" -gt 0 ]; then
  echo "Skipped:"
  for s in "${skipped[@]}"; do echo "  $s"; done
fi

if [ "$APPLY" -eq 1 ]; then
  failed=0
  for t in "${targets[@]}"; do
    if ! rm -rf -- "$t" 2>/dev/null; then
      echo "  could not remove $t" >&2
      failed=1
    fi
  done
  if [ "$failed" -eq 1 ]; then
    echo "Some files could not be removed. If this ran inside the Cowork sandbox, run it from a terminal instead." >&2
    exit 1
  fi
  echo "Done."
fi
