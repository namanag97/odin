/**
 * Space Repository Implementation - SQLite
 */

import type { Database } from "bun:sqlite";
import type {
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type { Space, SpaceId, ISpaceRepository } from "@odin/domain";
import {  } from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";

export class SqliteSpaceRepository implements ISpaceRepository {
  constructor(private db: Database) {}

  async findById(id: SpaceId): AsyncResult<Space | null> {
    try {
      // TODO: Implement
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async save(entity: Space): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "save") };
    }
  }

  async delete(id: SpaceId): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }
}
