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
      style={{
        width: '360px',
        background: '#ffffff',
        borderLeft: '3px solid #000000',
        boxShadow: '-6px 0px 0px 0px #000000',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '2.5px solid #000000',
          background: isHidden ? '#fef3c7' : 'var(--bg-deep)',
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
                background: isHidden ? '#fde68a' : 'var(--neo-yellow)',
                color: isHidden ? '#92400e' : '#000000',
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
            {isHidden && (
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
                  gap: '3px',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                Ukryty przed uczniami
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
        {/* Hidden Alert Banner for Admin */}
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
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <span>Węzeł ukryty przed uczniami</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#451a03', fontWeight: 600, lineHeight: 1.35 }}>
              Ten węzeł nie jest widoczny dla zwykłych użytkowników na mapie wiedzy. Widzisz go jako administrator.
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Odkryj ten węzeł</span>
              </button>
            )}
          </div>
        )}

        {/* Admin manual hide button if node is currently visible */}
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
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <span>Ukryj ten węzeł przed uczniami</span>
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
                            background: 'var(--neo-green)',
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
                      <h4 style={{ margin: 0, color: '#000000', fontSize: '0.98rem', fontWeight: 800, lineHeight: '1.25' }}>
                        {lesson.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>&rarr;</span>
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
