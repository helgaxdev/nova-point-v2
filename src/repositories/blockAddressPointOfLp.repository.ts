import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { LrtUnitOfWork as UnitOfWork } from "../unitOfWork";
import { BlockAddressPointOfLp, PointsOfLp } from "../entities";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class BlockAddressPointOfLpRepository extends BaseRepository<BlockAddressPointOfLp> {
  public constructor(unitOfWork: UnitOfWork) {
    super(BlockAddressPointOfLp, unitOfWork);
  }

  public async getBlockAddressPointKeyByBlock(
    block: number
  ): Promise<string[]> {
    const transactionManager = this.unitOfWork.getTransactionManager();
    const result = await transactionManager.transaction(async (entityManager) => {
      const blockAddressPoints = await entityManager.getRepository(BlockAddressPointOfLp).find({
        where: { blockNumber: block },
        select: ["address", "pairAddress"]
      })
      return blockAddressPoints.map(point => `${point.address}-${point.pairAddress}`);
    });
    return result;
  }

  public async upsertUserPoints(
    receiverBlocBlockAddressPoint: QueryDeepPartialEntity<BlockAddressPointOfLp>,
    receiverAddressPoint: QueryDeepPartialEntity<PointsOfLp>
  ): Promise<void> {
    const transactionManager = this.unitOfWork.getTransactionManager();
    await transactionManager.transaction(async (entityManager) => {
      await entityManager.upsert<BlockAddressPointOfLp>(BlockAddressPointOfLp, receiverBlocBlockAddressPoint, [
        "blockNumber",
        "address",
        "pairAddress",
        "type",
      ]);
      await entityManager.upsert<PointsOfLp>(PointsOfLp, receiverAddressPoint, ["address", "pairAddress"]);
    });
  }
}
