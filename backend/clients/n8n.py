import httpx

from config import settings


class N8NClient:
    def __init__(self):
        self.base_url = settings.N8N_BASE_URL
        self.client = httpx.AsyncClient(timeout=15.0)

    async def trigger_workflow(self, webhook_path: str, data: dict) -> dict:
        url = f"{self.base_url}/webhook/{webhook_path}"
        resp = await self.client.post(url, json=data)
        resp.raise_for_status()
        if not resp.content:
            return {"status": resp.status_code, "webhook_path": webhook_path}
        try:
            return resp.json()
        except ValueError:
            return {
                "status": resp.status_code,
                "webhook_path": webhook_path,
                "body": resp.text,
            }

    async def close(self):
        await self.client.aclose()


n8n = N8NClient()
