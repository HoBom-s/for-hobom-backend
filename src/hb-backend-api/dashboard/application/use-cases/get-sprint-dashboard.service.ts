import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { IssueEntity } from "../../../issue/domain/model/issue.entity";
import { SprintEntity } from "../../../sprint/domain/model/sprint.entity";
import { ProjectEntity } from "../../../project/domain/model/project.entity";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import {
  GetSprintDashboardUseCase,
  SprintDashboardResult,
} from "../../domain/ports/in/get-sprint-dashboard.use-case";

interface SprintIssueSummary {
  totalIssues: number;
  completedIssues: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

@Injectable()
export class GetSprintDashboardService implements GetSprintDashboardUseCase {
  constructor(
    @InjectModel(IssueEntity.name)
    private readonly issueModel: Model<IssueEntity>,
    @InjectModel(SprintEntity.name)
    private readonly sprintModel: Model<SprintEntity>,
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectEntity>,
  ) {}

  public async invoke(
    projectId: ProjectId,
    sprintId: Types.ObjectId,
  ): Promise<SprintDashboardResult> {
    const [sprint, project] = await Promise.all([
      this.sprintModel.findById(sprintId).lean().exec(),
      this.projectModel.findById(projectId.raw).lean().exec(),
    ]);

    if (sprint == null) {
      throw new NotFoundException("스프린트를 찾을 수 없어요.");
    }
    if (project == null) {
      throw new NotFoundException("프로젝트를 찾을 수 없어요.");
    }

    const doneStatusIds =
      project.workflow?.statuses.filter((s) => s.isDone).map((s) => s.id) ?? [];

    const [summary] = await this.issueModel
      .aggregate<SprintIssueSummary>([
        { $match: { project: projectId.raw, sprint: sprintId } },
        {
          $group: {
            _id: null,
            totalIssues: { $sum: 1 },
            completedIssues: {
              $sum: {
                $cond: [{ $in: ["$status", doneStatusIds] }, 1, 0],
              },
            },
            totalStoryPoints: {
              $sum: { $ifNull: ["$storyPoints", 0] },
            },
            completedStoryPoints: {
              $sum: {
                $cond: [
                  { $in: ["$status", doneStatusIds] },
                  { $ifNull: ["$storyPoints", 0] },
                  0,
                ],
              },
            },
          },
        },
      ])
      .exec();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const stats = summary ?? {
      totalIssues: 0,
      completedIssues: 0,
      totalStoryPoints: 0,
      completedStoryPoints: 0,
    };

    return {
      sprint: {
        id: String(sprint._id as Types.ObjectId),
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      overview: {
        totalIssues: stats.totalIssues,
        completedIssues: stats.completedIssues,
        completionRate:
          stats.totalIssues > 0 ? stats.completedIssues / stats.totalIssues : 0,
        totalStoryPoints: stats.totalStoryPoints,
        completedStoryPoints: stats.completedStoryPoints,
      },
    };
  }
}
