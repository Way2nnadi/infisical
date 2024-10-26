import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretDetails } from "./UserSecretDetails";

type Props = {
  popUp: UsePopUpState<["viewUserSecret"]>;
  handlePopUpToggle: (popUpName: keyof UsePopUpState<["viewUserSecret"]>, state?: boolean) => void;
};

export const ViewUserSecretsModal = ({ popUp, handlePopUpToggle }: Props) => {
  const { data } = popUp.viewUserSecret;

  return (
    <Modal
      isOpen={popUp?.viewUserSecret?.isOpen}
      onOpenChange={(isOpen: boolean) => {
        handlePopUpToggle("viewUserSecret", isOpen);
      }}
    >
      <ModalContent title={data?.secretName || "User Secret Details"}>
        <UserSecretDetails row={data} />
      </ModalContent>
    </Modal>
  );
};
