import { sig } from "dignals";
import { TopicType, SuggestionStatus } from "./types";

export class TopicSuggestionItem {
  id: string;
  title$ = sig("");
  description$ = sig("");
  type$ = sig<TopicType>(TopicType.CONVERSATION_STARTER);
  status$ = sig<SuggestionStatus>(SuggestionStatus.PENDING);
  createdAt: string;
  updatedAt: string;

  constructor(
    id: string,
    title: string,
    description: string,
    type: TopicType,
    status: SuggestionStatus,
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.title$.set(title);
    this.description$.set(description);
    this.type$.set(type);
    this.status$.set(status);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}