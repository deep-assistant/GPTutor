export enum TopicType {
  LESSON = "LESSON",
  CONVERSATION_STARTER = "CONVERSATION_STARTER", 
  ADDITIONAL_REQUEST = "ADDITIONAL_REQUEST",
}

export enum SuggestionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface TopicSuggestion {
  id: string;
  title: string;
  description: string;
  type: TopicType;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TopicSuggestionCreate {
  title: string;
  description: string;
  type: TopicType;
}

export interface TopicSuggestionUpdate {
  id: string;
  title?: string;
  description?: string;
  type?: TopicType;
  status?: SuggestionStatus;
}