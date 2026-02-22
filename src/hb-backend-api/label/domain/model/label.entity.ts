import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelId } from "./label-id.vo";
import { LabelTitle } from "./label-title.vo";

@Schema({ collection: "labels" })
export class LabelEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: "user", required: true, index: true })
  owner: Types.ObjectId;
}

export class LabelEntitySchema {
  constructor(
    private readonly id: LabelId,
    private readonly title: LabelTitle,
    private readonly owner: UserId,
  ) {}

  public static of(
    id: LabelId,
    title: LabelTitle,
    owner: UserId,
  ): LabelEntitySchema {
    return new LabelEntitySchema(id, title, owner);
  }

  get getId(): LabelId {
    return this.id;
  }

  get getTitle(): LabelTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}

export class LabelCreateEntitySchema {
  constructor(
    private readonly title: LabelTitle,
    private readonly owner: UserId,
  ) {}

  public static of(title: LabelTitle, owner: UserId): LabelCreateEntitySchema {
    return new LabelCreateEntitySchema(title, owner);
  }

  get getTitle(): LabelTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}

export class LabelUpdateEntitySchema {
  constructor(
    private readonly title: LabelTitle,
    private readonly owner: UserId,
  ) {}

  public static of(title: LabelTitle, owner: UserId): LabelUpdateEntitySchema {
    return new LabelUpdateEntitySchema(title, owner);
  }

  get getTitle(): LabelTitle {
    return this.title;
  }

  get getOwner(): UserId {
    return this.owner;
  }
}
