import { Knex } from "knex";

import { TDbClient } from "@app/db";
import { TableName, TGroups } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";
import { buildFindFilter, ormify, selectAllTableCols, TFindFilter, TFindOpt } from "@app/lib/knex";

export type TGroupDALFactory = ReturnType<typeof groupDALFactory>;

export const groupDALFactory = (db: TDbClient) => {
  const groupOrm = ormify(db, TableName.Groups);

  const findGroups = async (filter: TFindFilter<TGroups>, { offset, limit, sort, tx }: TFindOpt<TGroups> = {}) => {
    try {
      const query = (tx || db)(TableName.Groups)
        // eslint-disable-next-line
        .where(buildFindFilter(filter))
        .select(selectAllTableCols(TableName.Groups));

      if (limit) void query.limit(limit);
      if (offset) void query.limit(offset);
      if (sort) {
        void query.orderBy(sort.map(([column, order, nulls]) => ({ column: column as string, order, nulls })));
      }

      const res = await query;
      return res;
    } catch (err) {
      throw new DatabaseError({ error: err, name: "Find groups" });
    }
  };

  const findByOrgId = async (orgId: string, tx?: Knex) => {
    try {
      const docs = await (tx || db)(TableName.Groups)
        .where(`${TableName.Groups}.orgId`, orgId)
        .leftJoin(TableName.OrgRoles, `${TableName.Groups}.roleId`, `${TableName.OrgRoles}.id`)
        .select(selectAllTableCols(TableName.Groups))
        // cr stands for custom role
        .select(db.ref("id").as("crId").withSchema(TableName.OrgRoles))
        .select(db.ref("name").as("crName").withSchema(TableName.OrgRoles))
        .select(db.ref("slug").as("crSlug").withSchema(TableName.OrgRoles))
        .select(db.ref("description").as("crDescription").withSchema(TableName.OrgRoles))
        .select(db.ref("permissions").as("crPermission").withSchema(TableName.OrgRoles));
      return docs.map(({ crId, crDescription, crSlug, crPermission, crName, ...el }) => ({
        ...el,
        customRole: el.roleId
          ? {
              id: crId,
              name: crName,
              slug: crSlug,
              permissions: crPermission,
              description: crDescription
            }
          : undefined
      }));
    } catch (error) {
      throw new DatabaseError({ error, name: "FindByOrgId" });
    }
  };

  // special query
  const findAllGroupMembers = async ({
    orgId,
    groupId,
    offset = 0,
    limit,
    username
  }: {
    orgId: string;
    groupId: string;
    offset?: number;
    limit?: number;
    username?: string;
  }) => {
    try {
      let query = db(TableName.OrgMembership)
        .where(`${TableName.OrgMembership}.orgId`, orgId)
        .join(TableName.Users, `${TableName.OrgMembership}.userId`, `${TableName.Users}.id`)
        .leftJoin(TableName.UserGroupMembership, function () {
          this.on(`${TableName.UserGroupMembership}.userId`, "=", `${TableName.Users}.id`).andOn(
            `${TableName.UserGroupMembership}.groupId`,
            "=",
            db.raw("?", [groupId])
          );
        })
        .leftJoin(TableName.PendingGroupAddition, function () {
          this.on(`${TableName.PendingGroupAddition}.userId`, "=", `${TableName.Users}.id`).andOn(
            `${TableName.PendingGroupAddition}.groupId`,
            "=",
            db.raw("?", [groupId])
          );
        })
        .select<
          {
            id: string;
            groupId: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            userId: string;
            isPartOfGroup: boolean;
          }[]
        >(
          db.ref("id").withSchema(TableName.OrgMembership),
          db.ref("groupId").withSchema(TableName.UserGroupMembership),
          db.ref("email").withSchema(TableName.Users),
          db.ref("username").withSchema(TableName.Users),
          db.ref("firstName").withSchema(TableName.Users),
          db.ref("lastName").withSchema(TableName.Users),
          db.ref("id").withSchema(TableName.Users).as("userId"),
          db.raw('CASE WHEN ?? IS NOT NULL OR ?? IS NOT NULL THEN TRUE ELSE FALSE END AS "isPartOfGroup"', [
            `${TableName.UserGroupMembership}.groupId`,
            `${TableName.PendingGroupAddition}.groupId`
          ])
        )
        .where({ isGhost: false })
        .offset(offset);

      if (limit) {
        query = query.limit(limit);
      }

      if (username) {
        query = query.andWhere(`${TableName.Users}.username`, "ilike", `%${username}%`);
      }

      const members = await query;

      return members.map(({ email, username: memberUsername, firstName, lastName, userId, isPartOfGroup }) => ({
        id: userId,
        email,
        username: memberUsername,
        firstName,
        lastName,
        isPartOfGroup
      }));
    } catch (error) {
      throw new DatabaseError({ error, name: "Find all org members" });
    }
  };

  return {
    findGroups,
    findByOrgId,
    findAllGroupMembers,
    ...groupOrm
  };
};
