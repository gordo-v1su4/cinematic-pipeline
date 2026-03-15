import httpx

from config import settings


class ComfyUIClient:
    def __init__(self):
        self.base_url = settings.COMFYUI_URL
        self.client = httpx.AsyncClient(timeout=30.0)

    async def queue_prompt(self, workflow: dict) -> dict:
        resp = await self.client.post(
            f"{self.base_url}/prompt", json={"prompt": workflow}
        )
        resp.raise_for_status()
        return resp.json()

    async def get_history(self, prompt_id: str) -> dict:
        resp = await self.client.get(f"{self.base_url}/history/{prompt_id}")
        resp.raise_for_status()
        return resp.json()

    async def close(self):
        await self.client.aclose()


comfyui = ComfyUIClient()
