const fs = require('fs');

// Template for a simple repository
const repoTemplate = (entity) => `/**
 * ${entity} Repository Implementation - SQLite
 */

import type { Database } from "bun:sqlite";
import type {
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import {
  ${entity},
  ${entity}Id,
  I${entity}Repository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";

export class Sqlite${entity}Repository implements I${entity}Repository {
  constructor(private db: Database) {}

  async findById(id: ${entity}Id): AsyncResult<${entity} | null> {
    try {
      // TODO: Implement
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async save(entity: ${entity}): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "save") };
    }
  }

  async delete(id: ${entity}Id): AsyncResult<void> {
    try {
      // TODO: Implement
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }
}
`;

// List of repos to generate
const repos = [
  // Commercial layer
  { layer: 'commercial', entity: 'Plan' },
  { layer: 'commercial', entity: 'Subscription' },
  { layer: 'commercial', entity: 'Invoice' },
  { layer: 'commercial', entity: 'PaymentMethod' },
  { layer: 'commercial', entity: 'UsageRecord' },
  { layer: 'commercial', entity: 'Coupon' },

  // Operational layer
  { layer: 'operational', entity: 'ExtendedTenantSettings' },
  { layer: 'operational', entity: 'FeatureFlag' },
  { layer: 'operational', entity: 'SystemConfig' },

  // Process Mining layer
  { layer: 'process-mining', entity: 'DataPool' },
  { layer: 'process-mining', entity: 'Table' },
  { layer: 'process-mining', entity: 'DataModel' },
  { layer: 'process-mining', entity: 'Case' },
  { layer: 'process-mining', entity: 'Variant' },
  { layer: 'process-mining', entity: 'ProcessModel' },

  // Temporal layer
  { layer: 'temporal', entity: 'AuditLog' },
  { layer: 'temporal', entity: 'EntityHistory' },
  { layer: 'temporal', entity: 'ScheduledJob' },

  // Integration layer
  { layer: 'integration', entity: 'ApiKey' },
  { layer: 'integration', entity: 'Webhook' },
  { layer: 'integration', entity: 'Integration' },
  { layer: 'integration', entity: 'OAuthToken' },

  // Analytics layer
  { layer: 'analytics', entity: 'KnowledgeModel' },
  { layer: 'analytics', entity: 'Kpi' },
  { layer: 'analytics', entity: 'Record' },
  { layer: 'analytics', entity: 'Filter' },
  { layer: 'analytics', entity: 'Variable' },

  // Studio layer
  { layer: 'studio', entity: 'Space' },
  { layer: 'studio', entity: 'Package' },
  { layer: 'studio', entity: 'View' },
  { layer: 'studio', entity: 'Component' },

  // Automation layer
  { layer: 'automation', entity: 'ActionFlow' },
  { layer: 'automation', entity: 'Execution' },
  { layer: 'automation', entity: 'Skill' },
  { layer: 'automation', entity: 'Sensor' },
  { layer: 'automation', entity: 'Signal' },
  { layer: 'automation', entity: 'Task' },
];

// Generate repos
let created = 0;
for (const { layer, entity } of repos) {
  const layerDir = `./database/repositories/${layer}`;
  if (!fs.existsSync(layerDir)) {
    fs.mkdirSync(layerDir, { recursive: true });
  }

  const kebab = entity.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const filename = `${layerDir}/${kebab}.repository.ts`;

  if (fs.existsSync(filename)) {
    console.log(`  ⏭️  Skip: ${filename}`);
    continue;
  }

  const content = repoTemplate(entity);
  fs.writeFileSync(filename, content);
  console.log(`  ✅ ${layer}/${kebab}.repository.ts`);
  created++;
}

console.log(`\n🎉 Generated ${created} new repositories!`);
