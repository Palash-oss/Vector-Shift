// inputNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const currName = data?.inputName ?? id.replace('customInput-', 'input_');
  const inputType = data?.inputType ?? 'Text';

  useEffect(() => {
    if (data?.inputName === undefined) {
      updateNodeField(id, 'inputName', currName);
    }
    if (data?.inputType === undefined) {
      updateNodeField(id, 'inputType', inputType);
    }
  }, [id, data, updateNodeField, currName, inputType]);

  const handleNameChange = (e) => {
    updateNodeField(id, 'inputName', e.target.value);
  };

  const handleTypeChange = (e) => {
    updateNodeField(id, 'inputType', e.target.value);
  };

  const handles = [
    { type: 'source', position: Position.Right, id: `${id}-value` }
  ];

  return (
    <BaseNode id={id} title="Input" type="input" handles={handles}>
      <div className="node-field">
        <label className="field-label">Name:</label>
        <input 
          type="text" 
          className="field-input"
          value={currName} 
          onChange={handleNameChange} 
        />
      </div>
      <div className="node-field">
        <label className="field-label">Type:</label>
        <select className="field-select" value={inputType} onChange={handleTypeChange}>
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </div>
    </BaseNode>
  );
}
