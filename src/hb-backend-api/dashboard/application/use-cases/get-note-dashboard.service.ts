import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { NoteEntity } from "../../../note/domain/model/note.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import {
  GetNoteDashboardUseCase,
  NoteDashboardResult,
} from "../../domain/ports/in/get-note-dashboard.use-case";

interface NoteFacetResult {
  byStatus: { _id: string; count: number }[];
  byType: { _id: string; count: number }[];
  byLabel: { _id: Types.ObjectId; count: number }[];
  checklistStats: { total: number; checked: number }[];
  dailyCreated: { _id: string; count: number }[];
  overview: { total: number }[];
}

@Injectable()
export class GetNoteDashboardService implements GetNoteDashboardUseCase {
  constructor(
    @InjectModel(NoteEntity.name)
    private readonly noteModel: Model<NoteEntity>,
  ) {}

  public async invoke(owner: UserId): Promise<NoteDashboardResult> {
    const [result] = await this.noteModel
      .aggregate<NoteFacetResult>([
        { $match: { owner: owner.raw } },
        {
          $facet: {
            byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
            byLabel: [
              { $unwind: "$labels" },
              { $group: { _id: "$labels", count: { $sum: 1 } } },
            ],
            checklistStats: [
              { $match: { type: "CHECKLIST" } },
              { $unwind: "$checklistItems" },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  checked: {
                    $sum: { $cond: ["$checklistItems.checked", 1, 0] },
                  },
                },
              },
            ],
            dailyCreated: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 30 },
              { $sort: { _id: 1 } },
            ],
            overview: [{ $group: { _id: null, total: { $sum: 1 } } }],
          },
        },
      ])
      .exec();

    const overview = result.overview[0] ?? { total: 0 };
    const checklistStats = result.checklistStats[0] ?? {
      total: 0,
      checked: 0,
    };

    return {
      overview: {
        total: overview.total,
        checklistCompletionRate:
          checklistStats.total > 0
            ? checklistStats.checked / checklistStats.total
            : 0,
      },
      byStatus: result.byStatus.map((s) => ({
        status: s._id,
        count: s.count,
      })),
      byType: result.byType.map((t) => ({
        type: t._id,
        count: t.count,
      })),
      byLabel: result.byLabel.map((l) => ({
        labelId: l._id.toString(),
        count: l.count,
      })),
      dailyCreated: result.dailyCreated.map((d) => ({
        date: d._id,
        count: d.count,
      })),
    };
  }
}
