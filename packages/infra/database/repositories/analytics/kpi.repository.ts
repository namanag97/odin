/**
 * Kpi Repository Implementation - SQLite
 */

import type { Database } from "bun:sqlite";
import type {
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type { Kpi, KpiId, IKpiRepository } from "@odin/domain";
import {  } from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";

export class SqliteKpiRepository implements IKpiRepository {
  constructor(private db: Database) {}

  async findById(id: KpiId): AsyncResult<Kpi | null> {
    try {
      // TODO: Implement
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async save(entity: Kpi): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "save") };
    }
  }

  async delete(id: KpiId): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }
}
