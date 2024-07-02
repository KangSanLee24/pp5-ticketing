import { ROLE } from "src/users/types/user-role.type";

import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: ROLE[]) => SetMetadata("roles", roles);
