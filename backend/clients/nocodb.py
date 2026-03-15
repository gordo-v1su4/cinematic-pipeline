import httpx

from config import settings


class NocoDB:
    """NocoDB v3 API client."""

    def __init__(self):
        self.base_url = settings.NOCODB_BASE_URL
        self.base_id = settings.NOCODB_BASE_ID
        self.table_ids = settings.nocodb_table_ids
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "xc-token": settings.NOCODB_API_TOKEN,
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    def _require_base_id(self) -> str:
        if not self.base_id:
            raise ValueError("NOCODB_BASE_ID is not configured")
        return self.base_id

    def _records_url(self, table: str) -> str:
        table_id = self.table_ids.get(table)
        if not table_id:
            raise ValueError(f"Unknown table: {table}")
        return f"/api/v3/data/{self._require_base_id()}/{table_id}/records"

    def _count_url(self, table: str) -> str:
        table_id = self.table_ids.get(table)
        if not table_id:
            raise ValueError(f"Unknown table: {table}")
        return f"/api/v3/data/{self._require_base_id()}/{table_id}/count"

    async def list_records(
        self,
        table: str,
        where: str | None = None,
        page: int = 1,
        page_size: int = 25,
        sort: str | None = None,
    ) -> dict:
        """List records. Returns {"records": [...], "next": ..., "prev": ...}."""
        params: dict = {"page": page, "pageSize": page_size}
        if where:
            params["where"] = where
        if sort:
            params["sort"] = sort
        resp = await self.client.get(self._records_url(table), params=params)
        resp.raise_for_status()
        return resp.json()

    async def get_record(self, table: str, record_id: str | int) -> dict:
        """Get a single record by primary key. Returns {"id": ..., "fields": {...}}."""
        resp = await self.client.get(f"{self._records_url(table)}/{record_id}")
        resp.raise_for_status()
        return resp.json()

    async def find_by_field(self, table: str, field: str, value: str) -> dict | None:
        """Find first record matching field=value. Returns the record or None."""
        result = await self.list_records(
            table, where=f"({field},eq,{value})", page_size=1
        )
        records = result.get("records", [])
        return records[0] if records else None

    async def create_record(self, table: str, fields: dict) -> dict:
        """Create a record. Payload: {"fields": {...}}. Returns created record."""
        resp = await self.client.post(
            self._records_url(table), json={"fields": fields}
        )
        resp.raise_for_status()
        return resp.json()

    async def create_records(self, table: str, records: list[dict]) -> dict:
        """Bulk create. Payload: [{"fields": {...}}, ...]. Returns created records."""
        payload = [{"fields": r} for r in records]
        resp = await self.client.post(self._records_url(table), json=payload)
        resp.raise_for_status()
        return resp.json()

    async def update_record(self, table: str, record_id: str | int, fields: dict) -> dict:
        """Update a record. Payload: {"id": ..., "fields": {...}}."""
        resp = await self.client.patch(
            self._records_url(table),
            json={"id": record_id, "fields": fields},
        )
        resp.raise_for_status()
        return resp.json()

    async def delete_record(self, table: str, record_id: str | int) -> dict:
        """Delete a record by primary key."""
        resp = await self.client.request(
            "DELETE",
            self._records_url(table),
            json={"id": record_id},
        )
        resp.raise_for_status()
        return resp.json()

    async def count(self, table: str, where: str | None = None) -> int:
        """Get record count, optionally filtered."""
        params = {}
        if where:
            params["where"] = where
        resp = await self.client.get(self._count_url(table), params=params)
        resp.raise_for_status()
        return resp.json().get("count", 0)

    async def close(self):
        await self.client.aclose()


db = NocoDB()
