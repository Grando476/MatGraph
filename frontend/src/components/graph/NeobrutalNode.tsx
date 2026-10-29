import { Handle, Position } from "@xyflow/react";

export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 125;

export const NeobrutalNode = ({ data, selected }: any) => {
  const totalTg = data.totalTaskGroups ?? 0;
  const passedTg = data.passedTaskGroups ?? 0;
  const isAllPassed = totalTg > 0 && passedTg >= totalTg;
  const isBlocked = Boolean(data.isHidden ?? data.isBlocked);
  const isAdmin = Boolean(data.isAdmin);

  // Dla zwykłych użytkowników węzeł wygląda identycznie jak każdy inny ("tak samo dla nie adminow").
  // Tylko administrator widzi oznaczenie węzła zablokowanego z braku PDF.
  const showAdminIndicator = isAdmin && isBlocked;

  return (
    <div
      style={{
        position: 'relative',
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
        background: selected
          ? showAdminIndicator ? '#fef3c7' : 'var(--neo-yellow)'
          : showAdminIndicator ? '#fafaf9' : '#ffffff',
        border: showAdminIndicator ? '3px dashed #000000' : '3px solid #000000',
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
        opacity: showAdminIndicator ? 0.85 : 1,
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
          background: showAdminIndicator
            ? '#d97706'
            : selected
            ? '#000000'
            : isAllPassed
            ? 'var(--neo-green)'
            : 'var(--neo-yellow)',
          borderBottom: '2.5px solid #000000',
          width: '100%',
        }}
      />

      {/* Admin indicator badge (top-right corner) */}
      {showAdminIndicator && (
        <div
          title="Węzeł zablokowany dla uczniów (brak materiałów PDF)"
          style={{
            position: 'absolute',
            top: '12px',
            right: '8px',
            background: '#fef3c7',
            border: '1.5px solid #000000',
            borderRadius: '6px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#92400e',
            boxShadow: '1px 1px 0px 0px #000000',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}

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
            color: showAdminIndicator ? '#4b5563' : '#000000',
            wordBreak: 'break-word',
          }}
        >
          {data.label}
        </span>

        {/* Progress pill tag or Admin Locked pill */}
        {showAdminIndicator ? (
          <span
            style={{
              fontFamily: 'var(--font-node), Outfit, sans-serif',
              fontSize: '0.68rem',
              background: '#fef3c7',
              color: '#92400e',
              border: '2px solid #000000',
              borderRadius: '9999px',
              padding: '1.5px 8px',
              fontWeight: 900,
              letterSpacing: '0.02em',
              boxShadow: selected ? 'none' : '2px 2px 0px 0px #000000',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Zablokowany
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-node), Outfit, sans-serif',
              fontSize: '0.7rem',
              background: selected
                ? '#000000'
                : isAllPassed
                ? 'var(--neo-green)'
                : 'var(--neo-yellow)',
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
            {totalTg > 0 ? `${passedTg}/${totalTg}` : data.subtasksCount ? `${data.subtasksCount}/${data.subtasksCount}` : '0/0'}
          </span>
        )}
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
