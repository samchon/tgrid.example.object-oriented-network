import { Driver, WorkerServer } from "tgrid";

import { ICalcConfig } from "./interfaces/ICalcConfig";
import { ICalcEventListener } from "./interfaces/ICalcEventListener";
import { ScientificCalculator } from "./providers/ScientificCalculator";

const main = async () => {
  const server: WorkerServer<
    ICalcConfig,
    ScientificCalculator,
    ICalcEventListener
  > = new WorkerServer();

  const header: ICalcConfig = await server.getHeader();
  const listener: Driver<ICalcEventListener> = server.getDriver();
  const provider: ScientificCalculator = new ScientificCalculator(
    header,
    listener,
  );
  await server.open(provider);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
