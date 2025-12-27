# API & Database Implementation Verification Checklist
## Smoke Test: Everything Exists and Connects

---

# HOW TO USE

For each row:
1. ✅ **API** - Endpoint responds (not 404/501)
2. ✅ **DB** - Data persists to correct table(s)
3. ✅ **Round-trip** - Create → Read returns same data

Mark: ✓ Pass | ✗ Fail | - N/A

---

# PHASE 1: CORE INFRASTRUCTURE

## Data Pools → `data_pools`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools` | GET | `data_pools` | Returns list from table |
| `/api/v1/data-pools` | POST | `data_pools` | Row inserted |
| `/api/v1/data-pools/{id}` | GET | `data_pools` | Correct row returned |
| `/api/v1/data-pools/{id}` | PATCH | `data_pools` | Row updated |
| `/api/v1/data-pools/{id}` | DELETE | `data_pools` | Row deleted |
| `/api/v1/data-pools/{id}/statistics` | GET | `data_pools.statistics` | JSON field returned |

**Quick Test:** Create pool → GET by ID → DELETE → GET returns 404

---

## File Uploads → `uploads` (if exists) or filesystem

| API Endpoint | Method | Storage | Verify |
|--------------|--------|---------|--------|
| `/api/v1/uploads` | POST | Filesystem + metadata | File saved, record created |
| `/api/v1/uploads/{id}` | GET | Metadata table/memory | Upload info returned |
| `/api/v1/uploads/{id}/preview` | GET | Filesystem | File parsed, preview returned |
| `/api/v1/uploads/{id}` | DELETE | Filesystem + metadata | File + record removed |

**Quick Test:** Upload CSV → Preview shows columns → Delete → File gone

---

## Import Jobs → `import_jobs`, `import_job_runs`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/import-jobs` | GET | `import_jobs` | List returned |
| `/api/v1/import-jobs` | POST | `import_jobs` | Row inserted |
| `/api/v1/import-jobs/{id}` | GET | `import_jobs` | Row returned |
| `/api/v1/import-jobs/{id}` | PATCH | `import_jobs` | Row updated |
| `/api/v1/import-jobs/{id}` | DELETE | `import_jobs` | Row deleted |
| `/api/v1/import-jobs/{id}/actions/run` | POST | `import_job_runs` | Run record created |
| `/api/v1/import-jobs/{id}/runs` | GET | `import_job_runs` | Runs listed |
| `/api/v1/import-jobs/{id}/runs/{run_id}` | GET | `import_job_runs` | Run details |

**Quick Test:** Create job → Run → Check run in `import_job_runs` → Check events created

---

## Event Logs → `event_logs`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/event-logs` | GET | `event_logs` | List returned |
| `/api/v1/event-logs` | POST | `event_logs` | Row inserted |
| `/api/v1/event-logs/{id}` | GET | `event_logs` | Row + stats returned |
| `/api/v1/event-logs/{id}` | PATCH | `event_logs` | Row updated |
| `/api/v1/event-logs/{id}` | DELETE | `event_logs` | Row + children deleted |
| `/api/v1/event-logs/{id}/statistics` | GET | `event_logs.statistics` | JSON computed/returned |
| `/api/v1/event-logs/{id}/export` | GET | `cases`, `events` | File generated from data |

**Quick Test:** Import creates log → Stats populated → Export produces file

---

# PHASE 2: CASE-CENTRIC

## Cases → `cases`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/event-logs/{id}/cases` | GET | `cases` | Filtered by event_log_id |
| `/api/v1/event-logs/{id}/cases/{id}` | GET | `cases` | Single case + attributes |
| `/api/v1/event-logs/{id}/cases/{id}/events` | GET | `events` | Filtered by case_id |
| `/api/v1/event-logs/{id}/cases/{id}/timeline` | GET | `events` | Computed from events |

**Quick Test:** Import data → List cases → Get case → Events match case_id FK

---

## Events → `events`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/event-logs/{id}/events` | GET | `events` | Filtered by event_log_id |
| `/api/v1/event-logs/{id}/events/{id}` | GET | `events` | Single event |
| `/api/v1/event-logs/{id}/events/dfg` | GET | `events` | Computed DFG |

**Quick Test:** Events belong to correct log → DFG nodes = distinct activities

---

## Activities → `activities`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/event-logs/{id}/activities` | GET | `activities` | Filtered by event_log_id |
| `/api/v1/event-logs/{id}/activities/{id}` | GET | `activities` | Single activity |
| `/api/v1/event-logs/{id}/activities/{id}` | PATCH | `activities` | Row updated |
| `/api/v1/event-logs/{id}/activities/{id}/transitions` | GET | `events` | Computed from events |

**Quick Test:** Activities created during import → Count matches distinct event activities

---

## Variants → `variants`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/event-logs/{id}/variants` | GET | `variants` | Filtered by event_log_id |
| `/api/v1/event-logs/{id}/variants/{id}` | GET | `variants` | Single variant |
| `/api/v1/event-logs/{id}/variants/{id}/cases` | GET | `cases` | Filtered by variant_id |

**Quick Test:** Variants detected → Sum of case_counts = total cases

---

## Resources → `resources`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/event-logs/{id}/resources` | GET | `resources` | Filtered by event_log_id |
| `/api/v1/event-logs/{id}/resources/{id}` | GET | `resources` | Single resource |
| `/api/v1/event-logs/{id}/resources/{id}` | PATCH | `resources` | Row updated |
| `/api/v1/event-logs/{id}/resources/handover-matrix` | GET | `events` | Computed from events |

**Quick Test:** Resources created during import → FK links valid

---

# PHASE 3: OCEL

## Object Types → `ocel_object_types`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools/{id}/object-types` | GET | `ocel_object_types` | Filtered by data_pool_id |
| `/api/v1/data-pools/{id}/object-types` | POST | `ocel_object_types` | Row inserted |
| `/api/v1/data-pools/{id}/object-types/{id}` | GET | `ocel_object_types` | Single type |
| `/api/v1/data-pools/{id}/object-types/{id}` | PATCH | `ocel_object_types` | Row updated |
| `/api/v1/data-pools/{id}/object-types/{id}` | DELETE | `ocel_object_types` | Row + objects deleted |

---

## Event Types → `ocel_event_types`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools/{id}/event-types` | GET | `ocel_event_types` | Filtered by data_pool_id |
| `/api/v1/data-pools/{id}/event-types` | POST | `ocel_event_types` | Row inserted |
| `/api/v1/data-pools/{id}/event-types/{id}` | GET | `ocel_event_types` | Single type |
| `/api/v1/data-pools/{id}/event-types/{id}` | PATCH | `ocel_event_types` | Row updated |
| `/api/v1/data-pools/{id}/event-types/{id}` | DELETE | `ocel_event_types` | Row + events deleted |

---

## OCEL Objects → `ocel_objects`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools/{id}/objects` | GET | `ocel_objects` | Filtered list |
| `/api/v1/data-pools/{id}/objects/{id}` | GET | `ocel_objects` | Single object |
| `/api/v1/data-pools/{id}/objects/{id}/events` | GET | `ocel_e2o` → `ocel_events` | Join via E2O |
| `/api/v1/data-pools/{id}/objects/{id}/related-objects` | GET | `ocel_o2o` | O2O relationships |
| `/api/v1/data-pools/{id}/objects/{id}/lifecycle` | GET | `ocel_e2o`, `ocel_events` | Computed |
| `/api/v1/data-pools/{id}/objects/{id}/attribute-history` | GET | `ocel_object_changes` | Change records |

**Quick Test:** Object → Events via E2O join works → Related objects via O2O

---

## OCEL Events → `ocel_events`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools/{id}/ocel-events` | GET | `ocel_events` | Filtered list |
| `/api/v1/data-pools/{id}/ocel-events/{id}` | GET | `ocel_events` | Single event |
| `/api/v1/data-pools/{id}/ocel-events/{id}/objects` | GET | `ocel_e2o` → `ocel_objects` | Join via E2O |

---

## E2O & O2O → `ocel_e2o`, `ocel_o2o`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools/{id}/object-relationships` | GET | `ocel_o2o` | List relationships |
| `/api/v1/data-pools/{id}/object-relationships` | POST | `ocel_o2o` | Row inserted |
| `/api/v1/data-pools/{id}/object-relationships/{id}` | DELETE | `ocel_o2o` | Row deleted |

**Quick Test:** E2O created during OCEL import → Query object's events works

---

## OCEL Import/Export

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/data-pools/{id}/ocel/import` | POST | All OCEL tables | Types, objects, events, E2O created |
| `/api/v1/data-pools/{id}/ocel/export` | GET | All OCEL tables | Valid OCEL JSON/XML |

**Quick Test:** Import OCEL → All tables populated → Export → Reimport matches

---

# PHASE 4: DISCOVERY

## Discovery Jobs → `discovered_models`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/discovery/run` | POST | `discovered_models` | Model created |
| `/api/v1/discovery/jobs` | GET | Job queue/status | List returned |
| `/api/v1/discovery/jobs/{id}` | GET | Job status | Status returned |
| `/api/v1/discovery/algorithms` | GET | Static/config | Algorithm list |

---

## Models → `discovered_models`, `petri_nets`, etc.

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/models` | GET | `discovered_models` | List returned |
| `/api/v1/models/{id}` | GET | `discovered_models` | Model details |
| `/api/v1/models/{id}` | PATCH | `discovered_models` | Row updated |
| `/api/v1/models/{id}` | DELETE | `discovered_models` + children | Cascade delete |
| `/api/v1/models/{id}/visualize` | GET | `petri_nets`, `petri_net_*` | Structure returned |
| `/api/v1/models/{id}/export` | GET | Model tables | File generated |

---

## Petri Nets → `petri_nets`, `petri_net_places`, `petri_net_transitions`, `petri_net_arcs`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/models/{id}/petri-net` | GET | `petri_nets` | Net structure |
| `/api/v1/models/{id}/petri-net/places` | GET | `petri_net_places` | Places list |
| `/api/v1/models/{id}/petri-net/transitions` | GET | `petri_net_transitions` | Transitions list |
| `/api/v1/models/{id}/petri-net/arcs` | GET | `petri_net_arcs` | Arcs list |
| `/api/v1/models/{id}/petri-net/simulate` | POST | In-memory | Simulation result |

**Quick Test:** Discovery creates model → Petri net tables populated → Arcs reference valid place/transition IDs

---

# PHASE 5: CONFORMANCE

## Conformance Jobs → `conformance_jobs`, `conformance_results`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/conformance/run` | POST | `conformance_jobs`, `conformance_results` | Job + results created |
| `/api/v1/conformance/jobs` | GET | `conformance_jobs` | List returned |
| `/api/v1/conformance/jobs/{id}` | GET | `conformance_jobs` | Job details |
| `/api/v1/conformance/jobs/{id}/results` | GET | `conformance_results` | Results returned |

---

## Results Detail → `deviations`, `alignments`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/conformance/jobs/{id}/results/deviations` | GET | `deviations` | Deviations list |
| `/api/v1/conformance/jobs/{id}/results/deviations/summary` | GET | `deviations` | Aggregated |
| `/api/v1/conformance/jobs/{id}/results/alignments` | GET | `alignments` | Alignments list |
| `/api/v1/conformance/jobs/{id}/results/alignments/{case_id}` | GET | `alignments` | Single alignment |

**Quick Test:** Run conformance → Results in `conformance_results` → Deviations in `deviations`

---

## Quality Metrics → `quality_metrics`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/models/{id}/quality` | GET | `quality_metrics` | Latest metrics |
| `/api/v1/models/{id}/quality/history` | GET | `quality_metrics` | Time series |
| `/api/v1/models/{id}/quality/compute` | POST | `quality_metrics` | New row inserted |

---

# PHASE 6: ANALYTICS

## Performance Metrics → `performance_metrics`, `metric_values`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/analytics/metrics` | GET | `performance_metrics` | List returned |
| `/api/v1/analytics/metrics` | POST | `performance_metrics` | Row inserted |
| `/api/v1/analytics/metrics/{id}` | GET | `performance_metrics` | Single metric |
| `/api/v1/analytics/metrics/{id}` | PATCH | `performance_metrics` | Row updated |
| `/api/v1/analytics/metrics/{id}` | DELETE | `performance_metrics` | Row deleted |
| `/api/v1/analytics/metrics/{id}/compute` | POST | `metric_values` | Value row inserted |
| `/api/v1/analytics/metrics/{id}/values` | GET | `metric_values` | Time series |

---

## Bottlenecks → `bottleneck_analyses`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/analytics/bottlenecks/analyze` | POST | `bottleneck_analyses` | Row inserted |
| `/api/v1/analytics/bottlenecks` | GET | `bottleneck_analyses` | List returned |
| `/api/v1/analytics/bottlenecks/{id}` | GET | `bottleneck_analyses` | Results JSON |

---

## SNA → `sna_results`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/analytics/sna/analyze` | POST | `sna_results` | Row inserted |
| `/api/v1/analytics/sna` | GET | `sna_results` | List returned |
| `/api/v1/analytics/sna/{id}` | GET | `sna_results` | Network JSON |

---

## Dashboards → `dashboards`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/dashboards` | GET | `dashboards` | List returned |
| `/api/v1/dashboards` | POST | `dashboards` | Row inserted |
| `/api/v1/dashboards/{id}` | GET | `dashboards` | Single dashboard |
| `/api/v1/dashboards/{id}` | PATCH | `dashboards` | Row updated |
| `/api/v1/dashboards/{id}` | DELETE | `dashboards` | Row deleted |
| `/api/v1/dashboards/{id}/data` | GET | Multiple tables | Widget data computed |

---

# PHASE 7: ONTOLOGY

## Ontologies → `ontologies`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/ontologies` | GET | `ontologies` | List returned |
| `/api/v1/ontologies` | POST | `ontologies` | Row + file stored |
| `/api/v1/ontologies/{id}` | GET | `ontologies` | Single ontology |
| `/api/v1/ontologies/{id}` | PATCH | `ontologies` | Row updated |
| `/api/v1/ontologies/{id}` | DELETE | `ontologies` | Row + concepts deleted |
| `/api/v1/ontologies/{id}/export` | GET | Filesystem | File returned |
| `/api/v1/ontologies/{id}/parse` | POST | `concepts` | Concepts extracted |

---

## Concepts → `concepts`, `concept_relations`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/ontologies/{id}/concepts` | GET | `concepts` | Filtered list |
| `/api/v1/ontologies/{id}/concepts/{id}` | GET | `concepts` | Single concept |
| `/api/v1/ontologies/{id}/concepts/{id}/hierarchy` | GET | `concepts` | Parent/children |
| `/api/v1/ontologies/{id}/concepts/{id}/related` | GET | `concept_relations` | Relations |
| `/api/v1/ontologies/{id}/concepts/tree` | GET | `concepts` | Full tree |

---

## Annotations → `annotations`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/annotations` | GET | `annotations` | List returned |
| `/api/v1/annotations` | POST | `annotations` | Row inserted |
| `/api/v1/annotations/{id}` | DELETE | `annotations` | Row deleted |
| `/api/v1/annotations/bulk` | POST | `annotations` | Multiple rows |
| `/api/v1/annotations/by-entity/{type}/{id}` | GET | `annotations` | Filtered |
| `/api/v1/annotations/by-concept/{id}` | GET | `annotations` | Filtered |

---

# PHASE 8: AUTOMATION

## Action Rules → `action_rules`, `actions`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/automation/rules` | GET | `action_rules` | List returned |
| `/api/v1/automation/rules` | POST | `action_rules` | Row inserted |
| `/api/v1/automation/rules/{id}` | GET | `action_rules` | Single rule |
| `/api/v1/automation/rules/{id}` | PATCH | `action_rules` | Row updated |
| `/api/v1/automation/rules/{id}` | DELETE | `action_rules` | Row deleted |
| `/api/v1/automation/rules/{id}/test` | POST | In-memory | Test result |
| `/api/v1/automation/rules/{id}/enable` | POST | `action_rules` | is_active = true |
| `/api/v1/automation/rules/{id}/disable` | POST | `action_rules` | is_active = false |

---

## Scheduled Jobs → `scheduled_jobs`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/automation/schedules` | GET | `scheduled_jobs` | List returned |
| `/api/v1/automation/schedules` | POST | `scheduled_jobs` | Row inserted |
| `/api/v1/automation/schedules/{id}` | GET | `scheduled_jobs` | Single job |
| `/api/v1/automation/schedules/{id}` | PATCH | `scheduled_jobs` | Row updated |
| `/api/v1/automation/schedules/{id}` | DELETE | `scheduled_jobs` | Row deleted |
| `/api/v1/automation/schedules/{id}/run-now` | POST | `action_executions` | Execution created |

---

## Executions → `action_executions`

| API Endpoint | Method | DB Table(s) | Verify |
|--------------|--------|-------------|--------|
| `/api/v1/automation/executions` | GET | `action_executions` | List returned |
| `/api/v1/automation/executions/{id}` | GET | `action_executions` | Single execution |

---

# FOREIGN KEY VERIFICATION

## Critical FK Relationships to Verify

| Child Table | FK Column | Parent Table | Test |
|-------------|-----------|--------------|------|
| `data_pools` | `tenant_id` | `tenants` | Pool links to tenant |
| `event_logs` | `data_pool_id` | `data_pools` | Log links to pool |
| `cases` | `event_log_id` | `event_logs` | Case links to log |
| `cases` | `variant_id` | `variants` | Case links to variant |
| `events` | `case_id` | `cases` | Event links to case |
| `events` | `activity_id` | `activities` | Event links to activity |
| `events` | `resource_id` | `resources` | Event links to resource |
| `variants` | `event_log_id` | `event_logs` | Variant links to log |
| `activities` | `event_log_id` | `event_logs` | Activity links to log |
| `resources` | `event_log_id` | `event_logs` | Resource links to log |
| `ocel_objects` | `object_type_id` | `ocel_object_types` | Object links to type |
| `ocel_events` | `event_type_id` | `ocel_event_types` | Event links to type |
| `ocel_e2o` | `event_id` | `ocel_events` | E2O links to event |
| `ocel_e2o` | `object_id` | `ocel_objects` | E2O links to object |
| `ocel_o2o` | `source_object_id` | `ocel_objects` | O2O source valid |
| `ocel_o2o` | `target_object_id` | `ocel_objects` | O2O target valid |
| `discovered_models` | `event_log_id` | `event_logs` | Model links to log |
| `petri_nets` | `discovered_model_id` | `discovered_models` | Net links to model |
| `petri_net_places` | `petri_net_id` | `petri_nets` | Place links to net |
| `petri_net_transitions` | `petri_net_id` | `petri_nets` | Transition links to net |
| `petri_net_arcs` | `petri_net_id` | `petri_nets` | Arc links to net |
| `conformance_jobs` | `model_id` | `discovered_models` | Job links to model |
| `conformance_results` | `conformance_job_id` | `conformance_jobs` | Result links to job |
| `deviations` | `conformance_result_id` | `conformance_results` | Deviation links to result |
| `alignments` | `conformance_result_id` | `conformance_results` | Alignment links to result |
| `annotations` | `concept_id` | `concepts` | Annotation links to concept |
| `concepts` | `ontology_id` | `ontologies` | Concept links to ontology |

---

# CASCADE DELETE VERIFICATION

| Delete This | Should Also Delete | Verify |
|-------------|-------------------|--------|
| `data_pools` | `event_logs`, `ocel_*` | All children gone |
| `event_logs` | `cases`, `events`, `activities`, `variants`, `resources` | All children gone |
| `cases` | `events` for that case | Events removed |
| `ocel_object_types` | `ocel_objects` of that type | Objects removed |
| `ocel_objects` | `ocel_e2o`, `ocel_o2o` refs | Relationships removed |
| `ocel_event_types` | `ocel_events` of that type | Events removed |
| `ocel_events` | `ocel_e2o` for that event | E2O removed |
| `discovered_models` | `petri_nets`, `conformance_jobs` | Children removed |
| `petri_nets` | `petri_net_places`, `transitions`, `arcs` | Children removed |
| `conformance_jobs` | `conformance_results` | Results removed |
| `conformance_results` | `deviations`, `alignments` | Children removed |
| `ontologies` | `concepts` | Concepts removed |

---

# QUICK VERIFICATION SCRIPT LOGIC

```
For each endpoint:
  1. Call OPTIONS or GET → Should not return 404/501
  2. For POST endpoints: Create minimal valid object
  3. Query DB directly: Verify row exists
  4. Call GET on created resource: Verify data matches
  5. Call DELETE: Verify row removed
  6. Call GET again: Should return 404
```

---

# SUMMARY COUNTS

| Phase | Endpoints | Tables | FKs to Verify |
|-------|-----------|--------|---------------|
| 1: Core | 22 | 4 | 4 |
| 2: Case-Centric | 20 | 5 | 7 |
| 3: OCEL | 24 | 7 | 8 |
| 4: Discovery | 16 | 5 | 5 |
| 5: Conformance | 14 | 4 | 4 |
| 6: Analytics | 18 | 5 | 2 |
| 7: Ontology | 16 | 4 | 3 |
| 8: Automation | 14 | 3 | 2 |
| **TOTAL** | **144** | **37** | **35** |

---

# IMPLEMENTATION STATUS TRACKER

| Phase | API Done | DB Done | Connected | Tested |
|-------|----------|---------|-----------|--------|
| 1: Core | ☐ | ☐ | ☐ | ☐ |
| 2: Case-Centric | ☐ | ☐ | ☐ | ☐ |
| 3: OCEL | ☐ | ☐ | ☐ | ☐ |
| 4: Discovery | ☐ | ☐ | ☐ | ☐ |
| 5: Conformance | ☐ | ☐ | ☐ | ☐ |
| 6: Analytics | ☐ | ☐ | ☐ | ☐ |
| 7: Ontology | ☐ | ☐ | ☐ | ☐ |
| 8: Automation | ☐ | ☐ | ☐ | ☐ |

---

*Use this to verify all pieces exist and connect before running detailed functional tests.*
