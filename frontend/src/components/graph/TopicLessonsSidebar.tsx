"use client";

import { Fragment } from "react";
import { Node } from "@xyflow/react";
import { UserProfile } from "@/utils/auth";

interface TopicLessonsSidebarProps {
  selectedNode: Node | null;
  sidebarLessons: any[];
  loadingLessons: boolean;
  currentUser?: UserProfile | null;
  onToggleNodeVisibility?: (nodeId: string, currentHidden: boolean) => void;
  onToggleNodeBlock?: (nodeId: string, currentBlocked: boolean) => void; // alias
  onClose: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export default function TopicLessonsSidebar({
  selectedNode,
  sidebarLessons,
  loadingLessons,
  currentUser,
  onToggleNodeVisibility,
  onToggleNodeBlock,
  onClose,
  onSelectLesson,
}: TopicLessonsSidebarProps) {
  if (!selectedNode) return null;

  const toggleVisibilityHandler = onToggleNodeVisibility || onToggleNodeBlock;
  const nodeData = selectedNode.data as any;
  const isHidden = Boolean(nodeData?.isHidden ?? nodeData?.isBlocked);
  const isAdmin = currentUser?.role === "admin";

  return (
    <div
      className="fixed inset-0 w-full h-full z-50 flex flex-col bg-white md:relative md:w-[360px] md:h-full md:shrink-0 md:z-10 md:border-l-3 md:border-black md:shadow-[-6px_0px_0px_0px_#000]"
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '2.5px solid #000000',
          background: (isHidden && isAdmin) ? '#fef3c7' : 'var(--bg-deep)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: (isHidden && isAdmin) ? '#fde68a' : 'var(--neo-yellow)',
                color: (isHidden && isAdmin) ? '#92400e' : '#000000',
                border: '1.5px solid #000000',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.68rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                boxShadow: '1px 1px 0px 0px #000000',
                display: 'inline-block',
              }}
            >
              Temat
            </span>
            {isHidden && isAdmin && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1.5px solid #000000',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  boxShadow: '1px 1px 0px 0px #000000',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🔒 Zablokowany dla uczniów
              </span>
            )}
            {(() => {
              const passed = Number(nodeData?.passedTaskGroups) || 0;
              const total = Number(nodeData?.totalTaskGroups) || 0;
              const isDone = total > 0 && passed >= total;
              return (
                <span
                  style={{
                    background: isDone ? 'var(--neo-green)' : 'var(--neo-yellow)',
                    border: '1.5px solid #000000',
                    borderRadius: '4px',
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    boxShadow: '1px 1px 0px 0px #000000',
                    display: 'inline-block',
                  }}
                >
                  Zaliczone: {passed}/{total}
                </span>
              );
            })()}
          </div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#000000',
              margin: 0,
              lineHeight: '1.2',
              wordBreak: 'break-word',
            }}
          >
            {selectedNode.data.label as string}
          </h2>
        </div>
        <button
          onClick={onClose}
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block' }}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {/* Blocked Alert Banner for Students / Non-admin */}
        {isHidden && !isAdmin && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              background: '#fef3c7',
              border: '2px solid #000000',
              borderRadius: '10px',
              boxShadow: '3px 3px 0px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#92400e',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🔒</span>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>Lekcje są obecnie niedostępne</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#78350f', marginTop: '2px' }}>
                Materiały dla tego tematu są w trakcie przygotowywania.
              </div>
            </div>
          </div>
        )}

        {/* Blocked Alert Banner for Admin */}
        {isHidden && isAdmin && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              background: '#fef3c7',
              border: '2px solid #000000',
              borderRadius: '10px',
              boxShadow: '3px 3px 0px 0px #000000',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 900, color: '#92400e' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Węzeł zablokowany dla uczniów</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#451a03', fontWeight: 600, lineHeight: 1.35 }}>
              Uczniowie widzą ten węzeł na mapie, ale przyciski lekcji są dla nich zablokowane (brak pliku PDF).
            </p>
            {toggleVisibilityHandler && (
              <button
                onClick={() => toggleVisibilityHandler(selectedNode.id, isHidden)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                  padding: '5px 12px',
                  background: '#ffffff',
                  color: '#000000',
                  border: '1.5px solid #000000',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px 0px #000000',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = 'var(--neo-green)';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                <span>Odblokuj ten węzeł</span>
              </button>
            )}
          </div>
        )}

        {/* Admin manual block button if node is currently unblocked */}
        {!isHidden && isAdmin && toggleVisibilityHandler && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => toggleVisibilityHandler(selectedNode.id, isHidden)}
              style={{
                width: '100%',
                padding: '6px 10px',
                background: '#ffffff',
                color: '#92400e',
                border: '1.5px solid #000000',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px 0px #000000',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = '#fef3c7';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Zablokuj ten węzeł dla uczniów</span>
            </button>
          </div>
        )}

        <h3
          style={{
            fontSize: '0.82rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#4b5563',
            marginBottom: '15px',
          }}
        >
          Dostępne Lekcje
        </h3>

        {loadingLessons ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="w-8 h-8 border-3 border-black border-t-[var(--neo-yellow)] rounded-full animate-spin mx-auto mb-2" />
            <p style={{ color: '#000000', fontWeight: 700, fontSize: '0.8rem' }}>Ładowanie lekcji...</p>
          </div>
        ) : sidebarLessons.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sidebarLessons.map((lesson: any, index: number) => (
              <Fragment key={lesson.id}>
                <li
                  style={{
                    padding: '16px',
                    border: '2.5px solid #000000',
                    borderRadius: '12px',
                    cursor: (isHidden && !isAdmin) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    background: (isHidden && !isAdmin) ? '#f3f4f6' : '#ffffff',
                    opacity: (isHidden && !isAdmin) ? 0.65 : 1,
                    boxShadow: (isHidden && !isAdmin) ? '2px 2px 0px 0px #000000' : '4px 4px 0px 0px #000000',
                  }}
                  title={isHidden && !isAdmin ? "Lekcje w tym temacie są obecnie zablokowane" : undefined}
                  onClick={() => {
                    if (isHidden && !isAdmin) return;
                    onSelectLesson(lesson.id);
                  }}
                  onMouseEnter={(e: any) => {
                    if (isHidden && !isAdmin) return;
                    e.currentTarget.style.background = 'var(--neo-yellow)';
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000';
                  }}
                  onMouseLeave={(e: any) => {
                    if (isHidden && !isAdmin) return;
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: '#000000',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            display: 'inline-block',
                            background: (isHidden && !isAdmin) ? '#e5e7eb' : 'var(--neo-green)',
                            border: '1.5px solid #000000',
                            borderRadius: '4px',
                            padding: '1px 7px',
                            boxShadow: '1px 1px 0px 0px #000000',
                          }}
                        >
                          Lekcja {index + 1}
                        </span>
                        {(Boolean(lesson.has_pdf) || Boolean(lesson.pdf_url)) && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: '#000000',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: 'var(--neo-yellow)',
                              border: '1.5px solid #000000',
                              borderRadius: '4px',
                              padding: '1px 6px',
                              boxShadow: '1px 1px 0px 0px #000000',
                            }}
                          >
                            PDF
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: 0, color: (isHidden && !isAdmin) ? '#6b7280' : '#000000', fontSize: '0.98rem', fontWeight: 800, lineHeight: '1.25' }}>
                        {lesson.title}
                      </h4>
                    </div>
                    {isHidden && !isAdmin ? (
                      <span title="Lekcja zablokowana" style={{ fontSize: '1.1rem' }}>🔒</span>
                    ) : (
                      <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>&rarr;</span>
                    )}
                  </div>
                </li>

                {index < sidebarLessons.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '8px 0',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: 'var(--neo-yellow)',
                        border: '2px solid #000000',
                        boxShadow: '2px 2px 0px 0px #000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000000',
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 600 }}>
            Brak dostępnych lekcji dla tego tematu.
          </p>
        )}
      </div>
    </div>
  );
}
