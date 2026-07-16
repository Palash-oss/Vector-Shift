import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
} from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 250, y: 50 }, data: { id: 'customInput-1', nodeType: 'customInput', customTitle: 'Input Trigger' } },
      { id: 'llm-1', type: 'llm', position: { x: 250, y: 230 }, data: { id: 'llm-1', nodeType: 'llm', customTitle: 'LLM Reasoner' } },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 250, y: 410 }, data: { id: 'customOutput-1', nodeType: 'customOutput', customTitle: 'Output Responder' } }
    ],
    edges: [
      { id: 'edge-customInput-1-llm-1', source: 'customInput-1', target: 'llm-1', type: 'smoothstep', animated: true },
      { id: 'edge-llm-1-customOutput-1', source: 'llm-1', target: 'customOutput-1', type: 'smoothstep', animated: true }
    ],
    nodeIDs: {
      customInput: 1,
      llm: 1,
      customOutput: 1,
      note: 0
    },
    activeNodeId: null,
    nodeStatuses: {}, // { [nodeId]: 'untouched' | 'success' | 'error' }

    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },

    setActiveNodeId: (nodeId) => {
        set({ activeNodeId: nodeId });
    },

    setNodeStatus: (nodeId, status) => {
        set({
            nodeStatuses: {
                ...get().nodeStatuses,
                [nodeId]: status
            }
        });
    },

    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },

    deleteNode: (nodeId) => {
        set({
            nodes: get().nodes.filter(n => n.id !== nodeId),
            edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
            activeNodeId: get().activeNodeId === nodeId ? null : get().activeNodeId,
        });
    },

    onNodesChange: (changes) => {
      const currentNodes = applyNodeChanges(changes, get().nodes);
      const remainingNodeIds = new Set(currentNodes.map(n => n.id));
      const currentEdges = get().edges.filter(
        e => remainingNodeIds.has(e.source) && remainingNodeIds.has(e.target)
      );
      set({
        nodes: currentNodes,
        edges: currentEdges,
      });
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onConnect: (connection) => {
      const edges = get().edges;
      const norm = (v) => v ?? 'default';
      const sourceHandle = norm(connection.sourceHandle);
      const targetHandle = norm(connection.targetHandle);

      const duplicate = edges.find(
        e =>
          e.source === connection.source &&
          e.target === connection.target &&
          norm(e.sourceHandle) === sourceHandle &&
          norm(e.targetHandle) === targetHandle
      );
      if (duplicate) return;

      const edgeId = `edge-${connection.source}-${sourceHandle}-${connection.target}-${targetHandle}`;

      set({
        edges: addEdge({
          ...connection, 
          id: edgeId,
          type: 'smoothstep', 
          animated: true, 
          markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}
        }, edges),
      });
    },

    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
          return node;
        }),
      });
    },

    insertNodeOnEdge: (nodeType, edgeId) => {
      const { nodes, edges, getNodeID } = get();
      const edgeIndex = edges.findIndex(e => e.id === edgeId);
      if (edgeIndex === -1) return;
      const edge = edges[edgeIndex];

      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      let position = { x: 250, y: 250 };
      if (sourceNode && targetNode) {
        position = {
          x: (sourceNode.position.x + targetNode.position.x) / 2,
          y: (sourceNode.position.y + targetNode.position.y) / 2,
        };
      } else if (sourceNode) {
        position = { x: sourceNode.position.x, y: sourceNode.position.y + 120 };
      }

      const newNodeId = getNodeID(nodeType);
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position,
        data: { id: newNodeId, nodeType },
      };

      const newEdge1 = {
        id: `edge-${edge.source}-${newNodeId}`,
        source: edge.source,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
      };
      const newEdge2 = {
        id: `edge-${newNodeId}-${edge.target}`,
        source: newNodeId,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
      };

      const updatedEdges = [...edges];
      updatedEdges.splice(edgeIndex, 1);
      updatedEdges.push(newEdge1, newEdge2);

      set({
        nodes: [...nodes, newNode],
        edges: updatedEdges,
        activeNodeId: newNodeId,
      });
    },

    insertNodeAtChainEnd: (nodeType, lastNodeId) => {
      const { nodes, edges, getNodeID } = get();
      const lastNode = nodes.find(n => n.id === lastNodeId);
      let position = { x: 250, y: 250 };
      if (lastNode) {
        position = {
          x: lastNode.position.x,
          y: lastNode.position.y + 180,
        };
      }

      const newNodeId = getNodeID(nodeType);
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position,
        data: { id: newNodeId, nodeType },
      };

      const newEdge = {
        id: `edge-${lastNodeId}-${newNodeId}`,
        source: lastNodeId,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
      };

      set({
        nodes: [...nodes, newNode],
        edges: [...edges, newEdge],
        activeNodeId: newNodeId,
      });
    },

    setWorkflow: (nodes, edges) => {
      set({ nodes, edges });
    },
}));
