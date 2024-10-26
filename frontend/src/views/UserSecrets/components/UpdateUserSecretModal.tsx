import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["editUserSecret"]>;
  handlePopUpToggle: (popUpName: keyof UsePopUpState<["editUserSecret"]>, state?: boolean) => void;
};

export const UpdateUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  const { data } = popUp.editUserSecret;
  return (
    <Modal
      isOpen={popUp?.editUserSecret?.isOpen}
      onOpenChange={(isOpen: boolean) => {
        handlePopUpToggle("editUserSecret", isOpen);
      }}
    >
      <ModalContent title="Edit Secret">
        <UserSecretForm rowData={data} />
      </ModalContent>
    </Modal>
  );
};
