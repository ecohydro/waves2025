#!/bin/bash

# Kill all processes using ports 3000-3009
for port in {3000..3009}; do
  pid=$(lsof -ti tcp:$port)
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid
  fi
done

# Wait a moment to ensure ports are freed
sleep 2

# Start the Next.js dev server on port 3000
# Use --port 3000 if supported, else set PORT env var
if npx next dev --help | grep -q -- --port; then
  echo "Starting Next.js dev server on port 3000 with --port flag"
  npx next dev --port 3000
else
  echo "Starting Next.js dev server on port 3000 with PORT env var"
  PORT=3000 npx next dev
fi 