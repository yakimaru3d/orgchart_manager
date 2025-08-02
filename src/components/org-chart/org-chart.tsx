'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { OrgNode, OrgChartData } from '@/types/org-chart';
import OrgChartNode from './org-chart-node';

interface OrgChartProps {
  data: OrgChartData;
  onNodeClick?: (node: OrgNode) => void;
}

const nodeTypes: NodeTypes = {
  orgNode: OrgChartNode,
};

export default function OrgChart({ data, onNodeClick }: OrgChartProps) {
  // Convert org chart data to React Flow format
  const flowNodes: Node[] = useMemo(() => {
    return data.nodes.map((node, index) => ({
      id: node.id,
      type: 'orgNode',
      position: {
        x: (index % 4) * 300 + 50, // Simple grid layout
        y: node.level * 200 + 50,
      },
      data: node,
      draggable: true,
    }));
  }, [data.nodes]);

  const flowEdges: Edge[] = useMemo(() => {
    return data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: '#6366f1',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#6366f1',
      },
    }));
  }, [data.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data) {
        onNodeClick(node.data as OrgNode);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="h-[800px] bg-gray-50 border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Controls 
          className="bg-white border border-gray-200 rounded-lg shadow-lg"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-white border border-gray-200 rounded-lg shadow-lg"
          nodeColor={(node) => {
            const level = (node.data as OrgNode)?.level || 1;
            switch (level) {
              case 1: return '#8b5cf6';
              case 2: return '#3b82f6';
              case 3: return '#10b981';
              case 4: return '#f97316';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  );
}