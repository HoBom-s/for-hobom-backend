import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { MemberRole } from "../../../domain/enums/member-role.enum";

export class UpdateProjectMemberRoleDto {
  @ApiProperty({ enum: MemberRole })
  @IsEnum(MemberRole)
  role: MemberRole;
}
