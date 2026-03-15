from robyn import SubRouter

from config import settings

health_router = SubRouter(__file__, prefix="/api")


@health_router.get("/health", const=True)
def health_check():
    return {"status": "ok", "service": "cinematic-pipeline-backend"}


@health_router.get("/status")
async def service_status():
    import httpx

    statuses = {}

    # Check NocoDB
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.NOCODB_BASE_URL}/api/v1/health",
                headers={"xc-token": settings.NOCODB_API_TOKEN},
            )
            statuses["nocodb"] = "ok" if resp.status_code == 200 else f"error ({resp.status_code})"
    except Exception as e:
        statuses["nocodb"] = f"unreachable ({e.__class__.__name__})"

    # Check ComfyUI
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.COMFYUI_URL}/system_stats")
            statuses["comfyui"] = "ok" if resp.status_code == 200 else f"error ({resp.status_code})"
    except Exception:
        statuses["comfyui"] = "unreachable"

    # Check Ollama
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            statuses["ollama"] = "ok" if resp.status_code == 200 else f"error ({resp.status_code})"
    except Exception:
        statuses["ollama"] = "unreachable"

    all_ok = all(v == "ok" for v in statuses.values())
    return {"status": "ok" if all_ok else "degraded", "services": statuses}
