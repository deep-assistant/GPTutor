import {
  LessonSuggestion,
  LessonSuggestionCreate,
  LessonSuggestionUpdate,
} from "$/entity/lessonSuggestion/types";
import { httpService } from "$/services/HttpService";

export function createLessonSuggestion(
  params: LessonSuggestionCreate
): Promise<LessonSuggestion> {
  return httpService
    .post("lesson-suggestion", params)
    .then((res) => res.json());
}

export function getLessonSuggestions(): Promise<LessonSuggestion[]> {
  return httpService.get("lesson-suggestion").then((res) => res.json());
}

export function getAllLessonSuggestions(): Promise<LessonSuggestion[]> {
  return httpService.get("lesson-suggestion/all").then((res) => res.json());
}

export function getLessonSuggestionsByStatus(
  status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<LessonSuggestion[]> {
  return httpService
    .get(`lesson-suggestion/status/${status}`)
    .then((res) => res.json());
}

export function deleteLessonSuggestionById(id: string) {
  return httpService.delete(`lesson-suggestion/${id}`);
}

export function updateLessonSuggestion(params: LessonSuggestionUpdate) {
  return httpService
    .put("lesson-suggestion", params)
    .then((res) => res.json());
}