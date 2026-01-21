import { reactive } from "vue";
import type { ModalApiOptions, ModalMethods, ModalProps } from "./types";

export class ModalApi implements ModalMethods {
  public state: ModalProps;

  constructor(options: ModalApiOptions = {}) {
    this.state = reactive<ModalProps>({
      modelValue: false,
      ...options,
    });
  }

  open = () => {
    this.setState({ modelValue: true });
    this.state.onVisibleChange?.(true);
  };

  close = () => {
    this.setState({ modelValue: false });
    this.state.onVisibleChange?.(false);
  };

  setState(
    stateOrFn: ((prev: ModalProps) => Partial<ModalProps>) | Partial<ModalProps>
  ) {
    if (typeof stateOrFn === "function") {
      const newState = stateOrFn(this.state);
      Object.assign(this.state, newState);
    } else {
      Object.assign(this.state, stateOrFn);
    }
    return this;
  }
}
