/**
 * Skill Repository Implementation - SQLite
 */

import type { Database } from "bun:sqlite";
import type {
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type { Skill, SkillId, ISkillRepository } from "@odin/domain";
import {  } from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";

export class SqliteSkillRepository implements ISkillRepository {
  constructor(private db: Database) {}

  async findById(id: SkillId): AsyncResult<Skill | null> {
    try {
      // TODO: Implement
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async save(entity: Skill): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "save") };
    }
  }

  async delete(id: SkillId): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }
}
