export interface LessonSuggestion {
  id: string;
  lessonName: string;
  description: string;
  category: string;
  content: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface LessonSuggestionCreate {
  lessonName: string;
  description: string;
  category: string;
  content: string;
}

export interface LessonSuggestionUpdate {
  id: string;
  lessonName: string;
  description: string;
  category: string;
  content: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}