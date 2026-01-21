import { defineComponent, h } from "vue";
import type { ModalApiOptions, UseModalReturnType } from "./types";
import { ModalApi } from "./modal-api";
import Modal from "./Modal.vue";

export function useKunkkaModal(
  options: ModalApiOptions = {}
): UseModalReturnType {
  const api = new ModalApi(options);

  const ConnectedModal = defineComponent({
    name: "KunkkaConnectedModal",
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          Modal,
          {
            ...api.state,
            ...attrs,
          },
          slots
        );
    },
  });

  return [ConnectedModal, api] as const;
}
