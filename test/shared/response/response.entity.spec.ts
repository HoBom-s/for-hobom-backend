import { ResponseEntity } from "src/shared/response/response.entity";

describe("ResponseEntity", () => {
  describe("ok()", () => {
    it("should create a success response with data", () => {
      const data = { id: 1, name: "test" };

      const response = ResponseEntity.ok(data);

      expect(response).toMatchObject({
        success: true,
        items: data,
        message: "OK !",
      });
      expect(response).toHaveProperty("timestamp");
    });

    it("should set ISO timestamp", () => {
      const before = new Date().toISOString();
      const response = ResponseEntity.ok("value");
      const after = new Date().toISOString();

      const timestamp = response["timestamp"];
      expect(timestamp >= before).toBe(true);
      expect(timestamp <= after).toBe(true);
    });

    it("should accept null data", () => {
      const response = ResponseEntity.ok(null);

      expect(response).toMatchObject({
        success: true,
        items: null,
        message: "OK !",
      });
    });

    it("should accept array data", () => {
      const data = [1, 2, 3];

      const response = ResponseEntity.ok(data);

      expect(response).toMatchObject({
        success: true,
        items: data,
      });
    });
  });

  describe("fail()", () => {
    it("should create a failure response without data", () => {
      const response = ResponseEntity.fail();

      expect(response).toMatchObject({
        success: false,
        items: null,
        message: "FAIL !",
      });
      expect(response).toHaveProperty("timestamp");
    });

    it("should create a failure response with data", () => {
      const data = { error: "something went wrong" };

      const response = ResponseEntity.fail(data);

      expect(response).toMatchObject({
        success: false,
        items: data,
        message: "FAIL !",
      });
    });

    it("should default items to null when data is undefined", () => {
      const response = ResponseEntity.fail(undefined);

      expect(response).toMatchObject({
        success: false,
        items: null,
      });
    });
  });
});
