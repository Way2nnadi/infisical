export type TUserSecret = {
  id: string;
  userId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  secretType: string;
  secretName: string;
  username?: string;
  password?: string;
  cardholderName?: string;
  cardNumber?: string;
  cardExpirationDate?: string;
  cardSecurityCode?: string;
  title?: string;
  content?: string;
  additionalNotes?: string;
};

export type TCreateUserSecretRequest = {
  secretType: string;
  secretName: string;
  username?: string;
  password?: string;
  cardholderName?: string;
  cardNumber?: string;
  cardExpirationDate?: string;
  cardSecurityCode?: string;
  title?: string;
  content?: string;
  additionalNotes?: string;
};

export type TCreateUserSecretPayload = {
  status: string;
};

export type TUpdateUserSecretRequest = {
  id: string;
  secretName?: string;
  username?: string;
  password?: string;
  cardholderName?: string;
  cardNumber?: string;
  cardExpirationDate?: string;
  cardSecurityCode?: string;
  title?: string;
  content?: string;
  additionalNotes?: string;
};

export type TUpdateUserSecretPayload = {
  status: string;
};

export type TDeleteUserSecretRequest = {
  userSecretId: string;
};

export type TDeleteUserSecretPayload = {
  status: string;
};
