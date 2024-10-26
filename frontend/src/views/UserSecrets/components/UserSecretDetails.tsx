import { faCheck, faCopy, faEye, faEyeSlash, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Button,
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
import { useTimedReset, useToggle } from "@app/hooks";
import { TUserSecret } from "@app/hooks/api/userSecrets";

import { SecretTypes } from "./types";

// [HACK ALERT] - This object is used to fliter in only the essential
// secret data instead of the whole object returned by the backend
// Additionally, this is used to control secret default visibility
const viewableSecretKeyDataMap = {
  username: { value: "Username", secretType: SecretTypes.WebLogin },
  password: { value: "Password", secretType: SecretTypes.WebLogin, canHide: true },
  cardholderName: { value: "Cardholder Name", secretType: SecretTypes.CreditCard },
  cardNumber: { value: "Card Number", secretType: SecretTypes.CreditCard, canHide: true },
  cardExpirationDate: { value: "Expiration Date", secretType: SecretTypes.CreditCard },
  cardSecurityCode: { value: "Security Code", secretType: SecretTypes.CreditCard, canHide: true },
  title: { value: "Title", secretType: SecretTypes.SecureNote },
  content: { value: "Content", secretType: SecretTypes.SecureNote },
  additionalNotes: { value: "Additional Notes", secretType: SecretTypes.Any }
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
  const [isSecretVisible, setIsSecretVisible] = useToggle();

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      {row.secretType !== "secureNote" && (
        <div className="mb-4 flex justify-between">
          <Button
            variant="outline_bg"
            leftIcon={<FontAwesomeIcon icon={isSecretVisible ? faEyeSlash : faEye} />}
            onClick={() => setIsSecretVisible.toggle()}
          >
            {isSecretVisible ? "Hide Values" : "Reveal Values"}
          </Button>
        </div>
      )}

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
                const secretKeyData = viewableSecretKeyDataMap[secret];
                const secretType = secretKeyData?.secretType;
                const secretReadableKey = secretKeyData?.value;

                const shouldRenderSecretItem =
                  secretType === row.secretType || secretType === SecretTypes.Any;

                const shouldBeInvisible = !isSecretVisible && secretKeyData?.canHide;
                const potentialInvisiableValue = shouldBeInvisible ? "********************" : value;

                if (shouldRenderSecretItem) {
                  sum.push(
                    <Tr key={secret} className="hover:bg-mineshaft-700">
                      <Td>{secretReadableKey || "-"}</Td>
                      <Td width="250px">{potentialInvisiableValue || "-"}</Td>
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
    </div>
  );
};
