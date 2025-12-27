/**
 * Repository Factory
 *
 * Centralized factory for creating all repository instances.
 * Provides dependency injection container pattern.
 */

import type { Database } from "bun:sqlite";

// Repository imports


/**
 * Repository container interface
 */
export interface IRepositoryContainer {

}

/**
 * Create repository container with all repositories
 */
export function createRepositoryContainer(db: Database): IRepositoryContainer {
  return {

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
