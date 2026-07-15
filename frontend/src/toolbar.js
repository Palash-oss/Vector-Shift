// toolbar.js

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {

    return (
        <div className="toolbar-container">
            <div className="toolbar-title">VectorShift Flow Studio</div>
            <div className="toolbar-chips">
                <DraggableNode type='customInput' label='Input' />
                <DraggableNode type='llm' label='LLM' />
                <DraggableNode type='customOutput' label='Output' />
                <DraggableNode type='text' label='Text' />
                <DraggableNode type='filter' label='Filter' />
                <DraggableNode type='math' label='Math' />
                <DraggableNode type='api' label='API Request' />
                <DraggableNode type='timer' label='Timer' />
                <DraggableNode type='conditional' label='Conditional' />
            </div>
        </div>
    );
};
