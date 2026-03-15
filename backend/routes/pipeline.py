from robyn import SubRouter, Request

from clients.nocodb import db
from clients.n8n import n8n

pipeline_router = SubRouter(__file__, prefix="/api/pipeline")


@pipeline_router.post("/generate")
async def trigger_generation(request: Request):
    data = request.json()
    treatment_id = data.get("treatment_id")
    if not treatment_id:
        return {"error": "treatment_id required"}, 400

    treatment = await db.find_by_field("treatments", "treatment_id", treatment_id)
    if not treatment:
        return {"error": "Treatment not found"}, 404

    try:
        await db.update_record("treatments", treatment["id"], {"status": "generating"})
        result = await n8n.trigger_workflow("new-treatment", {"treatment_id": treatment_id})
        return {"message": "Generation started", "treatment_id": treatment_id, "webhook_response": result}, 202
    except Exception as e:
        return {"error": f"Failed to trigger workflow: {e}"}, 502


@pipeline_router.post("/evaluate")
async def trigger_evaluation(request: Request):
    data = request.json()
    treatment_id = data.get("treatment_id")
    if not treatment_id:
        return {"error": "treatment_id required"}, 400

    treatment = await db.find_by_field("treatments", "treatment_id", treatment_id)
    if not treatment:
        return {"error": "Treatment not found"}, 404

    try:
        await db.update_record("treatments", treatment["id"], {"status": "evaluating"})
        result = await n8n.trigger_workflow("evaluate-treatment", {"treatment_id": treatment_id})
        return {"message": "Evaluation started", "treatment_id": treatment_id, "webhook_response": result}, 202
    except Exception as e:
        return {"error": f"Failed to trigger evaluation: {e}"}, 502


@pipeline_router.post("/optimize/:shot_id")
async def trigger_optimizer(path_params):
    shot_id = path_params["shot_id"]
    shot = await db.find_by_field("shots", "shot_id", shot_id)
    if not shot:
        return {"error": "Shot not found"}, 404

    try:
        result = await n8n.trigger_workflow("optimize-shot", {"shot_id": shot_id})
        return {"message": "Optimizer started", "shot_id": shot_id, "webhook_response": result}, 202
    except Exception as e:
        return {"error": f"Failed to trigger optimizer: {e}"}, 502


@pipeline_router.post("/expand/:shot_id")
async def trigger_expander(path_params):
    shot_id = path_params["shot_id"]
    shot = await db.find_by_field("shots", "shot_id", shot_id)
    if not shot:
        return {"error": "Shot not found"}, 404

    try:
        result = await n8n.trigger_workflow("expand-shot", {"shot_id": shot_id})
        return {"message": "Expander started", "shot_id": shot_id, "webhook_response": result}, 202
    except Exception as e:
        return {"error": f"Failed to trigger expander: {e}"}, 502
