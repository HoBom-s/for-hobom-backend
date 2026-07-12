import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IssueEntity } from "../../../issue/domain/model/issue.entity";
import { ProjectEntity } from "../../../project/domain/model/project.entity";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import {
  GetProjectIssueDashboardUseCase,
  ProjectIssueDashboardResult,
} from "../../domain/ports/in/get-project-issue-dashboard.use-case";

interface IssueFacetResult {
  byStatus: { _id: string; count: number }[];
  byPriority: { _id: string; count: number }[];
  byType: { _id: string; count: number }[];
  overview: { total: number; done: number; overdueCount: number }[];
}

@Injectable()
export class GetProjectIssueDashboardService implements GetProjectIssueDashboardUseCase {
  constructor(
    @InjectModel(IssueEntity.name)
    private readonly issueModel: Model<IssueEntity>,
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectEntity>,
  ) {}

  public async invoke(
    projectId: ProjectId,
  ): Promise<ProjectIssueDashboardResult> {
    const project = await this.projectModel
      .findById(projectId.raw)
      .lean()
      .exec();
    if (project == null) {
      throw new NotFoundException("프로젝트를 찾을 수 없어요.");
    }

    const doneStatusIds =
      project.workflow?.statuses.filter((s) => s.isDone).map((s) => s.id) ?? [];

    const [result] = await this.issueModel
      .aggregate<IssueFacetResult>([
        { $match: { project: projectId.raw } },
        {
          $facet: {
            byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
            byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  done: {
                    $sum: {
                      $cond: [{ $in: ["$status", doneStatusIds] }, 1, 0],
                    },
                  },
                  overdueCount: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ne: ["$dueDate", null] },
                            { $lt: ["$dueDate", new Date()] },
                            { $eq: ["$resolvedAt", null] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ])
      .exec();

    const overview = result.overview[0] ?? {
      total: 0,
      done: 0,
      overdueCount: 0,
    };

    return {
      overview: {
        total: overview.total,
        open: overview.total - overview.done,
        done: overview.done,
        completionRate: overview.total > 0 ? overview.done / overview.total : 0,
        overdueCount: overview.overdueCount,
      },
      byStatus: result.byStatus.map((s) => ({
        statusId: s._id,
        count: s.count,
      })),
      byPriority: result.byPriority.map((p) => ({
        priority: p._id,
        count: p.count,
      })),
      byType: result.byType.map((t) => ({ type: t._id, count: t.count })),
    };
  }
}
