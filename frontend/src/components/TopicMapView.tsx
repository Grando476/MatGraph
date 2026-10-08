"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, Position, Handle, BackgroundVariant, CoordinateExtent } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getCurrentUser, authLogout, UserProfile } from "@/utils/auth";
import Logo from "@/components/Logo";

const NODE_WIDTH = 190;
const NODE_HEIGHT = 125;

const NeobrutalNode = ({ data, selected }: any) => {
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

const nodeTypes = {
  cyber: NeobrutalNode,
};

const calculateExtent = (nodeList: Node[]): CoordinateExtent | undefined => {
  if (!nodeList || nodeList.length === 0) return undefined;
  const xs = nodeList.map((n) => n.position.x);
  const ys = nodeList.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs) + NODE_WIDTH;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys) + NODE_HEIGHT;
  const PADDING_X = 700;
  const PADDING_Y = 600;
  return [
    [minX - PADDING_X, minY - PADDING_Y],
    [maxX + PADDING_X, maxY + PADDING_Y],
  ];
};

export default function TopicMapView() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [savingLayout, setSavingLayout] = useState(false);
  const [canMoveNodes, setCanMoveNodes] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarLessons, setSidebarLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [translateExtent, setTranslateExtent] = useState<CoordinateExtent | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const canDragNodes = Boolean(currentUser?.role === 'admin' && canMoveNodes);

  const filteredNodes = searchQuery
    ? nodes.filter(n => (n.data.label as string).toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const onSearchSelect = (node: Node) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );

    if (rfInstance) {
      rfInstance.setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + NODE_HEIGHT / 2, { zoom: 1.15, duration: 600 });
    }
    onNodeClick({} as React.MouseEvent, node);
    setSearchQuery("");
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const u = await getCurrentUser();
        if (isMounted) setCurrentUser(u);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setCanMoveNodes(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as globalThis.Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await authLogout();
    setCurrentUser(null);
    setCanMoveNodes(false);
    setIsProfileOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleNodesChange = useCallback((changes: any) => {
    if (!canDragNodes) {
      const nonPositionChanges = changes.filter((c: any) => c.type !== 'position');
      if (nonPositionChanges.length > 0) {
        onNodesChange(nonPositionChanges);
      }
      return;
    }
    onNodesChange(changes);
  }, [canDragNodes, onNodesChange]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/nodes`);
        if (res.ok) {
          const data = await res.json();
          if (!data.nodes || !data.edges) return;

          const rawNodes: Node[] = data.nodes.map((n: any) => ({
            id: n.id,
            type: 'cyber',
            targetPosition: Position.Bottom,
            sourcePosition: Position.Top,
            position: { x: n.ui_x || 0, y: n.ui_y || 0 },
            data: { label: n.name, subtasksCount: n.subtasks_count },
          }));

          const rawEdges: Edge[] = data.edges.map((e: any, idx: number) => ({
            id: `e${e.source}-${e.target}-${idx}`,
            source: e.source,
            target: e.target,
            type: 'default',
            animated: false,
            style: {
              stroke: '#000000',
              strokeWidth: 2.5,
            }
          }));

          setNodes(rawNodes);
          setEdges(rawEdges);
          setTranslateExtent(calculateExtent(rawNodes));
        }
      } catch (err) {
        console.error("Error fetching nodes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    if (rfInstance) {
      const currentZoom = rfInstance.getZoom ? rfInstance.getZoom() : 1.0;
      const targetZoom = Math.max(currentZoom, 1.0);
      rfInstance.setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + NODE_HEIGHT / 2, {
        zoom: targetZoom,
        duration: 600,
      });
    }
    setSidebarLessons([]);
    setLoadingLessons(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/nodes/${node.id}/lessons`);
      if (res.ok) {
        const data = await res.json();
        if (data.lessons) {
          setSidebarLessons(data.lessons);
        }
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoadingLessons(false);
    }
  }, [rfInstance]);

  const saveLayout = async () => {
    setSavingLayout(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const positions = nodes.map((n) => ({
        id: n.id,
        x: Math.round(n.position.x),
        y: Math.round(n.position.y),
      }));

      const res = await fetch(`${apiUrl}/api/v1/nodes/positions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions }),
      });
      if (!res.ok) {
        let msg = `HTTP Error ${res.status}: ${res.statusText}`;
        try {
          const errData = await res.json();
          msg += ` - ${errData.detail || errData.error || JSON.stringify(errData)}`;
        } catch {
          msg += ` - ${await res.text()}`;
        }
        throw new Error(msg);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(`Database Error: ${data.error}`);
      }

      setTranslateExtent(calculateExtent(nodes));
      alert("Stan został pomyślnie zapisany!");
    } catch (err: any) {
      console.error("Error saving layout:", err);
      alert(`Nie udało się zapisać stanu.\n\nSzczegóły: ${err.message}`);
    } finally {
      setSavingLayout(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="bg-white border-3 border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center">
              <div className="w-10 h-10 border-3 border-black border-t-[var(--neo-yellow)] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-base font-black uppercase tracking-wider text-black">Ładowanie Mapy Wiedzy...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top-Left Logo & Search Panel */}
            <div style={{
              position: 'absolute', top: 20, left: 24, zIndex: 100,
              display: 'flex', flexDirection: 'column', gap: '10px',
              width: '160px'
            }}>
              <div style={{
                background: '#ffffff',
                border: '2.5px solid #000000',
                borderRadius: '14px',
                boxShadow: '4px 4px 0px 0px #000000',
                padding: '6px',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Logo size="lg" className="w-full" />
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Szukaj tematu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredNodes.length > 0) {
                      onSearchSelect(filteredNodes[0]);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    width: '100%',
                    background: '#ffffff',
                    color: '#000000',
                    border: '2.5px solid #000000',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '3px 3px 0px 0px #000000',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                />
                {searchQuery && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    width: '260px',
                    background: '#ffffff',
                    border: '2.5px solid #000000',
                    borderRadius: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '6px 6px 0px 0px #000000',
                    zIndex: 110,
                  }}>
                    {filteredNodes.length > 0 ? filteredNodes.map(node => (
                      <div
                        key={node.id}
                        onClick={() => onSearchSelect(node)}
                        style={{
                          padding: '10px 14px',
                          color: '#000000',
                          cursor: 'pointer',
                          borderBottom: '1.5px solid #000000',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e: any) => e.currentTarget.style.background = 'var(--neo-yellow)'}
                        onMouseLeave={(e: any) => e.currentTarget.style.background = '#ffffff'}
                      >
                        {node.data.label as string}
                      </div>
                    )) : (
                      <div style={{ padding: '12px 14px', color: '#6b7280', fontStyle: 'italic', fontSize: '0.82rem', fontWeight: 600 }}>
                        Brak wyników
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Move Status Badge */}
            {canDragNodes && (
              <div style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 90,
                background: 'var(--neo-yellow)',
                border: '2.5px solid #000000',
                borderRadius: '9999px',
                padding: '6px 18px',
                color: '#000000',
                fontSize: '0.78rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '3px 3px 0px 0px #000000',
                pointerEvents: 'none',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000000', display: 'inline-block' }} />
                Tryb Edycji Grafu Aktywny
              </div>
            )}

            {/* Top-Right User Actions */}
            <div style={{
              position: 'absolute', top: 20, right: 20, zIndex: 100,
              display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              {!currentUser ? (
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '9px 18px',
                    background: 'var(--neo-yellow)',
                    color: '#000000',
                    border: '2.5px solid #000000',
                    borderRadius: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontSize: '0.78rem',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '4px 4px 0px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '5px 5px 0px 0px #000000';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000';
                  }}
                >
                  Zaloguj się &rarr;
                </button>
              ) : (
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    title="Profil użytkownika"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isProfileOpen ? 'var(--neo-yellow)' : '#ffffff',
                      border: '2.5px solid #000000',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '3px 3px 0px 0px #000000',
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.background = 'var(--neo-yellow)';
                    }}
                    onMouseLeave={(e: any) => {
                      if (!isProfileOpen) {
                        e.currentTarget.style.background = '#ffffff';
                      }
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '52px',
                        right: 0,
                        width: '270px',
                        background: '#ffffff',
                        border: '2.5px solid #000000',
                        borderRadius: '14px',
                        padding: '16px',
                        boxShadow: '6px 6px 0px 0px #000000',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        zIndex: 200,
                      }}
                    >
                      {/* User Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '10px', borderBottom: '2px solid #000000' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#000000' }}>
                            {currentUser.firstName || currentUser.lastName
                              ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                              : (currentUser.email ? currentUser.email.split('@')[0] : 'Użytkownik')}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: currentUser.role === 'admin' ? 'var(--neo-yellow)' : 'var(--neo-green)',
                              color: '#000000',
                              border: '1.5px solid #000000',
                              boxShadow: '1px 1px 0px 0px #000000',
                            }}
                          >
                            {currentUser.role === 'admin' ? 'Admin' : 'Uczeń'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {currentUser.email}
                        </span>
                      </div>

                      {/* Admin Tools: Unlock Movement & Save Layout */}
                      {currentUser.role === 'admin' && (
                        <div style={{ paddingBottom: '10px', borderBottom: '2px solid #000000', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => setCanMoveNodes(!canMoveNodes)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: canMoveNodes ? 'var(--neo-yellow)' : 'white',
                              color: '#000000',
                              border: '2px solid #000000',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '2px 2px 0px 0px #000000',
                              transition: 'all 0.15s',
                            }}
                          >
                            {canMoveNodes ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                </svg>
                                <span>Zablokuj węzły</span>
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span>Odblokuj węzły</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={saveLayout}
                            disabled={savingLayout}
                            title="Zapisz stan"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: savingLayout ? '#e5e7eb' : 'var(--neo-green)',
                              color: '#000000',
                              border: '2px solid #000000',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: savingLayout ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '2px 2px 0px 0px #000000',
                              transition: 'all 0.15s',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            {savingLayout ? 'Zapisywanie...' : 'Zapisz układ'}
                          </button>
                        </div>
                      )}

                      {/* Bottom Logout Button */}
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'white',
                          color: '#b91c1c',
                          border: '2px solid #000000',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '2px 2px 0px 0px #000000',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.background = 'var(--neo-pink)';
                          e.currentTarget.style.color = '#000000';
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#b91c1c';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Wyloguj się
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ReactFlow Interactive Canvas */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              nodesDraggable={canDragNodes}
              nodesConnectable={false}
              elementsSelectable={true}
              panOnDrag={true}
              panOnScroll={false}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={true}
              minZoom={0.65}
              maxZoom={1.3}
              translateExtent={translateExtent}
              nodeExtent={translateExtent}
              fitView
              fitViewOptions={{ minZoom: 0.65, maxZoom: 1.3, padding: 0.2 }}
              onInit={setRfInstance}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#000000" gap={26} size={1.8} variant={BackgroundVariant.Dots} style={{ opacity: 0.2 }} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </>
        )}
      </div>

      {/* Right Drawer Panel with Lessons */}
      {selectedNode && (
        <div style={{
          width: '360px',
          background: '#ffffff',
          borderLeft: '3px solid #000000',
          boxShadow: '-6px 0px 0px 0px #000000',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          <div style={{
            padding: '18px 20px',
            borderBottom: '2.5px solid #000000',
            background: 'var(--bg-deep)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                background: 'var(--neo-yellow)',
                border: '1.5px solid #000000',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                boxShadow: '1px 1px 0px 0px #000000',
                display: 'inline-block',
                marginBottom: '4px',
              }}>
                Temat
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000000', margin: 0, lineHeight: '1.2', wordBreak: 'break-word' }}>
                {selectedNode.data.label as string}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedNode(null);
                setNodes((prev) => prev.map((n) => ({ ...n, selected: false })));
              }}
              aria-label="Zamknij panel"
              style={{
                alignSelf: 'center',
                flexShrink: 0,
                background: 'white',
                border: '2px solid #000000',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#000000',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                boxShadow: '2px 2px 0px 0px #000000',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = 'var(--neo-yellow)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <h3 style={{
              fontSize: '0.82rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#4b5563',
              marginBottom: '15px'
            }}>
              Dostępne Lekcje
            </h3>

            {loadingLessons ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="w-8 h-8 border-3 border-black border-t-[var(--neo-yellow)] rounded-full animate-spin mx-auto mb-2" />
                <p style={{ color: '#000000', fontWeight: 700, fontSize: '0.8rem' }}>Ładowanie lekcji...</p>
              </div>
            ) : sidebarLessons.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {sidebarLessons.map((lesson: any) => (
                  <li
                    key={lesson.id}
                    style={{
                      padding: '16px',
                      border: '2.5px solid #000000',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: '#ffffff',
                      boxShadow: '4px 4px 0px 0px #000000',
                    }}
                    onClick={() => router.push(`/lesson/${lesson.id}`)}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.background = 'var(--neo-yellow)';
                      e.currentTarget.style.transform = 'translate(2px, 2px)';
                      e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000';
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#000000', fontSize: '0.98rem', fontWeight: 800 }}>
                        {lesson.title}
                      </h4>
                      <span style={{ fontSize: '1rem', fontWeight: 900 }}>&rarr;</span>
                    </div>
                    {lesson.importance && (
                      <span style={{
                        fontSize: '0.68rem',
                        color: '#000000',
                        fontWeight: 900,
                        display: 'inline-block',
                        marginTop: '6px',
                        background: 'var(--neo-green)',
                        border: '1.5px solid #000000',
                        borderRadius: '4px',
                        padding: '1px 6px',
                        boxShadow: '1px 1px 0px 0px #000000'
                      }}>
                        Ważność: {lesson.importance} / 5
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 600 }}>
                Brak dostępnych lekcji dla tego tematu.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
