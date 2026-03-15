# NOCODB_MCP.md
## NocoDB MCP Server — Cinematic Pipeline

The NocoDB MCP server allows AI agents to query and mutate pipeline data
(treatments, shots, sequences) directly via Model Context Protocol.
Use when logging evaluations, routing decisions, or querying scoring history.

---

## INSTANCE

| Property | Value |
|---|---|
| Base URL | https://nocodb.v1su4.dev |
| MCP endpoint | https://nocodb.v1su4.dev/mcp/nc6qdr2naw76ymg1 |
| Auth | `xc-mcp-token` header |

See [NOCODB_SCHEMA.md](./NOCODB_SCHEMA.md) for table schemas and API patterns.

---

## CURSOR CONFIGURATION

Add this to your Cursor MCP config.

**User-level** (affects all projects):  
`~/.cursor/mcp.json`

**Project-level** (this workspace only):  
`.cursor/mcp.json`

```json
{
  "mcpServers": {
    "NocoDB Base - Cinematic Pipeline": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://nocodb.v1su4.dev/mcp/nc6qdr2naw76ymg1",
        "--header",
        "xc-mcp-token: <YOUR_TOKEN>"
      ]
    }
  }
}
```

Replace `<YOUR_TOKEN>` with your MCP token from NocoDB:
NocoDB → base → MCP / Integrations → copy token.

---

## SECURITY

- **Do not commit** the MCP token. `.cursor/` is gitignored for this reason.
- Store the real token in your local `.cursor/mcp.json` or in Cursor’s MCP settings.
- Rotate the token if it is ever exposed.

---

## USAGE BY AGENTS

| Agent | Use case |
|---|---|
| Judge | Log shot scores, sequence scores, routing decisions |
| Optimizer | Update shot records after revision cycles |
| Expander | Update shot records after expansion |
| Director | Log new treatment metadata |
| Any | Query treatments/shots by status, routing, or score |

---

## DEPENDENCIES

Requires `npx` and `mcp-remote`. If missing:

```bash
bunx mcp-remote --help   # verify mcp-remote is available
```

The `mcp-remote` package is used to connect to NocoDB’s hosted MCP endpoint.
