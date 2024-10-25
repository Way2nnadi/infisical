import { faCheck, faCopy, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  EmptyState,
  IconButton,
  Table,
  TableContainer,
  TBody,
  Td,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { useTimedReset } from "@app/hooks";
import { TUserSecret } from "@app/hooks/api/userSecrets";

// [HACK ALERT] - This object is used to fliter in only the essential
// secret data instead of the whole object returned by the backend
const viewableSecretDataMap = {
  username: "Username",
  password: "Password",
  cardholderName: "Cardholder Name",
  cardNumber: "Card Number",
  cardExpirationDate: "Card Expiration Date",
  title: "Title",
  content: "Content",
  additionlNotes: "Additional Notes"
} as any;

export const UserSecretDetails = ({
  row = {
    id: "",
    userId: "",
    orgId: "",
    createdAt: "",
    updatedAt: "",
    secretType: "",
    secretName: ""
  }
}: {
  row?: TUserSecret;
}) => {
  const isUserSecretsEmpty = Object.entries(row).length === 0;
  const [copyState, isCopyingSecret, setCopyTextSecret] = useTimedReset<string>({
    initialState: ""
  });

  return (
    <TableContainer>
      <Table>
        <THead>
          <Tr>
            <Th>Secret</Th>
            <Th>Value</Th>
            <Th aria-label="button" className="w-5" />
          </Tr>
        </THead>
        <TBody>
          {!isUserSecretsEmpty &&
            Object.entries(row).reduce((sum, currentEntry) => {
              const [secret, value] = currentEntry;
              const secretReadableKey = viewableSecretDataMap[secret];

              if (secretReadableKey) {
                sum.push(
                  <Tr key={secret} className="hover:bg-mineshaft-700">
                    <Td>{secretReadableKey || "-"}</Td>
                    <Td>{value || "-"}</Td>
                    <Td>
                      <IconButton
                        key={secret}
                        ariaLabel="copy icon"
                        colorSchema="secondary"
                        className="button user-select-none relative inline-flex h-full cursor-pointer items-center justify-center rounded-md border-primary bg-transparent py-1 px-1 font-inter text-sm font-medium text-bunker-300 transition-all hover:text-primary hover:opacity-80"
                        onClick={() => {
                          navigator.clipboard.writeText(`${secret}: ${value}`);
                          setCopyTextSecret(secret);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={isCopyingSecret && copyState === secret ? faCheck : faCopy}
                        />
                      </IconButton>
                    </Td>
                  </Tr>
                );
              }

              return sum;
            }, [] as any)}
        </TBody>
      </Table>
      {isUserSecretsEmpty && <EmptyState title="No User Secrets" icon={faKey} />}
    </TableContainer>
  );
};
