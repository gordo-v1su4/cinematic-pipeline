# n8n Starter Workflows

These workflow exports are the first working bridge between the backend API and the self-hosted n8n instance.

They are intentionally scoped as starter workflows:

- `new-treatment` is the most complete. It fetches treatment + prompts JSON from the backend, ensures the treatment exists in NocoDB, and bulk-creates shot rows if they do not exist yet.
- `evaluate-treatment`, `optimize-shot`, and `expand-shot` are scaffold workflows. They validate inputs and fetch the right records so the backend webhook calls have a real target, but they still need the model-specific generation/judging logic filled in.

## Import

1. Open n8n.
2. Import each JSON file from `n8n/workflows/`.
3. Set the workflow webhook path exactly as exported.
4. Add the required n8n environment variables.

## Required n8n env vars

- `BACKEND_BASE_URL`
- `NOCODB_BASE_URL`
- `NOCODB_BASE_ID`
- `NOCODB_API_TOKEN`
- `NOCODB_TREATMENTS_TABLE_ID`
- `NOCODB_SHOTS_TABLE_ID`
- `NOCODB_SEQUENCES_TABLE_ID`
- `COMFYUI_URL`
- `OLLAMA_URL`
- `ANTHROPIC_API_KEY`

## Backend Contract

These workflows are designed to match the backend webhook client:

- `POST /webhook/new-treatment`
- `POST /webhook/evaluate-treatment`
- `POST /webhook/optimize-shot`
- `POST /webhook/expand-shot`

Those are called from [pipeline.py](/Users/Gordo/Documents/Github/cinematic-pipeline/backend/routes/pipeline.py).

## Notes

- The workflows use Code nodes heavily to keep import/setup simpler.
- The backend now exposes both treatment JSON and prompts JSON:
  - `GET /api/treatments/:id/json`
  - `GET /api/treatments/:id/prompts`
- The grid helper script lives at [assemble_grid.py](/Users/Gordo/Documents/Github/cinematic-pipeline/scripts/assemble_grid.py).
