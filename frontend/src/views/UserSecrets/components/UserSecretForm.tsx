import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
// eslint-disable-next-line import/no-extraneous-dependencies
import { isEqual, pick } from "lodash-es";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, Select, SelectItem } from "@app/components/v2";
import { useCreateUserSecret, useUpdateUserSecret } from "@app/hooks/api";
import { TUpdateUserSecretRequest, TUserSecret } from "@app/hooks/api/userSecrets";

import { SecretTypes } from "./types";

// Secret Types Options
const secretTypeOptions = [
  { label: "Web Login", value: SecretTypes.WebLogin },
  { label: "Credit Card", value: SecretTypes.CreditCard },
  { label: "Secure Note", value: SecretTypes.SecureNote }
];

const userSecretsBaseSchema = z.object({
  secretType: z.string(),
  secretName: z.string(),
  // Login Secrets
  username: z.string().optional(),
  password: z.string().optional(),
  // Card Secrets
  cardholderName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpirationDate: z.string().optional(),
  cardSecurityCode: z.string().optional(),
  // Secure Notes
  title: z.string().optional(),
  content: z.string().optional(),
  // Used across Login, Card and Secure Notes
  additionalNotes: z.string().optional()
});

const userSecretsUpdateSchema = userSecretsBaseSchema.extend({
  secretType: z.string().optional(),
  secretName: z.string().optional()
});

export type FormData = z.infer<typeof userSecretsBaseSchema>;

export const UserSecretForm = ({ rowData }: { rowData?: TUserSecret }) => {
  // Determine is there is already a secret type - for editing flow
  const secretType = rowData?.secretType as any;
  const hasSecretType = Boolean(secretType);

  if (hasSecretType) {
    console.log(hasSecretType, secretType, rowData);
  }

  const [selectedSecretType, setSelectedSecretType] = useState(secretType || "webLogin");
  const [createUserSecretStatus, setCreateUserSecretStatus] = useState("");
  const createUserSecret = useCreateUserSecret();
  const updateUserSecret = useUpdateUserSecret();

  const isWebLogin = selectedSecretType === "webLogin";
  const isCreditCard = selectedSecretType === "creditCard";
  const isSecureNote = selectedSecretType === "secureNote";

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(userSecretsBaseSchema)
  });

  const onFormCreateSubmit = async (data: FormData) => {
    try {
      const { status } = await createUserSecret.mutateAsync(data);
      setCreateUserSecretStatus(status);

      reset();

      createNotification({
        text: "Successfully created a created user secret",
        type: "success"
      });
    } catch (error) {
      setCreateUserSecretStatus("SUCCESS");

      createNotification({
        text: "Failed to create a user secret",
        type: "error"
      });
    }
  };

  const onFormEditSubmit = async (data: z.infer<typeof userSecretsUpdateSchema>) => {
    try {
      let requestData = {} as TUpdateUserSecretRequest;

      // get same keys from updated user secrets
      const updatedUserSecretKeys = Object.keys(data);

      // Get the previous values for these keys
      const previousUserSecretKeys = pick(rowData, updatedUserSecretKeys);

      // compare previous values to the updated form values
      const hasUpdatedData = !isEqual(previousUserSecretKeys, data);

      if (rowData && hasUpdatedData) {
        requestData = {
          ...data,
          id: rowData.id,
          secretType: rowData.secretType
        };

        const { status } = await updateUserSecret.mutateAsync(requestData);
        setCreateUserSecretStatus(status);

        createNotification({
          text: "Successfully updated user secret",
          type: "success"
        });
      } else {
        createNotification({
          text: "There were no changed values",
          type: "warning"
        });
      }
    } catch (error) {
      createNotification({
        text: "Failed to create a user secret",
        type: "error"
      });
    }
  };

  const onFormSubmit = hasSecretType ? onFormEditSubmit : onFormCreateSubmit;

  const isSecretCreationSuccess = createUserSecretStatus === "SUCCESS";

  return !isSecretCreationSuccess ? (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="secretType"
        defaultValue={hasSecretType ? rowData?.secretType : "webLogin"}
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl
            label="Secret Type"
            errorText={error?.message}
            isError={Boolean(error)}
            isRequired={!hasSecretType}
          >
            <Select
              defaultValue={hasSecretType ? secretType : "webLogin"}
              {...field}
              onValueChange={(e) => {
                onChange(e);
                setSelectedSecretType(e);
              }}
              className="w-full"
              isDisabled={hasSecretType}
            >
              {secretTypeOptions.map(({ label, value: expiresInValue }) => (
                <SelectItem value={String(expiresInValue || "")} key={label}>
                  {label}
                </SelectItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="secretName"
        defaultValue={hasSecretType ? rowData?.secretName : ""}
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label={isSecureNote ? "Title" : "Name"}
            isError={Boolean(error)}
            errorText={error?.message}
            isRequired={!hasSecretType}
          >
            <Input
              {...field}
              placeholder="Dashboard Login"
              defaultValue={hasSecretType ? rowData?.secretName : ""}
              type="text"
            />
          </FormControl>
        )}
      />

      {isWebLogin && (
        <>
          <Controller
            control={control}
            name="username"
            defaultValue={hasSecretType ? rowData?.username : ""}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Username"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!hasSecretType}
              >
                <Input
                  {...field}
                  placeholder="Username"
                  defaultValue={hasSecretType ? rowData?.username : ""}
                  type="text"
                />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            defaultValue={hasSecretType ? rowData?.password : ""}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Password"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!hasSecretType}
              >
                <Input
                  {...field}
                  placeholder="Password"
                  defaultValue={hasSecretType ? rowData?.password : ""}
                  type="password"
                />
              </FormControl>
            )}
          />
        </>
      )}

      {isCreditCard && (
        <>
          <Controller
            control={control}
            name="cardholderName"
            defaultValue={hasSecretType ? rowData?.cardholderName : ""}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Cardholder Name"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!hasSecretType}
              >
                <Input
                  {...field}
                  placeholder="John Doe"
                  defaultValue={hasSecretType ? rowData?.cardholderName : ""}
                  type="text"
                />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="cardNumber"
            defaultValue={hasSecretType ? rowData?.cardNumber : ""}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Card Number"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!hasSecretType}
              >
                <Input
                  {...field}
                  placeholder="1234 1234 1234 1234"
                  defaultValue={hasSecretType ? rowData?.cardNumber : ""}
                  type="text"
                />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="cardExpirationDate"
            defaultValue={hasSecretType ? rowData?.cardExpirationDate : ""}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Expiration Date"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!hasSecretType}
              >
                <Input
                  {...field}
                  placeholder="12/24"
                  defaultValue={hasSecretType ? rowData?.cardExpirationDate : ""}
                  type="text"
                />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="cardSecurityCode"
            defaultValue={hasSecretType ? rowData?.cardSecurityCode : ""}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Security Code"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!hasSecretType}
              >
                <Input
                  {...field}
                  placeholder="123"
                  defaultValue={hasSecretType ? rowData?.cardSecurityCode : ""}
                  type="text"
                />
              </FormControl>
            )}
          />
        </>
      )}

      {isSecureNote && (
        <Controller
          control={control}
          name="content"
          defaultValue={hasSecretType ? rowData?.content : ""}
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Content"
              isError={Boolean(error)}
              errorText={error?.message}
              className="mb-2"
              isRequired={!hasSecretType}
            >
              <textarea
                placeholder="Enter your secure note..."
                defaultValue={hasSecretType ? rowData?.content : ""}
                {...field}
                className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
              />
            </FormControl>
          )}
        />
      )}

      <Controller
        control={control}
        name="additionalNotes"
        defaultValue={hasSecretType ? rowData?.additionalNotes : ""}
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label="Additional Notes"
            isError={Boolean(error)}
            errorText={error?.message}
            className="mb-2"
          >
            <textarea
              placeholder="Provide more details about your user secrets..."
              defaultValue={hasSecretType ? rowData?.additionalNotes : ""}
              {...field}
              className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
            />
          </FormControl>
        )}
      />
      <Button
        className="mt-4"
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        {hasSecretType ? "Edit user secret" : "Create user secret"}
      </Button>
    </form>
  ) : (
    <Button
      className="mt-4 w-full bg-mineshaft-700 py-3 text-bunker-200"
      colorSchema="primary"
      variant="outline_bg"
      size="sm"
      onClick={() => setCreateUserSecretStatus("")}
      rightIcon={<FontAwesomeIcon icon={faRedo} className="pl-2" />}
    >
      {hasSecretType ? "Edit user secret again" : "Create another user secret"}
    </Button>
  );
};
