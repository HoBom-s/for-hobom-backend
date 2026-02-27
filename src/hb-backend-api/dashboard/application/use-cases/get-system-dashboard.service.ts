import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OutboxEntity } from "../../../outbox/domain/model/outbox.entity";
import { SystemDashboardPeriod } from "../../domain/enums/dashboard-period.enum";
import {
  GetSystemDashboardUseCase,
  SystemDashboardResult,
} from "../../domain/ports/in/get-system-dashboard.use-case";

interface SystemFacetResult {
  overview: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  }[];
  byEventType: { _id: string; count: number }[];
  hourlyThroughput: { _id: number; count: number }[];
  recentFailures: {
    eventId: string;
    eventType: string;
    lastError: string | null;
    retryCount: number;
    failedAt: Date | null;
  }[];
  retryDistribution: { _id: number; count: number }[];
}

@Injectable()
export class GetSystemDashboardService implements GetSystemDashboardUseCase {
  constructor(
    @InjectModel(OutboxEntity.name)
    private readonly outboxModel: Model<OutboxEntity>,
  ) {}

  public async invoke(
    period: SystemDashboardPeriod,
  ): Promise<SystemDashboardResult> {
    const { startDate, endDate } = this.getDateRange(period);

    const [result] = await this.outboxModel
      .aggregate<SystemFacetResult>([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  sent: {
                    $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] },
                  },
                  failed: {
                    $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
                  },
                  pending: {
                    $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
                  },
                },
              },
            ],
            byEventType: [
              { $group: { _id: "$eventType", count: { $sum: 1 } } },
            ],
            hourlyThroughput: [
              { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
            recentFailures: [
              { $match: { status: "FAILED" } },
              { $sort: { failedAt: -1 } },
              { $limit: 10 },
              {
                $project: {
                  eventId: 1,
                  eventType: 1,
                  lastError: 1,
                  retryCount: 1,
                  failedAt: 1,
                },
              },
            ],
            retryDistribution: [
              { $group: { _id: "$retryCount", count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ])
      .exec();

    const overview = result.overview[0] ?? {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
    };

    return {
      period,
      startDate,
      endDate,
      overview: {
        total: overview.total,
        sent: overview.sent,
        failed: overview.failed,
        pending: overview.pending,
        successRate: overview.total > 0 ? overview.sent / overview.total : 0,
      },
      byEventType: result.byEventType.map((e) => ({
        eventType: e._id,
        count: e.count,
      })),
      hourlyThroughput: result.hourlyThroughput.map((h) => ({
        hour: h._id,
        count: h.count,
      })),
      recentFailures: result.recentFailures.map((f) => ({
        eventId: f.eventId,
        eventType: f.eventType,
        lastError: f.lastError,
        retryCount: f.retryCount,
        failedAt: f.failedAt,
      })),
      retryDistribution: result.retryDistribution.map((r) => ({
        retryCount: r._id,
        count: r.count,
      })),
    };
  }

  private getDateRange(period: SystemDashboardPeriod): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case SystemDashboardPeriod.LAST_24H:
        startDate.setHours(startDate.getHours() - 24);
        break;
      case SystemDashboardPeriod.LAST_7D:
        startDate.setDate(startDate.getDate() - 7);
        break;
      case SystemDashboardPeriod.LAST_30D:
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return { startDate, endDate };
  }
}
