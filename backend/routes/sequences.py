from robyn import SubRouter, Request

from clients.nocodb import db

sequences_router = SubRouter(__file__, prefix="/api/sequences")


@sequences_router.get("/")
async def list_sequences(query_params):
    filters = []
    if treatment_id := query_params.get("treatment_id"):
        filters.append(f"(treatment_id,eq,{treatment_id})")
    if sequence_pass := query_params.get("sequence_pass"):
        filters.append(f"(sequence_pass,eq,{sequence_pass})")
    page = int(query_params.get("page", "1"))
    page_size = int(query_params.get("pageSize", "25"))
    where = "~and".join(filters) if filters else None
    try:
        result = await db.list_records(
            "sequences", where=where, page=page, page_size=page_size,
            sort='[{"direction":"desc","field":"evaluated_at"}]',
        )
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@sequences_router.get("/:id")
async def get_sequence(path_params):
    record = await db.find_by_field("sequences", "sequence_id", path_params["id"])
    if not record:
        return {"error": "Sequence not found"}, 404
    return record


@sequences_router.post("/")
async def create_sequence(request: Request):
    data = request.json()
    try:
        result = await db.create_record("sequences", data)
        return result, 201
    except Exception as e:
        return {"error": str(e)}, 502


@sequences_router.patch("/:id")
async def update_sequence(request: Request, path_params):
    record = await db.find_by_field("sequences", "sequence_id", path_params["id"])
    if not record:
        return {"error": "Sequence not found"}, 404
    data = request.json()
    try:
        result = await db.update_record("sequences", record["id"], data)
        return result
    except Exception as e:
        return {"error": str(e)}, 502


@sequences_router.delete("/:id")
async def delete_sequence(path_params):
    record = await db.find_by_field("sequences", "sequence_id", path_params["id"])
    if not record:
        return {"error": "Sequence not found"}, 404
    try:
        result = await db.delete_record("sequences", record["id"])
        return result
    except Exception as e:
        return {"error": str(e)}, 502
