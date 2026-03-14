import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { ProjectLabelController } from "../../../../../src/hb-backend-api/project-label/adapters/in/project-label.controller";
import { DIToken } from "../../../../../src/shared/di/token.di";
import { ProjectId } from "../../../../../src/hb-backend-api/project/domain/model/project-id.vo";
import { ProjectLabelId } from "../../../../../src/hb-backend-api/project-label/domain/model/project-label-id.vo";

describe("ProjectLabelController", () => {
  let controller: ProjectLabelController;
  const mockCreateProjectLabelUseCase = { invoke: jest.fn() };
  const mockGetProjectLabelsUseCase = { invoke: jest.fn() };
  const mockUpdateProjectLabelUseCase = { invoke: jest.fn() };
  const mockDeleteProjectLabelUseCase = { invoke: jest.fn() };

  const projectId = ProjectId.fromString(new Types.ObjectId().toHexString());
  const labelId = ProjectLabelId.fromString(new Types.ObjectId().toHexString());

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectLabelController],
      providers: [
        {
          provide: DIToken.ProjectLabelModule.CreateProjectLabelUseCase,
          useValue: mockCreateProjectLabelUseCase,
        },
        {
          provide: DIToken.ProjectLabelModule.GetProjectLabelsUseCase,
          useValue: mockGetProjectLabelsUseCase,
        },
        {
          provide: DIToken.ProjectLabelModule.UpdateProjectLabelUseCase,
          useValue: mockUpdateProjectLabelUseCase,
        },
        {
          provide: DIToken.ProjectLabelModule.DeleteProjectLabelUseCase,
          useValue: mockDeleteProjectLabelUseCase,
        },
      ],
    }).compile();

    controller = module.get(ProjectLabelController);
  });

  describe("create", () => {
    it("should call createProjectLabelUseCase with projectId, name, color", async () => {
      mockCreateProjectLabelUseCase.invoke.mockResolvedValue(undefined);

      await controller.create(projectId, { name: "bug", color: "#FF0000" });

      expect(mockCreateProjectLabelUseCase.invoke).toHaveBeenCalledWith(
        projectId,
        "bug",
        "#FF0000",
      );
    });

    it("should propagate use case error", async () => {
      mockCreateProjectLabelUseCase.invoke.mockRejectedValue(
        new Error("duplicate label"),
      );

      await expect(
        controller.create(projectId, { name: "bug", color: "#FF0000" }),
      ).rejects.toThrow("duplicate label");
    });
  });

  describe("getAll", () => {
    it("should return mapped GetProjectLabelDto array", async () => {
      const docId = new Types.ObjectId();
      const mockDocs = [
        { _id: docId, name: "feature", color: "#00FF00" },
        { _id: new Types.ObjectId(), name: "bug", color: "#FF0000" },
      ];
      mockGetProjectLabelsUseCase.invoke.mockResolvedValue(mockDocs);

      const result = await controller.getAll(projectId);

      expect(mockGetProjectLabelsUseCase.invoke).toHaveBeenCalledWith(
        projectId,
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(String(docId));
      expect(result[0].name).toBe("feature");
      expect(result[0].color).toBe("#00FF00");
    });

    it("should return empty array when no labels", async () => {
      mockGetProjectLabelsUseCase.invoke.mockResolvedValue([]);

      const result = await controller.getAll(projectId);

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should call updateProjectLabelUseCase with labelId, name, color", async () => {
      mockUpdateProjectLabelUseCase.invoke.mockResolvedValue(undefined);

      await controller.update(labelId, {
        name: "enhancement",
        color: "#0000FF",
      });

      expect(mockUpdateProjectLabelUseCase.invoke).toHaveBeenCalledWith(
        labelId,
        "enhancement",
        "#0000FF",
      );
    });

    it("should propagate use case error", async () => {
      mockUpdateProjectLabelUseCase.invoke.mockRejectedValue(
        new Error("not found"),
      );

      await expect(
        controller.update(labelId, { name: "x", color: "#000" }),
      ).rejects.toThrow("not found");
    });
  });

  describe("delete", () => {
    it("should call deleteProjectLabelUseCase with labelId", async () => {
      mockDeleteProjectLabelUseCase.invoke.mockResolvedValue(undefined);

      await controller.delete(labelId);

      expect(mockDeleteProjectLabelUseCase.invoke).toHaveBeenCalledWith(
        labelId,
      );
    });

    it("should propagate use case error", async () => {
      mockDeleteProjectLabelUseCase.invoke.mockRejectedValue(
        new Error("forbidden"),
      );

      await expect(controller.delete(labelId)).rejects.toThrow("forbidden");
    });
  });
});
