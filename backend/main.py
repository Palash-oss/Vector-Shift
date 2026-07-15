from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI()

# Enable CORS for frontend React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
        "http://localhost:3004",
        "http://127.0.0.1:3004",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Request body
class NodeModel(BaseModel):
    id: str
    type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class EdgeModel(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class PipelinePayload(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]

def detect_cycle(nodes: List[NodeModel], edges: List[EdgeModel]) -> bool:
    # Build graph adjacency list
    adj = {node.id: [] for node in nodes}
    
    # Track all seen nodes (to avoid KeyError on invalid edge definitions)
    for edge in edges:
        if edge.source not in adj:
            adj[edge.source] = []
        if edge.target not in adj:
            adj[edge.target] = []
        adj[edge.source].append(edge.target)

    # Cycle detection state: 0 = unvisited, 1 = visiting, 2 = visited
    visited = {node_id: 0 for node_id in adj.keys()}

    def dfs(u: str) -> bool:
        visited[u] = 1  # visiting (in recursion stack)
        
        for v in adj[u]:
            if visited[v] == 1:
                return True  # Cycle detected
            elif visited[v] == 0:
                if dfs(v):
                    return True
                    
        visited[u] = 2  # visited (fully processed)
        return False

    # Run DFS from every unvisited node
    for node_id in adj.keys():
        if visited[node_id] == 0:
            if dfs(node_id):
                return True  # Has cycle

    return False  # No cycle

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(payload: PipelinePayload):
    num_nodes = len(payload.nodes)
    num_edges = len(payload.edges)
    
    # is_dag is True if and only if there is NO cycle
    is_dag = not detect_cycle(payload.nodes, payload.edges)
    
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag
    }
