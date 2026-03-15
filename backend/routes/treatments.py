import json
import os

from robyn import SubRouter, Request

from clients.nocodb import db
from config import settings

treatments_router = SubRouter(__file__, prefix="/api/treatments")


@treatments_router.get("/")
async def list_treatments(query_params):
    status = query_params.get("status")
    page = int(query_params.get("page", "1"))
    page_size = int(query_params.get("pageSize", "25"))
    where = f"(status,eq,{status})" if status else None
    try:
        result = await db.list_records(
            "treatments", where=where, page=page, page_size=page_size,
            sort='[{"direction":"desc","field":"created_at"}]',
        )
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@treatments_router.get("/:id")
async def get_treatment(path_params):
    record = await db.find_by_field("treatments", "treatment_id", path_params["id"])
    if not record:
        return {"error": "Treatment not found"}, 404
    return record


@treatments_router.post("/")
async def create_treatment(request: Request):
    data = request.json()
    try:
        result = await db.create_record("treatments", data)
        return result, 201
    except Exception as e:
        return {"error": str(e)}, 502


@treatments_router.patch("/:id")
async def update_treatment(request: Request, path_params):
    record = await db.find_by_field("treatments", "treatment_id", path_params["id"])
    if not record:
        return {"error": "Treatment not found"}, 404
    data = request.json()
    try:
        result = await db.update_record("treatments", record["id"], data)
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@treatments_router.delete("/:id")
async def delete_treatment(path_params):
    record = await db.find_by_field("treatments", "treatment_id", path_params["id"])
    if not record:
        return {"error": "Treatment not found"}, 404
    try:
        result = await db.delete_record("treatments", record["id"])
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@treatments_router.get("/:id/shots")
async def get_treatment_shots(path_params):
    try:
        result = await db.list_records(
            "shots",
            where=f"(treatment_id,eq,{path_params['id']})",
            page_size=9,
            sort='[{"direction":"asc","field":"shot_number"}]',
        )
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@treatments_router.get("/:id/sequences")
async def get_treatment_sequences(path_params):
    try:
        result = await db.list_records(
            "sequences",
            where=f"(treatment_id,eq,{path_params['id']})",
            sort='[{"direction":"desc","field":"evaluated_at"}]',
        )
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@treatments_router.get("/:id/json")
async def get_treatment_json(path_params):
    treatment_id = path_params["id"]
    json_path = os.path.join(settings.TREATMENTS_DIR, f"{treatment_id}.json")
    if not os.path.isfile(json_path):
        return {"error": "Treatment JSON file not found"}, 404
    with open(json_path, "r") as f:
        data = json.load(f)
    return data


@treatments_router.get("/:id/prompts")
async def get_treatment_prompts(path_params):
    treatment_id = path_params["id"]
    prompts_path = os.path.join(settings.TREATMENTS_DIR, f"{treatment_id}_prompts.json")
    if not os.path.isfile(prompts_path):
        return {"error": "Prompts JSON file not found"}, 404
    with open(prompts_path, "r") as f:
        data = json.load(f)
    return data
