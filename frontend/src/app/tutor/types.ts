export interface StudentAssignmentStatus {
  assignment_id: string;
  task_group_id: string;
  task_group_name: string;
  topic_name?: string;
  subtopic_name?: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  attempts_count?: number;
  success_count?: number;
  failed_count?: number;
  best_score?: number | null;
}

export interface StudentMember {
  id: string;
  name: string;
  email?: string;
  joined_at?: string;
  completed_assignments_count?: number;
  total_assignments_count?: number;
  assignments_status?: StudentAssignmentStatus[];
}

export interface ClassAssignment {
  id: string;
  task_group_id: string;
  task_group_name: string;
  subtopic_name?: string;
  topic_name?: string;
  chapter_name?: string;
  task_count: number;
  due_date?: string;
  note?: string;
  created_at?: string;
  completed_count?: number;
  total_students?: number;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  meet_link?: string;
  join_code: string;
  created_at?: string;
  members_count: number;
  students: StudentMember[];
  assignments?: ClassAssignment[];
}

export interface AvailableTaskGroup {
  id: string;
  name: string;
  subtopic_id: string;
  subtopic_name: string;
  topic_id: string;
  topic_name: string;
  chapter_id: string;
  chapter_name: string;
  task_count: number;
}
