#!/usr/bin/env bash
set -e
if [[ ! -d dist ]];then
   echo "no dist, run build first: npm run build" >&2
   exit 1
fi

# force kill port
kill-port 7204 >&/dev/null || true

nohup npx http-server --port 7204 dist 1>>/tmp/t.zero.log 2>&1 &

# help vscode open port mapping:
#     Your application running on port 7204 is available. See all forwarded ports
cat <<'EOF'
Available on:
  http://127.0.0.1:7204
  http://10.12.208.244:7204
EOF