import { describe, it, expect } from "vitest";
import { getStatusClass } from "./statusUtils";

describe("getStatusClass", () => {
  describe("既知のステータス", () => {
    it("空いています → status-空いています", () => {
      expect(getStatusClass("空いています")).toBe("status-空いています");
    });

    it("待ち時間なし → status-待ち時間なし", () => {
      expect(getStatusClass("待ち時間なし")).toBe("status-待ち時間なし");
    });

    it("やや混雑 → status-やや混雑", () => {
      expect(getStatusClass("やや混雑")).toBe("status-やや混雑");
    });

    it("混雑 → status-混雑", () => {
      expect(getStatusClass("混雑")).toBe("status-混雑");
    });

    it("大混雑 → status-大混雑", () => {
      expect(getStatusClass("大混雑")).toBe("status-大混雑");
    });

    it("通行止め中 → status-通行止め中", () => {
      expect(getStatusClass("通行止め中")).toBe("status-通行止め中");
    });

    it("ライトアップ中 → status-ライトアップ中", () => {
      expect(getStatusClass("ライトアップ中")).toBe("status-ライトアップ中");
    });

    it("営業中 → status-営業中", () => {
      expect(getStatusClass("営業中")).toBe("status-営業中");
    });

    it("利用可能 → status-利用可能", () => {
      expect(getStatusClass("利用可能")).toBe("status-利用可能");
    });
  });

  describe("待ち時間形式", () => {
    it("10分待ち → status-wait", () => {
      expect(getStatusClass("10分待ち")).toBe("status-wait");
    });

    it("30分待ち → status-wait", () => {
      expect(getStatusClass("30分待ち")).toBe("status-wait");
    });

    it("60分待ち → status-wait", () => {
      expect(getStatusClass("60分待ち")).toBe("status-wait");
    });
  });

  describe("空白を含むステータス", () => {
    it("空白を含む「空いて います」は正規化される", () => {
      expect(getStatusClass("空いて います")).toBe("status-空いています");
    });
  });

  describe("不正な入力", () => {
    it("nullは空文字を返す", () => {
      expect(getStatusClass(null as unknown as string)).toBe("");
    });

    it("undefinedは空文字を返す", () => {
      expect(getStatusClass(undefined as unknown as string)).toBe("");
    });

    it("未知のステータスは空文字を返す", () => {
      expect(getStatusClass("未知のステータス")).toBe("");
    });
  });
});
