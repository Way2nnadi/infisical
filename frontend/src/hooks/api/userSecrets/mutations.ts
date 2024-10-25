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
      const { data } = await apiRequest.post<TCreateUserSecretPayload>(
        "/api/v1/user-secret",
        inputData
      );

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

// Update User Secrets
export const useUpdateUserSecret = () => {
  return useMutation({
    mutationFn: async (inputData: TUpdateUserSecretRequest) => {
      const { data } = await apiRequest.put<TUpdateUserSecretPayload>(
        "/api/v1/user-secret",
        inputData
      );

      return data;
    },
    onSuccess: () => console.log("useUpdateUserSecret Success")
  });
};

// Delete User Secrets
export const useDeleteUserSecret = () => {
  return useMutation({
    mutationFn: async ({ userSecretId }: TDeleteUserSecretRequest) => {
      const { data } = await apiRequest.delete<TDeleteUserSecretPayload>(
        `/api/v1/user-secret/${userSecretId}`
      );

      return data;
    },
    onSuccess: () => console.log("useDeleteUserSecret Success")
  });
};
