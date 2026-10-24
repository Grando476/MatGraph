import { Handle, Position } from "@xyflow/react";

export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 125;

export const NeobrutalNode = ({ data, selected }: any) => {
  return (
    <div
      style={{
        position: 'relative',
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
        background: selected ? 'var(--neo-yellow)' : '#ffffff',
        border: '3px solid #000000',
        borderRadius: '14px',
        boxShadow: selected ? '7px 7px 0px 0px #000000' : '4px 4px 0px 0px #000000',
        transform: selected ? 'translate(-2px, -2px)' : 'none',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Bottom}
        style={{
          background: '#000000',
          width: '10px',
          height: '10px',
          border: '2px solid #ffffff',
          borderRadius: '50%',
        }}
      />

      {/* Top decorative stripe */}
      <div
        style={{
          height: '8px',
          background: selected ? '#000000' : 'var(--neo-green)',
          borderBottom: '2.5px solid #000000',
          width: '100%',
        }}
      />

      {/* Node Content */}
      <div
        style={{
          flex: 1,
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-node), Outfit, sans-serif',
            fontSize: '0.92rem',
            fontWeight: 800,
            lineHeight: '1.2',
            letterSpacing: '-0.01em',
            color: '#000000',
            wordBreak: 'break-word',
          }}
        >
          {data.label}
        </span>

        {/* Progress pill tag */}
        <span
          style={{
            fontFamily: 'var(--font-node), Outfit, sans-serif',
            fontSize: '0.7rem',
            background: selected ? '#000000' : 'var(--neo-yellow)',
            color: selected ? '#ffffff' : '#000000',
            border: '2px solid #000000',
            borderRadius: '9999px',
            padding: '1.5px 8px',
            fontWeight: 900,
            letterSpacing: '0.02em',
            boxShadow: selected ? 'none' : '2px 2px 0px 0px #000000',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {data.subtasksCount ? `${data.subtasksCount}/${data.subtasksCount}` : '0/0'}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Top}
        style={{
          background: '#000000',
          width: '10px',
          height: '10px',
          border: '2px solid #ffffff',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export const nodeTypes = {
  cyber: NeobrutalNode,
};
