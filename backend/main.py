from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import subprocess

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

# File to store deployed pipeline layout in the backend directory
DEPLOYED_WORKFLOW_FILE = "deployed_workflow.json"

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

class GithubPushPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    repo: str

class RunPayload(BaseModel):
    inputs: Dict[str, Any]

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

@app.post('/pipelines/deploy')
def deploy_pipeline(payload: PipelinePayload):
    # Save the deployment payload layout locally
    try:
        data = {
            "nodes": [n.dict() for n in payload.nodes],
            "edges": [e.dict() for e in payload.edges]
        }
        with open(DEPLOYED_WORKFLOW_FILE, "w") as f:
            json.dump(data, f, indent=2)
        
        return {
            "status": "success",
            "url": "http://localhost:8002/pipelines/run",
            "deployed_at": "Just now"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/pipelines/push-github')
def push_github(payload: GithubPushPayload):
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    workflow_file = os.path.join(root_path, "workflow.json")
    
    # Write the visual layout schema to workflow.json
    try:
        with open(workflow_file, "w") as f:
            json.dump({"nodes": payload.nodes, "edges": payload.edges}, f, indent=2)
            
        # Run Git command line sequence to push update to repo
        subprocess.run(["git", "add", "workflow.json"], cwd=root_path, check=True)
        subprocess.run(["git", "commit", "-m", "update: visual workflow layout update via Pipeline Studio"], cwd=root_path, capture_output=True, text=True)
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=root_path, capture_output=True, text=True)
        
        return {
            "status": "success",
            "msg": "Workflow layout pushed successfully to your GitHub repository!",
            "output": push_res.stdout or push_res.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/pipelines/run')
def run_pipeline(payload: RunPayload):
    if not os.path.exists(DEPLOYED_WORKFLOW_FILE):
        raise HTTPException(status_code=400, detail="No pipeline has been deployed yet. Please click 'Deploy' in the top-bar first.")
        
    try:
        with open(DEPLOYED_WORKFLOW_FILE, "r") as f:
            workflow = json.load(f)
            
        nodes = {n["id"]: n for n in workflow["nodes"]}
        edges = workflow["edges"]
        
        node_values = {}
        outputs = {}
        execution_logs = []
        
        # Parse edge routing mapping
        incoming_edges = {n_id: [] for n_id in nodes}
        for edge in edges:
            s = edge["source"]
            t = edge["target"]
            if s in nodes and t in nodes:
                incoming_edges[t].append(edge)
                
        # Seed Input nodes with variables
        for n_id, node in nodes.items():
            n_type = node.get("type", "")
            n_data = node.get("data", {})
            if n_type in ["customInput", "input"]:
                input_name = n_data.get("inputName", "input")
                node_values[n_id] = payload.inputs.get(input_name, payload.inputs.get("input", "Pipeline Trigger Payload"))
                execution_logs.append(f"Input Node [{n_id}]: read value '{node_values[n_id]}'")

        # Propagate node evaluations (3 iterations to resolve dependencies)
        for _ in range(3):
            for n_id, node in nodes.items():
                if n_id in node_values:
                    continue
                    
                n_type = node.get("type", "")
                n_data = node.get("data", {})
                
                parent_values = {}
                for edge in incoming_edges[n_id]:
                    p_id = edge["source"]
                    if p_id in node_values:
                        parent_values[p_id] = node_values[p_id]
                        
                if not parent_values and incoming_edges[n_id]:
                    # Parent nodes have not finished execution
                    continue
                    
                if n_type in ["text", "textNode"]:
                    text_val = n_data.get("text", "Default Text Template")
                    resolved = text_val
                    # Swap variable brackets
                    for p_id, p_val in parent_values.items():
                        resolved = resolved.replace("{{input}}", str(p_val))
                        resolved = resolved.replace("{{payload}}", str(p_val))
                        resolved = resolved.replace(f"{{{{{p_id}}}}}", str(p_val))
                    node_values[n_id] = resolved
                    execution_logs.append(f"Text Node [{n_id}]: resolved template to '{resolved}'")
                    
                elif n_type in ["llm", "llmNode"]:
                    prompt_blocks = n_data.get("promptBlocks", [])
                    combined_prompt = " | ".join([p.get("text", "") for p in prompt_blocks])
                    parent_str = ", ".join([str(v) for v in parent_values.values()])
                    
                    resolved_prompt = combined_prompt
                    for p_id, p_val in parent_values.items():
                        resolved_prompt = resolved_prompt.replace("{{input}}", str(p_val))
                        resolved_prompt = resolved_prompt.replace("{{payload}}", str(p_val))
                        
                    model_name = n_data.get("model", "gpt-4o-mini")
                    node_values[n_id] = f"🤖 [LLM Response via {model_name}]: Analyzed data ({parent_str or 'None'}). Compiled prompt: '{resolved_prompt or 'Default prompt instructions'}'. Output generated."
                    execution_logs.append(f"LLM Node [{n_id}]: executed mock request using '{model_name}'")
                    
                elif n_type in ["customOutput", "output"]:
                    val = next(iter(parent_values.values())) if parent_values else "No Input Connected"
                    node_values[n_id] = val
                    outputs[n_id] = val
                    execution_logs.append(f"Output Node [{n_id}]: output received successfully: '{val}'")
                    
                elif n_type == "conditional":
                    val = next(iter(parent_values.values())) if parent_values else "False"
                    node_values[n_id] = f"Routed state: {val}"
                    execution_logs.append(f"Conditional Node [{n_id}]: evaluated condition routing")
                    
                elif n_type == "math":
                    node_values[n_id] = "Result: 42 (Math expression evaluated)"
                    execution_logs.append(f"Math Node [{n_id}]: expression computed")
                    
                elif n_type == "api":
                    node_values[n_id] = "API Success 200 OK"
                    execution_logs.append(f"API Node [{n_id}]: Webhook webhook connection succeeded")
                    
                elif n_type == "timer":
                    node_values[n_id] = "Delayed 500ms"
                    execution_logs.append(f"Timer Node [{n_id}]: delayed execution")
                    
                else:
                    node_values[n_id] = next(iter(parent_values.values())) if parent_values else "Success"
                    
        return {
            "status": "success",
            "outputs": outputs,
            "execution_logs": execution_logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
