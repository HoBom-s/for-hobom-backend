import { UpsertTodayMenuEntity } from "../../../domain/entity/upsert-today-menu.entity";

export interface TodayMenuPersistencePort {
  upsert(entity: UpsertTodayMenuEntity): Promise<void>;
}
