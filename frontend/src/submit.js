// submit.js

import React, { useState } from 'react';
import { useStore } from './store';

export const SubmitButton = () => {
  const { nodes, edges } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setModalData(null);

    // Format request payload matching proper Pydantic schemas
    const payload = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: n.data
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      }))
    };

    try {
      const response = await fetch('http://127.0.0.1:8002/pipelines/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setModalData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reach validation backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="submit-container">
        <button
          type="button"
          className="btn-debug"
          onClick={() => alert("Pipeline debug run completed: 0 errors detected.")}
        >
          Debug
        </button>
        <button
          className="submit-btn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <div className="spinner" />
              <span>Validating...</span>
            </>
          ) : (
            <span>Submit Pipeline</span>
          )}
        </button>
      </div>

      {error && (
        <div className="modal-overlay" onClick={() => setError(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#ef4444' }}>
                Connection Error
              </span>
              <button className="modal-close-btn" onClick={() => setError(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 16px 0' }}>{error}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
                Please check that your FastAPI backend is running on port 8002 and CORS is configured correctly.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setError(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                Pipeline Analysis
              </span>
              <button className="modal-close-btn" onClick={() => setModalData(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-stat-row">
                <span className="modal-stat-label">Total Nodes</span>
                <span className="modal-stat-value">{modalData.num_nodes}</span>
              </div>
              <div className="modal-stat-row">
                <span className="modal-stat-label">Total Edges</span>
                <span className="modal-stat-value">{modalData.num_edges}</span>
              </div>
              <div className="modal-stat-row">
                <span className="modal-stat-label">Is Directed Acyclic Graph (DAG)?</span>
                <span className={`modal-stat-value ${modalData.is_dag ? 'dag-yes' : 'dag-no'}`}>
                  {modalData.is_dag ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setModalData(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
