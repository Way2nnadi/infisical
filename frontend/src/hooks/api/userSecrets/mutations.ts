import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { userSecretKeys } from "./queries";
import {
  TCreateUserSecretPayload,
  TCreateUserSecretRequest,
  TDeleteUserSecretPayload,
  TDeleteUserSecretRequest,
  TUpdateUserSecretPayload,
  TUpdateUserSecretRequest
} from "./types";

// Create User Secrets
export const useCreateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TCreateUserSecretRequest) => {
      const requestData = inputData;

      // Assign name as title for secure note secrets
      if (inputData?.secretType === "secureNote") {
        requestData.title = inputData.secretName;
      }

      const { data } = await apiRequest.post<TCreateUserSecretPayload>(
        "/api/v1/user-secrets",
        requestData
      );

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

// Update User Secrets
export const useUpdateUserSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputData: TUpdateUserSecretRequest) => {
      const { data } = await apiRequest.put<TUpdateUserSecretPayload>(
        "/api/v1/user-secrets",
        inputData
      );

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

// Delete User Secrets
export const useDeleteUserSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userSecretId }: TDeleteUserSecretRequest) => {
      const { data } = await apiRequest.delete<TDeleteUserSecretPayload>(
        `/api/v1/user-secrets/${userSecretId}`
      );

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};
