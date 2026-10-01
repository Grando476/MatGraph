"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, Position, Handle, BackgroundVariant, CoordinateExtent } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getCurrentUser, authLogout, UserProfile } from "@/utils/auth";

const NODE_SIZE = 180;

const CyberNode = ({ data, selected }: any) => {
  const color = selected ? 'var(--node-yellow)' : 'var(--node-green)';
  const dropShadow = selected ? `drop-shadow(0 0 14px ${color})` : `drop-shadow(0 0 4px rgba(0,0,0,0.6))`;

  return (
    <div style={{ position: 'relative', width: NODE_SIZE, height: NODE_SIZE, filter: dropShadow, transition: 'all 0.2s', cursor: 'pointer' }}>
      <svg width={NODE_SIZE} height={NODE_SIZE} viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Outer glowing octagon */}
        <polygon points="40,5 100,5 135,40 135,100 100,135 40,135 5,100 5,40"
          fill="var(--bg-surface)" stroke={color} strokeWidth="3" opacity="0.95" />
        {/* Inner decoration octagon */}
        <polygon points="45,15 95,15 125,45 125,95 95,125 45,125 15,95 15,45"
          fill="rgba(255, 255, 255, 0.04)" stroke={color} strokeWidth="1" opacity="0.6" />
      </svg>

      <Handle type="target" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />

      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        color: 'var(--text-main)', textAlign: 'center', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', width: '78%', height: '78%',
        pointerEvents: 'none'
      }}>
        <span style={{
          fontFamily: 'var(--font-node), Outfit, sans-serif',
          fontSize: '0.94rem',
          fontWeight: 800,
          lineHeight: '1.25',
          letterSpacing: '-0.01em',
          textShadow: `0 1px 4px rgba(0,0,0,0.8)`,
          wordBreak: 'break-word',
        }}>
          {data.label}
        </span>
        <span style={{
          fontFamily: 'var(--font-node), Outfit, sans-serif',
          fontSize: '0.72rem',
          background: color,
          color: 'var(--bg-deep)',
          padding: '2px 9px',
          marginTop: '7px',
          borderRadius: '3px',
          fontWeight: 800,
          letterSpacing: '0.02em',
        }}>
          {data.subtasksCount ? `${data.subtasksCount}/${data.subtasksCount}` : '0/0'}
        </span>
      </div>

      <Handle type="source" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
};

const nodeTypes = {
  cyber: CyberNode,
};

const calculateExtent = (nodeList: Node[]): CoordinateExtent | undefined => {
  if (!nodeList || nodeList.length === 0) return undefined;
  const xs = nodeList.map((n) => n.position.x);
  const ys = nodeList.map((n) => n.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs) + NODE_SIZE;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys) + NODE_SIZE;
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarLessons, setSidebarLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [translateExtent, setTranslateExtent] = useState<CoordinateExtent | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const filteredNodes = searchQuery
    ? nodes.filter(n => (n.data.label as string).toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const onSearchSelect = (node: Node) => {
    if (rfInstance) {
      rfInstance.setCenter(node.position.x + NODE_SIZE / 2, node.position.y + NODE_SIZE / 2, { zoom: 1.15, duration: 600 });
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
    setIsProfileOpen(false);
    router.push("/");
    router.refresh();
  };

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
              stroke: 'var(--edge-emerald)',
              strokeWidth: 2,
              filter: 'drop-shadow(0 0 2px rgba(4, 120, 87, 0.4))'
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
      rfInstance.setCenter(node.position.x + NODE_SIZE / 2, node.position.y + NODE_SIZE / 2, {
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
      alert("Layout saved successfully!");
    } catch (err: any) {
      console.error("Error saving layout:", err);
      alert(`Failed to save layout.\n\nDetails: ${err.message}`);
    } finally {
      setSavingLayout(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-dark)', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-2xl font-semibold text-accent-yellow animate-pulse">Initializing Cyber-Tree...</p>
          </div>
        ) : (
          <>
            <div style={{
              position: 'absolute', top: 20, left: 20, zIndex: 100,
              display: 'flex', flexDirection: 'column', gap: '5px'
            }}>
              <input
                type="text"
                placeholder="Szukaj tematu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 15px', width: '300px',
                  background: 'var(--bg-card)', color: 'var(--text-main)',
                  border: '1px solid var(--border-dark)', borderRadius: '5px',
                  outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}
              />
              {searchQuery && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-dark)',
                  borderRadius: '5px', maxHeight: '300px', overflowY: 'auto',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}>
                  {filteredNodes.length > 0 ? filteredNodes.map(node => (
                    <div
                      key={node.id}
                      onClick={() => onSearchSelect(node)}
                      style={{
                        padding: '10px 15px', color: 'var(--text-subtle)',
                        cursor: 'pointer', borderBottom: '1px solid var(--border-dark)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e: any) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                    >
                      {node.data.label as string}
                    </div>
                  )) : (
                    <div style={{ padding: '10px 15px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      Brak wyników
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{
              position: 'absolute', top: 20, right: 20, zIndex: 100,
              display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              {!currentUser ? (
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '9px 18px', background: 'var(--bg-card)',
                    color: 'var(--accent-main)', border: '1px solid var(--accent-dark)', borderRadius: '6px',
                    fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  Zaloguj się
                </button>
              ) : (
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    title="Profil użytkownika"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isProfileOpen ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      border: `1.5px solid ${isProfileOpen ? 'var(--accent-main)' : 'var(--border-dark)'}`,
                      color: isProfileOpen ? 'var(--accent-main)' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.borderColor = 'var(--accent-main)';
                      e.currentTarget.style.color = 'var(--accent-main)';
                    }}
                    onMouseLeave={(e: any) => {
                      if (!isProfileOpen) {
                        e.currentTarget.style.borderColor = 'var(--border-dark)';
                        e.currentTarget.style.color = 'var(--text-main)';
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50px',
                        right: 0,
                        width: '260px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-dark)',
                        borderRadius: '8px',
                        padding: '14px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        zIndex: 200,
                      }}
                    >
                      {/* User Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-dark)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {currentUser.firstName || currentUser.lastName
                              ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                              : (currentUser.email ? currentUser.email.split('@')[0] : 'Użytkownik')}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: currentUser.role === 'admin' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                              color: currentUser.role === 'admin' ? 'var(--node-yellow)' : 'var(--accent-main)',
                              border: `1px solid ${currentUser.role === 'admin' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                            }}
                          >
                            {currentUser.role === 'admin' ? 'Admin' : 'Uczeń'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {currentUser.email}
                        </span>
                      </div>

                      {/* Admin Tools: Save Layout */}
                      {currentUser.role === 'admin' && (
                        <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-dark)' }}>
                          <button
                            onClick={saveLayout}
                            disabled={savingLayout}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              background: savingLayout ? 'var(--text-dim)' : 'var(--accent-hover)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontWeight: '600',
                              fontSize: '0.8rem',
                              cursor: savingLayout ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            {savingLayout ? 'Saving...' : 'Save Layout'}
                          </button>
                        </div>
                      )}

                      {/* Bottom Logout Button */}
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          color: '#f87171',
                          border: '1px solid rgba(248, 113, 113, 0.25)',
                          borderRadius: '5px',
                          fontWeight: '600',
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.5)';
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.25)';
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              panOnDrag={true}
              panOnScroll={false}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={true}
              minZoom={0.65}
              maxZoom={1.5}
              translateExtent={translateExtent}
              nodeExtent={translateExtent}
              fitView
              fitViewOptions={{ minZoom: 0.65, maxZoom: 1.1, padding: 0.2 }}
              onInit={setRfInstance}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="var(--border-subtle)" gap={25} size={2} variant={BackgroundVariant.Dots} />
              <Controls style={{ filter: 'invert(80%) sepia(90%) saturate(400%) hue-rotate(360deg)' }} />
            </ReactFlow>
          </>
        )}
      </div>

      {selectedNode && (
        <div style={{
          width: '350px',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-dark)',
          boxShadow: '-4px 0 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{selectedNode.data.label as string}</h2>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}
            >
              &times;
            </button>
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-subtle)', marginBottom: '15px' }}>Lessons</h3>
            {loadingLessons ? (
              <p style={{ color: 'var(--text-dim)' }}>Loading lessons...</p>
            ) : sidebarLessons.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {sidebarLessons.map((lesson: any) => (
                  <li key={lesson.id} style={{
                    padding: '15px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'var(--bg-surface)'
                  }}
                    onClick={() => router.push(`/lesson/${lesson.id}`)}
                    onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = 'var(--accent-hover)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  >
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-main)', fontSize: '1rem' }}>{lesson.title}</h4>
                    {lesson.importance && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Importance: {lesson.importance} / 5</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.875rem' }}>No lessons available for this topic yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
