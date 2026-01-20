export class ActionSuggestion {
  text: string;
  name: string;

  constructor(text: string, name?: string) {
    this.text = text;
    this.name = name || text;
  }
}