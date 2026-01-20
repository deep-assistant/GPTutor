import { sig } from "dignals";
import { TopicSuggestionItem } from "./TopicSuggestionItem";
import {
  createTopicSuggestion,
  deleteTopicSuggestionById,
  getTopicSuggestions,
  updateTopicSuggestionById,
} from "$/api/topicSuggestion";
import { TopicSuggestionCreate, TopicSuggestionUpdate } from "./types";

class TopicSuggestions {
  suggestions$ = sig(new Set<TopicSuggestionItem>());

  async init() {
    await this.initSuggestions();
  }

  async initSuggestions() {
    const suggestions = await getTopicSuggestions();

    this.suggestions$.set(
      new Set(
        suggestions.map(
          ({ id, title, description, type, status, createdAt, updatedAt }) =>
            new TopicSuggestionItem(id, title, description, type, status, createdAt, updatedAt)
        )
      )
    );
  }

  async createSuggestion(suggestion: TopicSuggestionCreate) {
    const topicSuggestion = await createTopicSuggestion(suggestion);

    const set = new Set(this.suggestions$.get());
    set.add(
      new TopicSuggestionItem(
        topicSuggestion.id,
        suggestion.title,
        suggestion.description,
        suggestion.type,
        topicSuggestion.status,
        topicSuggestion.createdAt,
        topicSuggestion.updatedAt
      )
    );

    this.suggestions$.set(set);
  }

  async deleteSuggestion(suggestion: TopicSuggestionItem) {
    await deleteTopicSuggestionById(suggestion.id);

    const set = new Set(this.suggestions$.get());
    set.delete(suggestion);

    this.suggestions$.set(set);
  }

  updateTopicSuggestion = async (suggestion: TopicSuggestionItem) => {
    await updateTopicSuggestionById({
      id: suggestion.id,
      title: suggestion.title$.get(),
      description: suggestion.description$.get(),
      type: suggestion.type$.get(),
      status: suggestion.status$.get(),
    });
  };
}

export const topicSuggestions = new TopicSuggestions();