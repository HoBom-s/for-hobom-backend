import { Cron } from "@nestjs/schedule";

interface Options {
  name: string;
  cron: string;
  /**
   * 크론 실행 타임존. 미설정 시 서버 로컬 타임존을 따른다.
   * 한국 서비스이므로 기본값을 "Asia/Seoul"로 지정한다.
   *
   * 주의: 서버가 UTC 환경(클라우드 배포 등)에서 실행되면
   * timezone을 명시하지 않으면 "0 9 * * *"는 UTC 오전 9시 = KST 오후 6시가 된다.
   */
  timeZone?: string;
}

export function RegisterJob(options: Options) {
  return function (target: any) {
    const descriptor = Object.getOwnPropertyDescriptor(
      target.prototype,
      "process",
    );

    if (descriptor == null) {
      throw new Error("Register job failed !");
    }

    Cron(options.cron, { timeZone: options.timeZone ?? "Asia/Seoul" })(
      target.prototype,
      "process",
      descriptor,
    );
  };
}
