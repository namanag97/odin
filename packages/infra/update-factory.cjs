const fs = require('fs');

// Get all repository files
const getAllRepos = () => {
  const layers = [
    'existence',
    'identity',
    'commercial',
    'operational',
    'process-mining',
    'temporal',
    'integration',
    'analytics',
    'studio',
    'automation',
  ];

  const repos = [];

  for (const layer of layers) {
    const layerPath = `./database/repositories/${layer}`;
    if (!fs.existsSync(layerPath)) continue;

    const files = fs.readdirSync(layerPath);
    for (const file of files) {
      if (file.endsWith('.repository.ts') || file.endsWith('-repository.ts')) {
        const fileName = file.replace('.ts', '');
        const entityKebab = file.replace('.repository.ts', '').replace('-repository.ts', '');
        const entityPascal = entityKebab
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');

        repos.push({ layer, entityKebab, entityPascal, fileName });
      }
    }
  }

  return repos;
};

const repos = getAllRepos();
console.log(`Found ${repos.length} repositories`);

// Generate imports
const imports = repos.map(({ layer, entityKebab, entityPascal, fileName }) =>
  `import { Sqlite${entityPascal}Repository } from "./repositories/${layer}/${fileName}";`
).join('\n');

// Generate interface properties
const interfaceProps = repos.map(({ entityPascal }) => {
  const propName = entityPascal.charAt(0).toLowerCase() + entityPascal.slice(1);
  return `  readonly ${propName}: Sqlite${entityPascal}Repository;`;
}).join('\n');

// Generate factory instantiations
const instantiations = repos.map(({ entityPascal }) => {
  const propName = entityPascal.charAt(0).toLowerCase() + entityPascal.slice(1);
  return `    ${propName}: new Sqlite${entityPascal}Repository(db),`;
}).join('\n');

// Create the full factory file
const factoryContent = `/**
 * Repository Factory
 *
 * Centralized factory for creating all repository instances.
 * Provides dependency injection container pattern.
 */

import type { Database } from "bun:sqlite";

// Repository imports
${imports}

/**
 * Repository container interface
 */
export interface IRepositoryContainer {
${interfaceProps}
}

/**
 * Create repository container with all repositories
 */
export function createRepositoryContainer(db: Database): IRepositoryContainer {
  return {
${instantiations}
  };
}

// Singleton instance
let repositoryContainer: IRepositoryContainer | null = null;

/**
 * Get or create the repository container singleton
 */
export function getRepositoryContainer(db: Database): IRepositoryContainer {
  if (!repositoryContainer) {
    repositoryContainer = createRepositoryContainer(db);
  }
  return repositoryContainer;
}

/**
 * Reset the repository container (useful for testing)
 */
export function resetRepositoryContainer(): void {
  repositoryContainer = null;
}
`;

fs.writeFileSync('./database/repository-factory.ts', factoryContent);
console.log('✅ Updated repository-factory.ts');

// Also update database/index.ts exports
const indexExports = repos.map(({ layer, entityKebab, entityPascal }) =>
  `export { Sqlite${entityPascal}Repository } from "./repositories/${layer}/${entityKebab}.repository";`
).join('\n');

const indexContent = `/**
 * Database Infrastructure - Main Export
 */

// Core Database
export {
  createDatabase,
  DatabaseConnection,
  type DatabaseConfig,
} from "./connection";

// Repository Factory
export {
  createRepositoryContainer,
  getRepositoryContainer,
  resetRepositoryContainer,
  type IRepositoryContainer,
} from "./repository-factory";

// Error Mapping
export { mapDatabaseError } from "./error-mapper";

// Database Utilities
export {
  DbTimestamp,
  JsonColumn,
  Pagination,
  WhereBuilder,
  buildPagination,
  buildOrderBy,
} from "./types";

// Repository Implementations
${indexExports}
`;

fs.writeFileSync('./database/index.ts', indexContent);
console.log('✅ Updated database/index.ts');

console.log(`\n🎉 Factory and exports updated with ${repos.length} repositories!`);
