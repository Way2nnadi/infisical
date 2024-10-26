import { z } from "zod";

import { UserSecretsSchema } from "@app/db/schemas";
import { readLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";
import { Statuses } from "@app/services/user-secrets/user-secrets-types";

export const registerUserSecretsRouter = async (server: FastifyZodProvider) => {
  // Handle creating user secrets
  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      body: z.object({
        secretType: z.string(),
        secretName: z.string(),
        username: z.string().optional(),
        password: z.string().optional(),
        cardholderName: z.string().optional(),
        cardNumber: z.string().optional(),
        cardExpirationDate: z.string().optional(),
        cardSecurityCode: z.string().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        additionalNotes: z.string().optional()
      }),
      response: {
        204: z.object({
          id: z.string(),
          status: z.string()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { id, status } = await req.server.services.userSecrets.creatUserSecret({
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        ...req.body
      });

      return { id, status };
    }
  });

  // Handle getting list of user secrets
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      querystring: z.object({
        offset: z.coerce.number().min(0).max(100).default(0),
        limit: z.coerce.number().min(1).max(100).default(25)
      }),
      response: {
        200: z.object({
          status: z.string(),
          totalCount: z.number(),
          userSecrets: z.array(UserSecretsSchema)
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { status, totalCount, userSecrets } = await req.server.services.userSecrets.getAllUserSecrets({
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        ...req.query
      });

      return { status, totalCount, userSecrets };
    }
  });

  // handle updating user secrets
  server.route({
    method: "PUT",
    url: "/",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      body: z.object({
        id: z.string(),
        secretName: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        cardholderName: z.string().optional(),
        cardNumber: z.string().optional(),
        cardExpirationDate: z.string().optional(),
        cardSecurityCode: z.string().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        additionalNotes: z.string().optional()
      }),
      response: {
        200: z.object({
          status: z.nativeEnum(Statuses),
          updatedAt: z.date()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { status, updatedAt } = await req.server.services.userSecrets.updateUserSecretById({
        ...req.body
      });

      return { status, updatedAt };
    }
  });
  // handle deleting use secrets

  server.route({
    method: "DELETE",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        userSecretId: z.string()
      }),
      response: {
        200: z.object({
          status: z.nativeEnum(Statuses)
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { userSecretId } = req.params;
      const { status } = await req.server.services.userSecrets.deleteUserSecretById({
        userSecretId
      });

      return { status };
    }
  });
};
