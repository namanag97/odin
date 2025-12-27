#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read the current database/index.ts
const indexPath = path.join(__dirname, 'database', 'index.ts');
let content = fs.readFileSync(indexPath, 'utf-8');

// Fix the import paths - replace .repository with -repository for the new files
const replacements = [
  // Commercial
  ['commercial/coupon.repository', 'commercial/coupon-repository'],
  ['commercial/invoice.repository', 'commercial/invoice-repository'],
  ['commercial/payment-method.repository', 'commercial/payment-method-repository'],
  ['commercial/plan.repository', 'commercial/plan-repository'],
  ['commercial/subscription.repository', 'commercial/subscription-repository'],
  ['commercial/usage.repository', 'commercial/usage-repository'],

  // Operational
  ['operational/feature-flag.repository', 'operational/feature-flag-repository'],
  ['operational/system-config.repository', 'operational/system-config-repository'],
  ['operational/tenant-settings.repository', 'operational/tenant-settings-repository'],

  // Process Mining
  ['process-mining/case.repository', 'process-mining/case-repository'],
  ['process-mining/data-model.repository', 'process-mining/data-model-repository'],
  ['process-mining/data-pool.repository', 'process-mining/data-pool-repository'],
  ['process-mining/process-model.repository', 'process-mining/process-model-repository'],
  ['process-mining/table.repository', 'process-mining/table-repository'],
  ['process-mining/variant.repository', 'process-mining/variant-repository'],

  // Temporal
  ['temporal/audit-log.repository', 'temporal/audit-log-repository'],
  ['temporal/entity-history.repository', 'temporal/entity-history-repository'],
  ['temporal/scheduled-job.repository', 'temporal/scheduled-job-repository'],

  // Integration
  ['integration/api-key.repository', 'integration/api-key-repository'],
  ['integration/integration.repository', 'integration/integration-repository'],
  ['integration/o-auth-token.repository', 'integration/o-auth-token-repository'],
  ['integration/webhook.repository', 'integration/webhook-repository'],
];

replacements.forEach(([from, to]) => {
  content = content.replace(new RegExp(from.replace(/\//g, '\\/'), 'g'), to);
});

fs.writeFileSync(indexPath, content);
console.log('✅ Fixed all import paths in database/index.ts');
