-- Migration V13: Synchronize assignment completions with passed test attempts

INSERT INTO public.assignment_completions (assignment_id, student_id, completed_at)
SELECT ca.id, ta.student_id, MIN(ta.completed_at)
FROM public.task_group_test_attempts ta
JOIN public.class_assignments ca ON ta.task_group_id = ca.task_group_id
JOIN public.class_members cm ON ca.class_id = cm.class_id AND cm.student_id = ta.student_id
WHERE ta.passed = true
GROUP BY ca.id, ta.student_id
ON CONFLICT (assignment_id, student_id) DO NOTHING;
