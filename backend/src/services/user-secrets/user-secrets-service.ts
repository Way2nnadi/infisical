import { DatabaseError } from "@app/lib/errors";

import { TUserSecretsDALFactory } from "./user-secrets-dal";
import {
  Statuses,
  TCreateUserSecretDTO,
  TDeleteUserSecretDTO,
  TGetUserSecretDTO,
  TUpdateUserSecretDTO
} from "./user-secrets-types";

type TUserSecretsServiceFactoryDep = {
  userSecretsDAL: TUserSecretsDALFactory;
};

export type TUserSecretsServiceFactory = ReturnType<typeof userSecretsServiceFactory>;

export const userSecretsServiceFactory = ({ userSecretsDAL }: TUserSecretsServiceFactoryDep) => {
  // Create user secret
  const creatUserSecret = async (userSecretCreatePayload: TCreateUserSecretDTO) => {
    const {
      secretType,
      secretName,
      username,
      password,
      cardholderName,
      cardNumber,
      cardExpirationDate,
      cardSecurityCode,
      title,
      content,
      additionalNotes,
      actorId,
      orgId
    } = userSecretCreatePayload;

    try {
      const { id } = await userSecretsDAL.create({
        secretType,
        secretName,
        username,
        password,
        cardholderName,
        cardNumber,
        cardExpirationDate,
        cardSecurityCode,
        title,
        content,
        additionalNotes,
        userId: actorId,
        orgId
      });

      return { id, status: Statuses.SUCCESS };
    } catch (error) {
      throw new DatabaseError({ error, name: "creatUserSecret" });
    }
  };

  // Get list of user secrets
  const getAllUserSecrets = async (userSecretGetPayload: TGetUserSecretDTO) => {
    const { actorId: userId, orgId, offset, limit } = userSecretGetPayload;

    try {
      const userSecrets = await userSecretsDAL.find(
        {
          userId,
          orgId
        },
        { offset, limit, sort: [["createdAt", "desc"]] }
      );

      const count = await userSecretsDAL.countAllUserSecrets({
        orgId,
        userId
      });

      return {
        status: Statuses.SUCCESS,
        totalCount: count,
        userSecrets
      };
    } catch (error) {
      throw new DatabaseError({ error, name: "getAllUserSecrets" });
    }
  };

  // Update user secret by id
  const updateUserSecretById = async (updateUserSecretPayload: TUpdateUserSecretDTO) => {
    const {
      id: userSecretId,
      secretName,
      username,
      password,
      cardholderName,
      cardNumber,
      cardExpirationDate,
      cardSecurityCode,
      title,
      content,
      additionalNotes
    } = updateUserSecretPayload;

    try {
      const { updatedAt } = await userSecretsDAL.updateById(userSecretId, {
        secretName,
        username,
        password,
        cardholderName,
        cardNumber,
        cardExpirationDate,
        cardSecurityCode,
        title,
        content,
        additionalNotes
      });

      return { status: Statuses.SUCCESS, updatedAt };
    } catch (error) {
      throw new DatabaseError({ error, name: "updateUserSecretById" });
    }
  };

  // Delete user secret by id
  const deleteUserSecretById = async (deleteUserSecretPayload: TDeleteUserSecretDTO) => {
    const { userSecretId } = deleteUserSecretPayload;

    try {
      await userSecretsDAL.deleteById(userSecretId);

      return { status: Statuses.SUCCESS };
    } catch (error) {
      throw new DatabaseError({ error, name: "deleteUserSecretById" });
    }
  };

  return {
    creatUserSecret,
    deleteUserSecretById,
    getAllUserSecrets,
    updateUserSecretById
  };
};
