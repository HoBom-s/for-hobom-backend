import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FutureMessageEntity } from "../../../future-message/domain/model/future-message.entity";
import { UserId } from "../../../user/domain/model/user-id.vo";
import {
  FutureMessageDashboardResult,
  GetFutureMessageDashboardUseCase,
} from "../../domain/ports/in/get-future-message-dashboard.use-case";

interface FutureMessageFacetResult {
  byStatus: { _id: string; count: number }[];
  upcoming: {
    _id: Types.ObjectId;
    title: string;
    recipientId: string;
    scheduledAt: string;
  }[];
  monthlyTrend: { _id: string; count: number }[];
  overview: { total: number }[];
}

@Injectable()
export class GetFutureMessageDashboardService
  implements GetFutureMessageDashboardUseCase
{
  constructor(
    @InjectModel(FutureMessageEntity.name)
    private readonly futureMessageModel: Model<FutureMessageEntity>,
  ) {}

  public async invoke(senderId: UserId): Promise<FutureMessageDashboardResult> {
    const [result] = await this.futureMessageModel
      .aggregate<FutureMessageFacetResult>([
        { $match: { senderId: senderId.toString() } },
        {
          $facet: {
            byStatus: [{ $group: { _id: "$sendStatus", count: { $sum: 1 } } }],
            upcoming: [
              { $match: { sendStatus: "PENDING" } },
              { $sort: { scheduledAt: 1 } },
              { $limit: 10 },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  recipientId: 1,
                  scheduledAt: 1,
                },
              },
            ],
            monthlyTrend: [
              { $match: { sendStatus: "SENT" } },
              {
                $group: {
                  _id: { $substr: ["$scheduledAt", 0, 7] },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            overview: [{ $group: { _id: null, total: { $sum: 1 } } }],
          },
        },
      ])
      .exec();

    const overview = result.overview[0] ?? { total: 0 };
    const statusMap = new Map<string, number>(
      result.byStatus.map((s) => [s._id, s.count]),
    );

    return {
      overview: {
        total: overview.total,
        pending: statusMap.get("PENDING") ?? 0,
        sent: statusMap.get("SENT") ?? 0,
      },
      upcoming: result.upcoming.map((u) => ({
        id: u._id.toString(),
        title: u.title,
        recipientId: u.recipientId,
        scheduledAt: u.scheduledAt,
      })),
      monthlyTrend: result.monthlyTrend.map((m) => ({
        month: m._id,
        count: m.count,
      })),
    };
  }
}
