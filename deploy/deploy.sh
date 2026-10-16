#!/bin/bash
set -e
# اسکریپت دیپلوی روی سرور (اجرا توسط GitHub Actions از طریق SSH)
# فرض: روی سرور از قبل clone شده و ریموت git ست شده

cd "$(dirname "$0")/.."

echo "==> git pull"
git pull --ff-only

echo "==> docker compose build"
docker compose -f docker-compose-pro.yml build

echo "==> docker compose up -d"
docker compose -f docker-compose-pro.yml up -d --force-recreate

echo "==> healthcheck"
for i in $(seq 1 15); do
  if curl -fs http://localhost:3001 > /dev/null; then
    echo "✅ backoffice healthy"
    exit 0
  fi
  echo "waiting for backoffice to become healthy... ($i/15)"
  sleep 4
done

echo "❌ healthcheck failed"
docker compose -f docker-compose-pro.yml logs --tail=100
exit 1
