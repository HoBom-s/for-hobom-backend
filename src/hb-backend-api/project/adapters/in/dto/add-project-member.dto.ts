import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { MemberRole } from "../../../domain/enums/member-role.enum";

export class AddProjectMemberDto {
  @ApiProperty({ type: String })
  @IsString()
  userId: string;

  @ApiProperty({ enum: MemberRole })
  @IsEnum(MemberRole)
  role: MemberRole;
}
