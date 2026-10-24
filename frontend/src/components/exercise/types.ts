export type ViewMode = "LOBBY" | "PRACTICE" | "EXAM" | "EXAM_RESULT";

export interface ParsedTaskContent {
  contentObj: any;
  taskType: string;
  isTrueFalse: boolean;
  isOpen: boolean;
  isMcq: boolean;
}

export const parseTaskContent = (task: any): ParsedTaskContent => {
  let contentObj: any = {};
  try {
    contentObj = typeof task.content === "string" ? JSON.parse(task.content) : task.content;
  } catch {
    contentObj = { question: task.content };
  }
  const taskType = task.task_type || (contentObj.statements ? "TRUE_FALSE" : contentObj.options ? "MCQ" : "OPEN");
  const isTrueFalse = taskType === "TRUE_FALSE" || (contentObj.statements && Array.isArray(contentObj.statements));
  const isOpen = taskType === "OPEN" || (!isTrueFalse && contentObj.correct_answer !== undefined);
  const isMcq = !isTrueFalse && !isOpen;
  return { contentObj, taskType, isTrueFalse, isOpen, isMcq };
};
