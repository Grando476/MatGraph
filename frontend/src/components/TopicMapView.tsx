"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  CoordinateExtent,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getCurrentUser, authLogout, UserProfile, getApiUrl, getAuthToken } from "@/utils/auth";
import Logo from "@/components/Logo";
import { NODE_WIDTH, NODE_HEIGHT, nodeTypes } from "./graph/NeobrutalNode";
import JoinClassModal from "./graph/JoinClassModal";
import TopicLessonsSidebar from "./graph/TopicLessonsSidebar";
import UserProfileDrawer from "./graph/UserProfileDrawer";

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

const getInitialNodeId = (): string | null => {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  const paramNode = urlParams.get("node");
  if (paramNode) return paramNode;
  return sessionStorage.getItem("graph_selected_node_id");
};

const getInitialZoom = (): number | null => {
  if (typeof window === "undefined") return null;
  const saved = sessionStorage.getItem("graph_zoom");
  if (saved) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
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
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const restoredNodeIdRef = useRef<string | null>(null);
  const hasRestoredViewportRef = useRef(false);

  // Klasy studenta
  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Zadania do zrobienia dla studenta
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchStudentClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/student/classes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setStudentClasses(data.classes || []);
      }
    } catch (err) {
      console.error("Błąd pobierania klas studenta:", err);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchStudentAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const token = await getAuthToken();
      const res = await fetch(`${getApiUrl()}/api/v1/student/assignments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setStudentAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error("Błąd pobierania zadań studenta:", err);
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  const canDragNodes = Boolean(currentUser?.role === 'admin' && canMoveNodes);

  const filteredNodes = searchQuery
    ? nodes.filter((n) => (n.data.label as string).toLowerCase().includes(searchQuery.toLowerCase()))
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
        if (isMounted) {
          setCurrentUser(u);
          if (u && (u.role === 'student' || !u.role)) {
            fetchStudentClasses();
            fetchStudentAssignments();
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [fetchStudentClasses, fetchStudentAssignments]);

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
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("graph_selected_node_id");
      sessionStorage.removeItem("graph_zoom");
    }
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

  const fetchNodeLessons = useCallback(async (nodeId: string) => {
    setSidebarLessons([]);
    setLoadingLessons(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/v1/nodes/${nodeId}/lessons`);
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
  }, []);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/nodes`);
        if (res.ok) {
          const data = await res.json();
          if (!data.nodes || !data.edges) return;

          const initialNodeId = getInitialNodeId();

          const rawNodes: Node[] = data.nodes.map((n: any) => ({
            id: n.id,
            type: 'cyber',
            targetPosition: Position.Bottom,
            sourcePosition: Position.Top,
            position: { x: n.ui_x || 0, y: n.ui_y || 0 },
            data: { label: n.name, subtasksCount: n.subtasks_count },
            selected: initialNodeId ? n.id === initialNodeId : false,
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

          if (initialNodeId) {
            const matchedNode = rawNodes.find((n) => n.id === initialNodeId);
            if (matchedNode) {
              setSelectedNode(matchedNode);
              restoredNodeIdRef.current = initialNodeId;
              fetchNodeLessons(initialNodeId);
            } else {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("graph_selected_node_id");
                sessionStorage.removeItem("graph_zoom");
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching nodes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, [setNodes, setEdges, fetchNodeLessons]);

  useEffect(() => {
    if (
      rfInstance &&
      selectedNode &&
      restoredNodeIdRef.current === selectedNode.id &&
      !hasRestoredViewportRef.current
    ) {
      hasRestoredViewportRef.current = true;
      const initialZoom = getInitialZoom() || 1.0;
      const centerNode = () => {
        rfInstance.setCenter(
          selectedNode.position.x + NODE_WIDTH / 2,
          selectedNode.position.y + NODE_HEIGHT / 2,
          { zoom: initialZoom, duration: 0 }
        );
      };

      centerNode();
      requestAnimationFrame(centerNode);
      const t1 = setTimeout(centerNode, 50);
      const t2 = setTimeout(centerNode, 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [rfInstance, selectedNode]);

  const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    restoredNodeIdRef.current = node.id;
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );

    const currentZoom = rfInstance?.getZoom ? rfInstance.getZoom() : 1.0;
    const targetZoom = Math.max(currentZoom, 1.0);
    if (rfInstance) {
      rfInstance.setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + NODE_HEIGHT / 2, {
        zoom: targetZoom,
        duration: 600,
      });
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("graph_selected_node_id", node.id);
      sessionStorage.setItem("graph_zoom", String(targetZoom));
      window.history.replaceState(null, "", `/graph?node=${node.id}`);
    }

    fetchNodeLessons(node.id);
  }, [rfInstance, fetchNodeLessons, setNodes]);

  const onPaneClick = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null);
      restoredNodeIdRef.current = null;
      setNodes((prev) => prev.map((n) => ({ ...n, selected: false })));
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("graph_selected_node_id");
        sessionStorage.removeItem("graph_zoom");
        window.history.replaceState(null, "", "/graph");
      }
    }
  }, [selectedNode, setNodes]);

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
                    {filteredNodes.length > 0 ? filteredNodes.map((node) => (
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
                <UserProfileDrawer
                  currentUser={currentUser}
                  isOpen={isProfileOpen}
                  onToggleOpen={() => setIsProfileOpen(!isProfileOpen)}
                  profileRef={profileRef}
                  studentAssignments={studentAssignments}
                  loadingAssignments={loadingAssignments}
                  studentClasses={studentClasses}
                  loadingClasses={loadingClasses}
                  onOpenJoinModal={() => setIsJoinModalOpen(true)}
                  canMoveNodes={canMoveNodes}
                  onToggleMoveNodes={() => setCanMoveNodes(!canMoveNodes)}
                  savingLayout={savingLayout}
                  onSaveLayout={saveLayout}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* ReactFlow Interactive Canvas */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
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
              fitView={!restoredNodeIdRef.current}
              fitViewOptions={{ minZoom: 0.65, maxZoom: 1.3, padding: 0.2 }}
              onInit={setRfInstance}
              onMoveEnd={(_event, viewport) => {
                if (typeof window !== "undefined" && selectedNode) {
                  sessionStorage.setItem("graph_zoom", String(viewport.zoom));
                }
              }}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#000000" gap={26} size={1.8} variant={BackgroundVariant.Dots} style={{ opacity: 0.2 }} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </>
        )}
      </div>

      {/* Right Drawer Panel with Lessons */}
      <TopicLessonsSidebar
        selectedNode={selectedNode}
        sidebarLessons={sidebarLessons}
        loadingLessons={loadingLessons}
        onClose={() => {
          setSelectedNode(null);
          restoredNodeIdRef.current = null;
          setNodes((prev) => prev.map((n) => ({ ...n, selected: false })));
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("graph_selected_node_id");
            sessionStorage.removeItem("graph_zoom");
            window.history.replaceState(null, "", "/graph");
          }
        }}
        onSelectLesson={(lessonId) => {
          if (typeof window !== "undefined" && selectedNode) {
            sessionStorage.setItem("graph_selected_node_id", selectedNode.id);
            const currentZoom = rfInstance?.getZoom ? rfInstance.getZoom() : 1.0;
            sessionStorage.setItem("graph_zoom", String(currentZoom));
          }
          router.push(`/lesson/${lessonId}`);
        }}
      />

      {/* Modal: Dołącz do klasy */}
      <JoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={async () => {
          await fetchStudentClasses();
          await fetchStudentAssignments();
        }}
      />
    </div>
  );
}
