import { CreateLabelCommand } from "../out/create-label.command";

export interface CreateLabelUseCase {
  invoke(command: CreateLabelCommand): Promise<void>;
}
