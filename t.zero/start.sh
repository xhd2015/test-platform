#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

cd "$DIR"

if [[ -f start.lock ]];then
    echo "annother process is running:$(cat start.lock)" >&2
    exit 1
fi

rm -rf start.lock
echo $$ > start.lock

cleanup() {
    rm -rf start.lock
}
trap cleanup EXIT

bash start-daemon.sh