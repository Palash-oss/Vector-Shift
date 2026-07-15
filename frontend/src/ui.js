import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { FilterNode } from './nodes/filterNode';
import { MathNode } from './nodes/mathNode';
import { APIRequestNode } from './nodes/apiRequestNode';
import { TimerNode } from './nodes/timerNode';
import { ConditionalNode } from './nodes/conditionalNode';
import { NodePickerMenu } from './components/NodePickerMenu';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  math: MathNode,
  api: APIRequestNode,
  timer: TimerNode,
  conditional: ConditionalNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  nodeStatuses: state.nodeStatuses || {},
  insertNodeOnEdge: state.insertNodeOnEdge,
  insertNodeAtChainEnd: state.insertNodeAtChainEnd,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      nodeStatuses,
      insertNodeOnEdge,
      insertNodeAtChainEnd,
    } = useStore(selector, shallow);

    // Hover button state for edge insertion
    const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
    const hoverTimeoutRef = useRef(null);

    // Floating Node Picker Menu State
    const [pickerAnchor, setPickerAnchor] = useState(null); // { x, y, type: 'edge' | 'chain', edgeId?, lastNodeId? }

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Helper: calculate midpoint of a React Flow edge in flow space
    const getEdgeMidpoint = (edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;
      
      const sX = sourceNode.position.x + 110; // offset half of 220px node width
      const sY = sourceNode.position.y + 40;
      const tX = targetNode.position.x + 110;
      const tY = targetNode.position.y + 40;
      
      return { x: (sX + tX) / 2, y: (sY + tY) / 2 };
    };

    // Find the last nodes in the chains (nodes with no outgoing edges)
    const sourceIds = new Set(edges.map(e => e.source));
    const lastNodes = nodes.filter(node => !sourceIds.has(node.id));

    // Handle edge hover delays
    const handleEdgeMouseEnter = (e, edge) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoveredEdgeId(edge.id);
    };

    const handleEdgeMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredEdgeId(null);
      }, 300);
    };

    const handlePlusMouseEnter = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    const handlePlusMouseLeave = () => {
      setHoveredEdgeId(null);
    };

    const handlePlusClick = (e, type, edgeId, lastNodeId) => {
      e.stopPropagation();
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const menuX = e.clientX - rect.left + 15;
      const menuY = e.clientY - rect.top - 15;
      setPickerAnchor({
        x: menuX,
        y: menuY,
        type,
        edgeId,
        lastNodeId,
      });
    };

    // Apply custom colors and dash animations dynamically to edges
    const styledEdges = edges.map((edge) => {
      const sourceStatus = nodeStatuses[edge.source] || 'untouched';
      const targetStatus = nodeStatuses[edge.target] || 'untouched';
      const isSuccessful = sourceStatus === 'success' && targetStatus === 'success';

      const isLoopback = edge.label === 'Response Loop' || edge.id === 'edge-loopback';

      return {
        ...edge,
        style: {
          stroke: isSuccessful ? '#2ea043' : '#30363d',
          strokeWidth: 2.5,
          strokeDasharray: isLoopback ? '6,6' : undefined,
        },
        animated: isSuccessful || isLoopback,
        labelStyle: { fill: isLoopback ? '#58a6ff' : '#8b949e', fontWeight: 600, fontSize: '10px' },
        labelBgStyle: { fill: '#161b22', fillOpacity: 0.8, rx: 4 },
      };
    });

    return (
        <>
        <div ref={reactFlowWrapper} className="canvas-container">
            <ReactFlow
                nodes={nodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onEdgeMouseEnter={handleEdgeMouseEnter}
                onEdgeMouseLeave={handleEdgeMouseLeave}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="rgba(255, 255, 255, 0.05)" gap={gridSize} size={1.5} />
                <Controls />
                <MiniMap />
            </ReactFlow>

            {/* Render Edge-Hover "+" buttons */}
            {reactFlowInstance && edges.map((edge) => {
              if (hoveredEdgeId !== edge.id) return null;
              const midpoint = getEdgeMidpoint(edge);
              if (!midpoint) return null;
              
              const clientPos = reactFlowInstance.flowToScreenPosition(midpoint);
              const rect = reactFlowWrapper.current.getBoundingClientRect();
              const left = clientPos.x - rect.left;
              const top = clientPos.y - rect.top;

              return (
                <div
                  key={`plus-${edge.id}`}
                  className="edge-plus-btn-portal"
                  style={{ left: `${left}px`, top: `${top}px` }}
                  onMouseEnter={handlePlusMouseEnter}
                  onMouseLeave={handlePlusMouseLeave}
                >
                  <button
                    className="circular-plus-btn"
                    onClick={(e) => handlePlusClick(e, 'edge', edge.id, null)}
                    title="Insert node here"
                  >
                    +
                  </button>
                </div>
              );
            })}

            {/* Render Chain-end persistent "+" buttons */}
            {reactFlowInstance && lastNodes.map((node) => {
              const rect = reactFlowWrapper.current.getBoundingClientRect();
              const clientPos = reactFlowInstance.flowToScreenPosition({
                x: node.position.x + 110, // centered
                y: node.position.y + 110, // positioned below the bottom border
              });
              const left = clientPos.x - rect.left;
              const top = clientPos.y - rect.top;

              return (
                <div
                  key={`chain-plus-${node.id}`}
                  className="edge-plus-btn-portal"
                  style={{ left: `${left}px`, top: `${top}px` }}
                >
                  <button
                    className="circular-plus-btn"
                    onClick={(e) => handlePlusClick(e, 'chain', null, node.id)}
                    title="Add node to chain end"
                  >
                    +
                  </button>
                </div>
              );
            })}

            {/* Floating Node Picker Menu */}
            {pickerAnchor && (
              <NodePickerMenu
                x={pickerAnchor.x}
                y={pickerAnchor.y}
                onClose={() => setPickerAnchor(null)}
                onSelectNode={(nodeType) => {
                  if (pickerAnchor.type === 'edge') {
                    insertNodeOnEdge(nodeType, pickerAnchor.edgeId);
                  } else {
                    insertNodeAtChainEnd(nodeType, pickerAnchor.lastNodeId);
                  }
                }}
              />
            )}
        </div>
        </>
    )
}
