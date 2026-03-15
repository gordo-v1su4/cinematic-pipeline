from robyn import SubRouter, Request

from clients.nocodb import db

shots_router = SubRouter(__file__, prefix="/api/shots")


@shots_router.get("/")
async def list_shots(query_params):
    filters = []
    if treatment_id := query_params.get("treatment_id"):
        filters.append(f"(treatment_id,eq,{treatment_id})")
    if routing := query_params.get("routing"):
        filters.append(f"(routing,eq,{routing})")
    page = int(query_params.get("page", "1"))
    page_size = int(query_params.get("pageSize", "25"))
    where = "~and".join(filters) if filters else None
    try:
        result = await db.list_records(
            "shots", where=where, page=page, page_size=page_size,
            sort='[{"direction":"asc","field":"shot_number"}]',
        )
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@shots_router.get("/failing")
async def list_failing_shots(query_params):
    page = int(query_params.get("page", "1"))
    page_size = int(query_params.get("pageSize", "25"))
    where = "(routing,neq,approved)"
    try:
        result = await db.list_records(
            "shots", where=where, page=page, page_size=page_size,
            sort='[{"direction":"desc","field":"generated_at"}]',
        )
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@shots_router.get("/:id")
async def get_shot(path_params):
    record = await db.find_by_field("shots", "shot_id", path_params["id"])
    if not record:
        return {"error": "Shot not found"}, 404
    return record


@shots_router.post("/")
async def create_shot(request: Request):
    data = request.json()
    try:
        result = await db.create_record("shots", data)
        return result, 201
    except Exception as e:
        return {"error": str(e)}, 502


@shots_router.patch("/:id")
async def update_shot(request: Request, path_params):
    record = await db.find_by_field("shots", "shot_id", path_params["id"])
    if not record:
        return {"error": "Shot not found"}, 404
    data = request.json()
    try:
        result = await db.update_record("shots", record["id"], data)
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@shots_router.delete("/:id")
async def delete_shot(path_params):
    record = await db.find_by_field("shots", "shot_id", path_params["id"])
    if not record:
        return {"error": "Shot not found"}, 404
    try:
        result = await db.delete_record("shots", record["id"])
        return result
    except Exception as e:
        return {"error": str(e)}, 502
