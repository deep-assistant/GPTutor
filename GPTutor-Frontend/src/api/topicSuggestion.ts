import {
  TopicSuggestion,
  TopicSuggestionCreate,
  TopicSuggestionUpdate,
  TopicType,
  SuggestionStatus,
} from "$/entity/topicSuggestion/types";
import { httpService } from "$/services/HttpService";

export function createTopicSuggestion(
  params: TopicSuggestionCreate
): Promise<TopicSuggestion> {
  return httpService
    .post("topic-suggestion", params)
    .then((res) => res.json());
}

export function getTopicSuggestions(): Promise<TopicSuggestion[]> {
  return httpService.get("topic-suggestion").then((res) => res.json());
}

export function getAllTopicSuggestions(): Promise<TopicSuggestion[]> {
  return httpService.get("topic-suggestion/all").then((res) => res.json());
}

export function getTopicSuggestionsByStatus(
  status: SuggestionStatus
): Promise<TopicSuggestion[]> {
  return httpService
    .get(`topic-suggestion/status/${status}`)
    .then((res) => res.json());
}

export function getTopicSuggestionsByType(
  type: TopicType
): Promise<TopicSuggestion[]> {
  return httpService
    .get(`topic-suggestion/type/${type}`)
    .then((res) => res.json());
}

export function deleteTopicSuggestionById(id: string) {
  return httpService.delete(`topic-suggestion/${id}`);
}

export function updateTopicSuggestionById(params: TopicSuggestionUpdate) {
  return httpService
    .put("topic-suggestion", params)
    .then((res) => res.json());
}