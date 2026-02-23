import { LabelId } from "../../model/label-id.vo";
import { PatchLabelCommand } from "../out/patch-label.command";

export interface PatchLabelUseCase {
  invoke(id: LabelId, command: PatchLabelCommand): Promise<void>;
}
