"use client";

import { useRouter } from "next/navigation";
import { UserProfile } from "@/utils/auth";

interface UserProfileDrawerProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onToggleOpen: () => void;
  profileRef: React.RefObject<HTMLDivElement>;
  studentAssignments: any[];
  loadingAssignments: boolean;
  studentClasses: any[];
  loadingClasses: boolean;
  onOpenJoinModal: () => void;
  canMoveNodes: boolean;
  onToggleMoveNodes: () => void;
  savingLayout: boolean;
  onSaveLayout: () => void;
  hidingNodes?: boolean;
  onHideNodesWithoutPdf?: () => void;
  onUnhideAllNodes?: () => void;
  onLogout: () => void;
}

export default function UserProfileDrawer({
  currentUser,
  isOpen,
  onToggleOpen,
  profileRef,
  studentAssignments,
  loadingAssignments,
  studentClasses,
  loadingClasses,
  onOpenJoinModal,
  canMoveNodes,
  onToggleMoveNodes,
  savingLayout,
  onSaveLayout,
  hidingNodes = false,
  onHideNodesWithoutPdf,
  onUnhideAllNodes,
  onLogout,
}: UserProfileDrawerProps) {
  const router = useRouter();

  const pendingAssignmentsCount = studentAssignments.filter((a) => !a.is_completed).length;

  return (
    <div ref={profileRef} style={{ position: 'relative' }}>
      <button
        onClick={onToggleOpen}
        title="Profil użytkownika"
        style={{
          position: 'relative',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: isOpen ? 'var(--neo-yellow)' : '#ffffff',
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
          if (!isOpen) {
            e.currentTarget.style.background = '#ffffff';
          }
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        {/* Notification badge for pending assignments */}
        {pendingAssignmentsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--neo-pink)',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '50%',
              minWidth: '20px',
              height: '20px',
              padding: '0 4px',
              fontSize: '0.68rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '1.5px 1.5px 0px #000',
            }}
          >
            {pendingAssignmentsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '52px',
            right: 0,
            width: '340px',
            maxHeight: '82vh',
            overflowY: 'auto',
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
                  : currentUser.email
                    ? currentUser.email.split('@')[0]
                    : 'Użytkownik'}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background:
                    currentUser.role === 'admin'
                      ? 'var(--neo-yellow)'
                      : currentUser.role === 'tutor'
                        ? 'var(--neo-blue)'
                        : 'var(--neo-green)',
                  color: '#000000',
                  border: '1.5px solid #000000',
                  boxShadow: '1px 1px 0px 0px #000000',
                }}
              >
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'tutor' ? 'Korepetytor' : 'Uczeń'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {currentUser.email}
            </span>
          </div>

          {/* Student Assignments Section: Zadania do zrobienia */}
          {currentUser.role !== 'tutor' && (
            <div style={{ paddingBottom: '10px', borderBottom: '2px solid #000000', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#111827' }}>
                    Zadania do zrobienia
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      background: pendingAssignmentsCount > 0 ? 'var(--neo-pink)' : '#e5e7eb',
                      color: '#000000',
                      border: '1.2px solid #000',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      boxShadow: '1px 1px 0px #000',
                    }}
                  >
                    {pendingAssignmentsCount}
                  </span>
                </div>
              </div>

              {loadingAssignments ? (
                <div style={{ fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic', padding: '4px 0' }}>
                  Wczytywanie zadań...
                </div>
              ) : studentAssignments.length === 0 ? (
                <div
                  style={{
                    padding: '8px 10px',
                    background: 'var(--bg-deep)',
                    border: '1.5px dashed #9ca3af',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    color: '#4b5563',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Brak przydzielonych zadań
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '190px', overflowY: 'auto', paddingRight: '2px' }}>
                  {studentAssignments.map((a) => {
                    const isDone = a.is_completed;
                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          onToggleOpen();
                          router.push(`/exercise/${a.task_group_id}?from=/graph`);
                        }}
                        style={{
                          padding: '9px 11px',
                          background: isDone ? '#f0fdf4' : '#ffffff',
                          border: '1.8px solid #000000',
                          borderRadius: '9px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          boxShadow: '2.5px 2.5px 0px 0px #000000',
                          transition: 'all 0.15s ease',
                          opacity: isDone ? 0.75 : 1,
                        }}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.transform = 'translate(-1px, -1px)';
                          e.currentTarget.style.boxShadow = '3.5px 3.5px 0px 0px #000000';
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '2.5px 2.5px 0px 0px #000000';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#000000', lineHeight: 1.25 }}>
                              {a.task_group_name}
                            </div>
                            <div style={{ fontSize: '0.64rem', color: '#4b5563', fontWeight: 700, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.topic_name} {a.subtopic_name ? `- ${a.subtopic_name}` : ''}
                            </div>
                          </div>
                          <div
                            title={isDone ? "Zadanie zaliczone: zdano test (min. 80%)" : "Do zaliczenia: zdaj test (min. 80%)"}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '5px',
                              border: '1.5px solid #000',
                              background: isDone ? 'var(--neo-green)' : 'var(--neo-yellow)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.62rem',
                              fontWeight: 900,
                              flexShrink: 0,
                              boxShadow: '1px 1px 0px #000',
                              color: '#000',
                            }}
                          >
                            {isDone ? '✓ Zaliczone' : '⏳ Do testu'}
                          </div>
                        </div>

                        {a.note && (
                          <div
                            style={{
                              fontSize: '0.65rem',
                              color: '#1f2937',
                              background: 'var(--bg-deep)',
                              padding: '3px 6px',
                              borderRadius: '5px',
                              fontStyle: 'italic',
                              borderLeft: '2.5px solid var(--neo-yellow)',
                            }}
                          >
                            {a.note}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', fontSize: '0.64rem', color: '#4b5563', fontWeight: 700 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.class_name}
                          </span>
                        </div>

                        {a.due_date && (
                          <div style={{ fontSize: '0.62rem', color: '#b91c1c', fontWeight: 800 }}>
                            Termin: {new Date(a.due_date).toLocaleDateString('pl-PL')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Student Classes Section (Only for student or unassigned role) */}
          {currentUser.role !== 'tutor' && (
            <div style={{ paddingBottom: '10px', borderBottom: '2px solid #000000', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#374151' }}>
                  Moje Klasy ({studentClasses.length})
                </span>
                <button
                  type="button"
                  onClick={onOpenJoinModal}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    background: 'var(--neo-yellow)',
                    border: '1.5px solid #000',
                    borderRadius: '6px',
                    padding: '2px 7px',
                    cursor: 'pointer',
                    boxShadow: '1.5px 1.5px 0px #000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                  title="Dołącz do nowej klasy"
                >
                  <span>+</span> Dołącz
                </button>
              </div>

              {loadingClasses ? (
                <div style={{ fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic', padding: '4px 0' }}>
                  Wczytywanie klas...
                </div>
              ) : studentClasses.length === 0 ? (
                <div
                  style={{
                    padding: '8px 10px',
                    background: 'var(--bg-deep)',
                    border: '1.5px dashed #9ca3af',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    color: '#4b5563',
                    textAlign: 'center',
                  }}
                >
                  Nie należysz jeszcze do żadnej klasy.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '2px' }}>
                  {studentClasses.map((cls) => (
                    <div
                      key={cls.id}
                      style={{
                        padding: '9px 11px',
                        background: '#f8fafc',
                        border: '1.5px solid #000000',
                        borderRadius: '9px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cls.name}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 900, background: 'var(--neo-green)', border: '1px solid #000', padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                          {cls.join_code}
                        </span>
                      </div>

                      {/* Nauczyciel */}
                      <div style={{ fontSize: '0.7rem', color: '#374151', fontWeight: 700 }}>
                        Nauczyciel: <span style={{ color: '#000000', fontWeight: 800 }}>{cls.tutor_name}</span>
                      </div>

                      {/* Godziny lekcji */}
                      {cls.schedule && (
                        <div
                          style={{
                            width: '100%',
                            minHeight: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: '#000000',
                            background: 'var(--neo-yellow)',
                            border: '1.5px solid #000000',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            boxShadow: '1.5px 1.5px 0px #000000',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cls.schedule}
                          </span>
                        </div>
                      )}

                      {/* Google Meet Link */}
                      {cls.meet_link ? (
                        <a
                          href={cls.meet_link.startsWith('http') ? cls.meet_link : `https://${cls.meet_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            width: '100%',
                            minHeight: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: '#000000',
                            background: 'white',
                            border: '1.5px solid #000000',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            boxShadow: '1.5px 1.5px 0px #000000',
                            textDecoration: 'none',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                          onMouseEnter={(e: any) => {
                            e.currentTarget.style.background = 'var(--neo-blue)';
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Google Meet &rarr;
                          </span>
                        </a>
                      ) : (
                        <div style={{ fontSize: '0.62rem', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>
                          Brak linku do spotkań
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tutor Portal Navigation Button */}
          {(currentUser.role === 'tutor' || currentUser.role === 'admin') && (
            <div style={{ paddingBottom: '10px', borderBottom: '2px solid #000000' }}>
              <button
                onClick={() => {
                  onToggleOpen();
                  router.push('/tutor');
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--neo-blue)',
                  color: '#000000',
                  border: '2px solid #000000',
                  borderRadius: '9px',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '2.5px 2.5px 0px 0px #000000',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  e.currentTarget.style.boxShadow = '3.5px 3.5px 0px 0px #000000';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '2.5px 2.5px 0px 0px #000000';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Panel Korepetytora</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>&rarr;</span>
              </button>
            </div>
          )}

          {/* Admin Tools: Unlock Movement & Save Layout */}
          {currentUser.role === 'admin' && (
            <div style={{ paddingBottom: '10px', borderBottom: '2px solid #000000', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={onToggleMoveNodes}
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
                    <span>Koniec edycji węzłów</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Edycja węzłów</span>
                  </>
                )}
              </button>

              <button
                onClick={onSaveLayout}
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

              {onHideNodesWithoutPdf && (
                <button
                  onClick={onHideNodesWithoutPdf}
                  disabled={hidingNodes}
                  title="Zablokuj uczniom dostęp do lekcji w węzłach, które nie mają wrzuconego pliku PDF w żadnej ze swoich lekcji"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: hidingNodes ? '#e5e7eb' : '#fee2e2',
                    color: '#991b1b',
                    border: '2px solid #000000',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: hidingNodes ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '2px 2px 0px 0px #000000',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e: any) => {
                    if (!hidingNodes) {
                      e.currentTarget.style.transform = 'translate(-1px, -1px)';
                      e.currentTarget.style.boxShadow = '3.5px 3.5px 0px 0px #000000';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>{hidingNodes ? 'Blokowanie węzłów...' : 'Zablokuj węzły bez PDF'}</span>
                </button>
              )}

              {onUnhideAllNodes && (
                <button
                  onClick={onUnhideAllNodes}
                  disabled={hidingNodes}
                  title="Odblokuj dostęp do lekcji we wszystkich węzłach dla uczniów"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: hidingNodes ? '#e5e7eb' : '#ffffff',
                    color: '#000000',
                    border: '2px solid #000000',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: hidingNodes ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '2px 2px 0px 0px #000000',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e: any) => {
                    if (!hidingNodes) {
                      e.currentTarget.style.transform = 'translate(-1px, -1px)';
                      e.currentTarget.style.boxShadow = '3.5px 3.5px 0px 0px #000000';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                  <span>Odblokuj wszystkie węzły</span>
                </button>
              )}
            </div>
          )}

          {/* Bottom Logout Button */}
          <button
            onClick={onLogout}
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
  );
}
