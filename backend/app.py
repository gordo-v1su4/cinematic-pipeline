import os

from robyn import Robyn, ALLOW_CORS

from config import settings
from clients.nocodb import db
from routes.health import health_router
from routes.treatments import treatments_router
from routes.shots import shots_router
from routes.sequences import sequences_router
from routes.pipeline import pipeline_router

app = Robyn(__file__)

ALLOW_CORS(
    app,
    origins=[
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
)

# Mount routers
app.include_router(health_router)
app.include_router(treatments_router)
app.include_router(shots_router)
app.include_router(sequences_router)
app.include_router(pipeline_router)

# Serve generated images as static files
outputs_dir = os.path.abspath(settings.OUTPUTS_DIR)
os.makedirs(outputs_dir, exist_ok=True)
app.serve_directory(
    route="/static/outputs",
    directory_path=outputs_dir,
)


@app.shutdown_handler
async def shutdown():
    await db.close()


if __name__ == "__main__":
    app.start(host=settings.HOST, port=settings.PORT)
