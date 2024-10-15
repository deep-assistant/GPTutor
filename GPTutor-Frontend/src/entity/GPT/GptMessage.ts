import { sig, Signal } from "dignals";
import { GPTRoles } from "./types";

let id = 0;

export class GptMessage {
  energy = sig(0);
  content$: Signal<string>;
  isSelected$ = sig<boolean>(false);

  failedModeration$ = sig<boolean>(false);

  isRunOutOfContext = sig<boolean>(false);

  id: number = id;

  constructor(
    message: string,
    public role: GPTRoles,
    public inLocal?: boolean,
    public isError?: boolean
  ) {
    this.content$ = sig(message);
    id++;
  }

  onSetMessageContent = (value: string) => {
    this.content$.set(this.content$.get() + value);
  };

  toggleSelected() {
    this.isSelected$.set(!this.isSelected$.get());
  }

  select() {
    this.isSelected$.set(true);
  }

  unselect() {
    this.isSelected$.set(false);
  }

  toggleRunOutOff() {
    this.isRunOutOfContext.set(true);
  }

  setEnergy = (energy: number) => {
    this.energy.set(energy);
  };
}
