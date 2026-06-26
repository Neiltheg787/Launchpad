# Launchpad AgentBox Submission

## Agent Listing

Name: Launchpad

Internal project name: launchpad

Short description:
Launchpad is an AI founder agent that turns a raw startup idea into a validation report, market map, MVP blueprint, pitch deck outline, and fundraising strategy.

Long description:
Launchpad helps founders decide whether an idea is worth building. A user enters a plain-English startup idea, and Launchpad runs a multi-agent validation workflow: Scout analyzes market collision and demand, Atlas sizes the market, Forge creates a technical MVP blueprint, Deck drafts an investor pitch structure, and Connect maps fundraising readiness. The app returns a structured dashboard with scores, risks, differentiated angles, build plan, and go-to-market recommendations.

## Infrastructure

Deployment path: GMI CE Deployment

Docker image source:
`<replace-with-your-registry-url>/launchpad:latest`

Compute tier: Standard - 2 vCPU, 4 GB RAM, 10 GiB ephemeral storage, 30 GiB data storage

Region: US West

MaaS integration: On

Model:
`deepseek-ai/DeepSeek-V4-Pro`

## Networking

Protocol: HTTPS/2

Listening port: 443

Internal port: 8080

Health check:
`GET /health`

Main app:
`GET /`

Generate report:
`POST /api/reports/generate`

Example body:
```json
{
  "idea": "An AI tutor for high-schoolers learning calculus, one problem at a time."
}
```

## Environment Variables

Plain values:

```env
GMI_MAAS_BASE_URL=https://api.gmi-serving.com
GMI_MODELS=deepseek-ai/DeepSeek-V4-Pro
FAST_PIPELINE=false
```

Secrets:

```env
GMI_MAAS_API_KEY=(injected by GMI MaaS)
```

Optional secrets if you want deeper live integrations:

```env
SERPER_API_KEY=
PEXELS_API_KEY=
GITHUB_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Build And Push

Replace `YOUR_DOCKERHUB_USER` with your registry namespace.

```bash
cd /Users/neilshah/Documents/Codex/2026-06-26/launchpad/work/launchpad
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USER/launchpad:latest .
docker push YOUR_DOCKERHUB_USER/launchpad:latest
```

Registry URL to paste into AgentBox:

```txt
registry.hub.docker.com/YOUR_DOCKERHUB_USER/launchpad:latest
```

## Smoke Test Locally

```bash
docker run --platform linux/amd64 --rm -p 8080:8080 \
  -e PORT=8080 \
  -e GMI_MAAS_BASE_URL=https://api.gmi-serving.com \
  -e GMI_MODELS=deepseek-ai/DeepSeek-V4-Pro \
  -e GMI_MAAS_API_KEY="$GMI_MAAS_API_KEY" \
  YOUR_DOCKERHUB_USER/launchpad:latest
```

Then test:

```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/reports/generate \
  -H 'Content-Type: application/json' \
  --data '{"idea":"An AI tutor for high-schoolers learning calculus, one problem at a time."}'
```
