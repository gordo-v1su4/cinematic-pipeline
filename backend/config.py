import os


class Settings:
    # Server
    PORT = int(os.getenv("BACKEND_PORT", "8080"))
    HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # NocoDB
    NOCODB_BASE_URL = os.getenv("NOCODB_BASE_URL", "https://nocodb.v1su4.dev")
    NOCODB_BASE_ID = os.getenv("NOCODB_BASE_ID", "")
    NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN", "")
    NOCODB_TREATMENTS_TABLE_ID = os.getenv("NOCODB_TREATMENTS_TABLE_ID", "")
    NOCODB_SHOTS_TABLE_ID = os.getenv("NOCODB_SHOTS_TABLE_ID", "")
    NOCODB_SEQUENCES_TABLE_ID = os.getenv("NOCODB_SEQUENCES_TABLE_ID", "")

    # External services
    COMFYUI_URL = os.getenv("COMFYUI_URL", "http://localhost:8188")
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    N8N_BASE_URL = os.getenv("N8N_BASE_URL", "https://n8n.v1su4.dev")

    # Paths
    OUTPUTS_DIR = os.getenv("OUTPUTS_DIR", "/app/outputs")
    TREATMENTS_DIR = os.getenv("TREATMENTS_DIR", "/app/treatments")

    @property
    def nocodb_table_ids(self):
        return {
            "treatments": self.NOCODB_TREATMENTS_TABLE_ID,
            "shots": self.NOCODB_SHOTS_TABLE_ID,
            "sequences": self.NOCODB_SEQUENCES_TABLE_ID,
        }


settings = Settings()
