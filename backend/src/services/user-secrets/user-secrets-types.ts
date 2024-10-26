export type TUserSecretPermissions = {
  actorId: string;
  orgId: string;
};
export type TCreateUserSecretDTO = {
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
} & TUserSecretPermissions;

export type TGetUserSecretDTO = {
  offset: number;
  limit: number;
} & TUserSecretPermissions;

export type TUpdateUserSecretDTO = {
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

export type TDeleteUserSecretDTO = {
  userSecretId: string;
};

export enum Statuses {
  SUCCESS = "SUCCESS"
}
