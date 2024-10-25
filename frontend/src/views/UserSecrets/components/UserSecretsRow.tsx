import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Td,
  Tr
} from "@app/components/v2";
import { TUserSecret } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

// convert screat types to a readable string
const readableSecretTypes = {
  webLogin: "Web Login",
  creditCard: "Credit Card",
  secureNote: "Secure Note"
} as any;

export const UserSecretsRow = ({
  row,
  handlePopUpOpen
}: {
  row: TUserSecret;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<
      ["viewUserSecret", "editUserSecret", "deleteUserSecretConfirmation"]
    >,
    rowData: TUserSecret
  ) => void;
}) => {
  return (
    <Tr
      key={row.id}
      className="h-10 cursor-pointer transition-colors duration-300 hover:bg-mineshaft-700"
    >
      <Td>{row.secretName ? `${row.secretName}` : "-"}</Td>
      <Td>{row.secretType ? `${readableSecretTypes[row.secretType]}` : "-"}</Td>
      <Td>{row.createdAt ? `${row.createdAt}` : "-"}</Td>
      <Td>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="rounded-lg">
            <div className="hover:text-primary-400 data-[state=open]:text-primary-400">
              <FontAwesomeIcon size="sm" icon={faEllipsis} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-1">
            <DropdownMenuItem
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handlePopUpOpen("viewUserSecret", row);
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handlePopUpOpen("editUserSecret", row);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handlePopUpOpen("deleteUserSecretConfirmation", row);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Td>
    </Tr>
  );
};
