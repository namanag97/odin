# Process Mining Platform - Test Checklist

## E2E & Integration Test Specifications

---

# QUICK REFERENCE

## Test Priority Legend

- **P0** = Critical path, must pass for release
- **P1** = Important functionality
- **P2** = Edge cases and error handling
- **P3** = Nice to have, low risk

## Test Type Legend

- **E2E** = End-to-end user flow
- **INT** = Integration between components
- **BIZ** = Business logic validation
- **DATA** = Data integrity check

---

# PHASE 1: CORE INFRASTRUCTURE

## 1.1 Data Pools

### Happy Path Tests

| ID     | Type | Priority | Test Scenario                             | Expected Outcome                           |
| ------ | ---- | -------- | ----------------------------------------- | ------------------------------------------ |
| DP-001 | E2E  | P0       | Create data pool with valid name and type | Pool created, returns ID, appears in list  |
| DP-002 | E2E  | P0       | Retrieve data pool by ID                  | Returns correct pool with all fields       |
| DP-003 | E2E  | P0       | List all data pools                       | Returns paginated list with correct count  |
| DP-004 | E2E  | P1       | Update data pool name and description     | Changes persisted, updated_at modified     |
| DP-005 | E2E  | P1       | Delete empty data pool                    | Pool removed, no longer in list            |
| DP-006 | BIZ  | P1       | Archive data pool                         | Status changes to archived, data preserved |

### Validation Tests

| ID     | Type | Priority | Test Scenario                        | Expected Outcome                                 |
| ------ | ---- | -------- | ------------------------------------ | ------------------------------------------------ |
| DP-010 | BIZ  | P0       | Create pool with duplicate name      | 409 Conflict error                               |
| DP-011 | BIZ  | P0       | Create pool without required name    | 400 Validation error with field details          |
| DP-012 | BIZ  | P1       | Create pool with invalid pool_type   | 400 Validation error listing valid types         |
| DP-013 | BIZ  | P1       | Get non-existent pool                | 404 Not Found                                    |
| DP-014 | BIZ  | P1       | Delete pool with existing event logs | 409 Conflict or cascade delete (define behavior) |

### Query Tests

| ID     | Type | Priority | Test Scenario                    | Expected Outcome            |
| ------ | ---- | -------- | -------------------------------- | --------------------------- |
| DP-020 | INT  | P1       | Filter pools by status           | Returns only matching pools |
| DP-021 | INT  | P1       | Filter pools by pool_type        | Returns only matching type  |
| DP-022 | INT  | P1       | Search pools by name (contains)  | Returns partial matches     |
| DP-023 | INT  | P1       | Sort pools by created_at desc    | Most recent first           |
| DP-024 | INT  | P1       | Paginate with page=2, per_page=5 | Returns correct slice       |
| DP-025 | INT  | P2       | Include statistics in response   | Statistics object populated |

---

## 1.2 File Uploads

### Happy Path Tests

| ID     | Type | Priority | Test Scenario                     | Expected Outcome                             |
| ------ | ---- | -------- | --------------------------------- | -------------------------------------------- |
| UP-001 | E2E  | P0       | Upload valid CSV file             | Upload created, status=ready, file stored    |
| UP-002 | E2E  | P0       | Upload valid XES file             | Upload created, format detected as xes       |
| UP-003 | E2E  | P0       | Upload valid OCEL JSON file       | Upload created, format detected              |
| UP-004 | E2E  | P1       | Upload gzipped XES file (.xes.gz) | Decompressed and parsed correctly            |
| UP-005 | E2E  | P1       | Get upload status                 | Returns current status and metadata          |
| UP-006 | E2E  | P0       | Preview CSV file                  | Returns columns, sample data, detected types |
| UP-007 | E2E  | P1       | Preview XES file                  | Returns case/event counts, attribute list    |
| UP-008 | E2E  | P1       | Delete uploaded file              | File removed from storage, record deleted    |

### Schema Detection Tests

| ID     | Type | Priority | Test Scenario                         | Expected Outcome                                   |
| ------ | ---- | -------- | ------------------------------------- | -------------------------------------------------- |
| UP-020 | BIZ  | P0       | Auto-detect CSV delimiter (comma)     | Correctly identified as comma                      |
| UP-021 | BIZ  | P0       | Auto-detect CSV delimiter (semicolon) | Correctly identified as semicolon                  |
| UP-022 | BIZ  | P0       | Auto-detect timestamp column          | Timestamp column identified                        |
| UP-023 | BIZ  | P1       | Auto-detect case ID column            | Case ID suggested based on patterns                |
| UP-024 | BIZ  | P1       | Detect column data types              | String/integer/float/datetime correctly identified |
| UP-025 | BIZ  | P1       | Handle CSV with/without header        | Header presence detected                           |

### Validation Tests

| ID     | Type | Priority | Test Scenario                    | Expected Outcome                           |
| ------ | ---- | -------- | -------------------------------- | ------------------------------------------ |
| UP-030 | BIZ  | P0       | Upload file exceeding size limit | 413 File Too Large                         |
| UP-031 | BIZ  | P0       | Upload unsupported file type     | 400 Invalid Format                         |
| UP-032 | BIZ  | P1       | Upload malformed CSV             | status=error, validation errors populated  |
| UP-033 | BIZ  | P1       | Upload malformed XES             | status=error, XML parse error              |
| UP-034 | BIZ  | P1       | Upload empty file                | 400 or status=error                        |
| UP-035 | BIZ  | P2       | Upload CSV with encoding issues  | Handles UTF-8 BOM, reports other encodings |

### File Format Tests

| ID     | Type | Priority | Test Scenario                | Expected Outcome                        |
| ------ | ---- | -------- | ---------------------------- | --------------------------------------- |
| UP-040 | INT  | P0       | Validate XES against schema  | Valid XES passes, invalid fails         |
| UP-041 | INT  | P0       | Validate OCEL JSON structure | Required fields checked                 |
| UP-042 | INT  | P1       | Parse XES extensions         | Extensions extracted to metadata        |
| UP-043 | INT  | P1       | Parse XES classifiers        | Classifiers extracted                   |
| UP-044 | INT  | P2       | Handle large file (100MB+)   | Processes without timeout/memory issues |

---

## 1.3 Import Jobs

### Happy Path Tests

| ID     | Type | Priority | Test Scenario                        | Expected Outcome                          |
| ------ | ---- | -------- | ------------------------------------ | ----------------------------------------- |
| IJ-001 | E2E  | P0       | Create import job with valid mapping | Job created, mapping saved                |
| IJ-002 | E2E  | P0       | Run import job on CSV                | Job runs, events created, status=success  |
| IJ-003 | E2E  | P0       | Run import job on XES                | Job runs, cases/events imported correctly |
| IJ-004 | E2E  | P1       | Get import job status during run     | Returns progress percentage               |
| IJ-005 | E2E  | P1       | Get import job run history           | Returns list of past runs                 |
| IJ-006 | E2E  | P1       | Cancel running import job            | Status changes to cancelled               |
| IJ-007 | E2E  | P1       | Re-run import job                    | New run created, data refreshed           |

### Mapping Tests

| ID     | Type | Priority | Test Scenario                            | Expected Outcome                    |
| ------ | ---- | -------- | ---------------------------------------- | ----------------------------------- |
| IJ-020 | BIZ  | P0       | Map case_id, activity, timestamp columns | Core columns mapped correctly       |
| IJ-021 | BIZ  | P0       | Map additional case attributes           | Case attributes stored in JSON      |
| IJ-022 | BIZ  | P0       | Map additional event attributes          | Event attributes stored in JSON     |
| IJ-023 | BIZ  | P1       | Map resource column                      | Resources created, linked to events |
| IJ-024 | BIZ  | P1       | Map cost column                          | Cost values imported                |
| IJ-025 | BIZ  | P1       | Apply data type conversions              | Strings to int/float/datetime       |
| IJ-026 | BIZ  | P1       | Handle custom timestamp format           | Parses non-ISO formats              |
| IJ-027 | BIZ  | P2       | Apply filter conditions                  | Only matching rows imported         |

### OCEL Mapping Tests

| ID     | Type | Priority | Test Scenario                    | Expected Outcome                       |
| ------ | ---- | -------- | -------------------------------- | -------------------------------------- |
| IJ-030 | BIZ  | P0       | Map OCEL event_id and event_type | Events created with correct types      |
| IJ-031 | BIZ  | P0       | Map single object type           | Objects created, E2O links established |
| IJ-032 | BIZ  | P0       | Map multiple object types        | Multiple object types imported         |
| IJ-033 | BIZ  | P1       | Map qualifier column             | Qualifiers stored on E2O               |
| IJ-034 | BIZ  | P1       | Map qualifier value              | Quantitative qualifiers stored         |
| IJ-035 | BIZ  | P2       | Handle missing object references | Graceful handling, logged warnings     |

### Error Handling Tests

| ID     | Type | Priority | Test Scenario                          | Expected Outcome                            |
| ------ | ---- | -------- | -------------------------------------- | ------------------------------------------- |
| IJ-040 | BIZ  | P0       | Run job with invalid mapping           | status=failed, error message clear          |
| IJ-041 | BIZ  | P1       | Run job on missing file                | status=failed, file not found error         |
| IJ-042 | BIZ  | P1       | Handle row with missing required field | Row skipped, error logged                   |
| IJ-043 | BIZ  | P1       | Handle invalid timestamp value         | Row skipped or default, error logged        |
| IJ-044 | BIZ  | P2       | Partial failure (some rows fail)       | Success with error count, details available |

### Data Integrity Tests

| ID     | Type | Priority | Test Scenario                      | Expected Outcome                      |
| ------ | ---- | -------- | ---------------------------------- | ------------------------------------- |
| IJ-050 | DATA | P0       | Import creates correct case count  | Case count matches unique case IDs    |
| IJ-051 | DATA | P0       | Import creates correct event count | Event count matches source rows       |
| IJ-052 | DATA | P0       | Events linked to correct cases     | Foreign keys valid                    |
| IJ-053 | DATA | P1       | Case start/end times computed      | Derived from min/max event timestamps |
| IJ-054 | DATA | P1       | Case duration computed             | end_time - start_time correct         |
| IJ-055 | DATA | P1       | Event sort order preserved         | Timestamp + sort_key ordering         |
| IJ-056 | DATA | P1       | Re-import replaces data cleanly    | No orphaned records                   |

---

## 1.4 Event Logs

### Happy Path Tests

| ID     | Type | Priority | Test Scenario             | Expected Outcome                    |
| ------ | ---- | -------- | ------------------------- | ----------------------------------- |
| EL-001 | E2E  | P0       | Create event log manually | Log created with schema             |
| EL-002 | E2E  | P0       | Get event log details     | All fields returned including stats |
| EL-003 | E2E  | P1       | Update event log metadata | Changes saved                       |
| EL-004 | E2E  | P1       | Delete event log          | Log and all cases/events removed    |
| EL-005 | E2E  | P1       | Compute statistics        | Stats calculated and cached         |
| EL-006 | E2E  | P0       | Export to CSV             | Valid CSV with correct data         |
| EL-007 | E2E  | P0       | Export to XES             | Valid XES file                      |

### Statistics Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome              |
| ------ | ---- | -------- | ------------------------ | ----------------------------- |
| EL-020 | BIZ  | P0       | Case count correct       | Matches actual case records   |
| EL-021 | BIZ  | P0       | Event count correct      | Matches actual event records  |
| EL-022 | BIZ  | P0       | Activity count correct   | Unique activity names counted |
| EL-023 | BIZ  | P1       | Variant count correct    | Unique sequences counted      |
| EL-024 | BIZ  | P1       | Date range correct       | Min/max event timestamps      |
| EL-025 | BIZ  | P1       | Average duration correct | Computed from case durations  |
| EL-026 | BIZ  | P1       | Average events per case  | Total events / total cases    |

### Export Tests

| ID     | Type | Priority | Test Scenario                    | Expected Outcome                   |
| ------ | ---- | -------- | -------------------------------- | ---------------------------------- |
| EL-030 | INT  | P0       | Export filtered by date range    | Only matching events exported      |
| EL-031 | INT  | P1       | Export filtered by case IDs      | Only specified cases               |
| EL-032 | INT  | P1       | Export filtered by activities    | Only events with those activities  |
| EL-033 | INT  | P1       | Export with selected attributes  | Only specified attributes included |
| EL-034 | INT  | P0       | Exported XES is pm4py compatible | pm4py.read_xes() succeeds          |
| EL-035 | INT  | P2       | Large export (100k+ events)      | Completes without timeout          |

---

# PHASE 2: CASE-CENTRIC MINING

## 2.1 Cases

### Happy Path Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome                |
| ------ | ---- | -------- | ------------------------ | ------------------------------- |
| CA-001 | E2E  | P0       | List cases for event log | Paginated list returned         |
| CA-002 | E2E  | P0       | Get single case details  | All fields including attributes |
| CA-003 | E2E  | P0       | Get case events (trace)  | Ordered list of events          |
| CA-004 | E2E  | P1       | Get case timeline        | Visual timeline data structure  |
| CA-005 | E2E  | P1       | Delete case              | Case and events removed         |

### Query Tests

| ID     | Type | Priority | Test Scenario                 | Expected Outcome                 |
| ------ | ---- | -------- | ----------------------------- | -------------------------------- |
| CA-010 | INT  | P0       | Filter by case_id exact match | Returns specific case            |
| CA-011 | INT  | P0       | Filter by case_id contains    | Partial match works              |
| CA-012 | INT  | P1       | Filter by variant             | Returns cases of that variant    |
| CA-013 | INT  | P1       | Filter by status              | Returns matching status          |
| CA-014 | INT  | P1       | Filter by duration range      | Min/max duration respected       |
| CA-015 | INT  | P1       | Filter by start time range    | Date boundaries correct          |
| CA-016 | INT  | P1       | Filter by event count         | Min events threshold             |
| CA-017 | INT  | P1       | Filter by case attribute      | Custom attribute filtering works |
| CA-018 | INT  | P1       | Sort by duration              | Longest/shortest first           |
| CA-019 | INT  | P1       | Sort by start_time            | Chronological order              |

### Business Logic Tests

| ID     | Type | Priority | Test Scenario                    | Expected Outcome                   |
| ------ | ---- | -------- | -------------------------------- | ---------------------------------- |
| CA-020 | BIZ  | P0       | Case events ordered by timestamp | Events in chronological order      |
| CA-021 | BIZ  | P0       | Case event count matches         | event_count = actual events        |
| CA-022 | BIZ  | P1       | Timeline includes all events     | No events missing                  |
| CA-023 | BIZ  | P1       | Timeline relative times correct  | Seconds from start calculated      |
| CA-024 | BIZ  | P1       | Case status derived correctly    | open/completed based on activities |

---

## 2.2 Events

### Happy Path Tests

| ID     | Type | Priority | Test Scenario                    | Expected Outcome         |
| ------ | ---- | -------- | -------------------------------- | ------------------------ |
| EV-001 | E2E  | P0       | List events for event log        | Paginated list           |
| EV-002 | E2E  | P0       | Get single event                 | All fields returned      |
| EV-003 | E2E  | P1       | Get events for case              | Events filtered by case  |
| EV-004 | E2E  | P0       | Get DFG (directly-follows graph) | Nodes and edges returned |

### Query Tests

| ID     | Type | Priority | Test Scenario                      | Expected Outcome            |
| ------ | ---- | -------- | ---------------------------------- | --------------------------- |
| EV-010 | INT  | P0       | Filter by case_id                  | Returns events for case     |
| EV-011 | INT  | P0       | Filter by activity_name            | Exact match works           |
| EV-012 | INT  | P1       | Filter by multiple activities (in) | Returns matching activities |
| EV-013 | INT  | P1       | Filter by resource                 | Returns events by resource  |
| EV-014 | INT  | P1       | Filter by timestamp range          | Date boundaries respected   |
| EV-015 | INT  | P1       | Filter by lifecycle                | Start/complete filtered     |
| EV-016 | INT  | P1       | Filter by event attribute          | Custom attribute filtering  |
| EV-017 | INT  | P0       | Default sort by timestamp asc      | Chronological order         |

### DFG Tests

| ID     | Type | Priority | Test Scenario                      | Expected Outcome             |
| ------ | ---- | -------- | ---------------------------------- | ---------------------------- |
| EV-020 | BIZ  | P0       | DFG nodes = unique activities      | All activities present       |
| EV-021 | BIZ  | P0       | DFG edges = directly-follows pairs | A→B counted correctly        |
| EV-022 | BIZ  | P0       | DFG frequencies correct            | Edge counts match data       |
| EV-023 | BIZ  | P1       | Start activities identified        | is_start flag correct        |
| EV-024 | BIZ  | P1       | End activities identified          | is_end flag correct          |
| EV-025 | BIZ  | P1       | Performance stats on edges         | Mean/median/min/max computed |
| EV-026 | BIZ  | P2       | Self-loops detected                | A→A edges present            |

---

## 2.3 Activities

### Happy Path Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome               |
| ------ | ---- | -------- | ------------------------ | ------------------------------ |
| AC-001 | E2E  | P0       | List activities          | All unique activities returned |
| AC-002 | E2E  | P0       | Get activity details     | Statistics included            |
| AC-003 | E2E  | P1       | Update activity metadata | Display name, color saved      |
| AC-004 | E2E  | P1       | Get activity transitions | Incoming/outgoing edges        |

### Statistics Tests

| ID     | Type | Priority | Test Scenario                  | Expected Outcome                 |
| ------ | ---- | -------- | ------------------------------ | -------------------------------- |
| AC-010 | BIZ  | P0       | Occurrence count correct       | Matches event count for activity |
| AC-011 | BIZ  | P1       | Case coverage correct          | % of cases containing activity   |
| AC-012 | BIZ  | P1       | Average duration calculated    | Time from activity start to next |
| AC-013 | BIZ  | P1       | Is start/end activity detected | Based on position in traces      |

### Transition Tests

| ID     | Type | Priority | Test Scenario                  | Expected Outcome         |
| ------ | ---- | -------- | ------------------------------ | ------------------------ |
| AC-020 | BIZ  | P1       | Incoming transitions listed    | All preceding activities |
| AC-021 | BIZ  | P1       | Outgoing transitions listed    | All following activities |
| AC-022 | BIZ  | P1       | Transition frequencies correct | Counts match DFG         |
| AC-023 | BIZ  | P1       | Transition durations correct   | Average time between     |

---

## 2.4 Variants

### Happy Path Tests

| ID     | Type | Priority | Test Scenario             | Expected Outcome              |
| ------ | ---- | -------- | ------------------------- | ----------------------------- |
| VA-001 | E2E  | P0       | List variants             | Variants sorted by frequency  |
| VA-002 | E2E  | P0       | Get variant details       | Sequence and stats            |
| VA-003 | E2E  | P1       | Get cases for variant     | Returns matching cases        |
| VA-004 | E2E  | P1       | Compare variants          | Comparison structure returned |
| VA-005 | E2E  | P1       | Detect/recompute variants | Variants refreshed            |

### Detection Tests

| ID     | Type | Priority | Test Scenario                  | Expected Outcome             |
| ------ | ---- | -------- | ------------------------------ | ---------------------------- |
| VA-010 | BIZ  | P0       | Unique sequences detected      | Each unique path = 1 variant |
| VA-011 | BIZ  | P0       | Sequence hash unique           | Same sequence = same hash    |
| VA-012 | BIZ  | P0       | Case count per variant correct | Sum = total cases            |
| VA-013 | BIZ  | P1       | Percentage calculated          | case_count / total \* 100    |
| VA-014 | BIZ  | P1       | Duration stats computed        | Avg/min/max from cases       |

### Query Tests

| ID     | Type | Priority | Test Scenario               | Expected Outcome     |
| ------ | ---- | -------- | --------------------------- | -------------------- |
| VA-020 | INT  | P1       | Filter by min case count    | Threshold respected  |
| VA-021 | INT  | P1       | Filter by sequence length   | Length range works   |
| VA-022 | INT  | P1       | Filter by contains activity | Activity in sequence |
| VA-023 | INT  | P1       | Get top N variants          | Limited to N results |
| VA-024 | INT  | P0       | Default sort by frequency   | Most common first    |

### Comparison Tests

| ID     | Type | Priority | Test Scenario                | Expected Outcome            |
| ------ | ---- | -------- | ---------------------------- | --------------------------- |
| VA-030 | BIZ  | P1       | Common activities identified | Intersection of sequences   |
| VA-031 | BIZ  | P1       | Divergence points identified | Position where paths differ |
| VA-032 | BIZ  | P1       | Performance comparison       | Duration ranking            |

---

## 2.5 Resources

### Happy Path Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome       |
| ------ | ---- | -------- | ------------------------ | ---------------------- |
| RS-001 | E2E  | P0       | List resources           | All unique resources   |
| RS-002 | E2E  | P0       | Get resource details     | Stats and activities   |
| RS-003 | E2E  | P1       | Update resource metadata | Department, role saved |
| RS-004 | E2E  | P1       | Get resource activities  | Activities performed   |
| RS-005 | E2E  | P1       | Get handover matrix      | Resource interactions  |

### Statistics Tests

| ID     | Type | Priority | Test Scenario               | Expected Outcome            |
| ------ | ---- | -------- | --------------------------- | --------------------------- |
| RS-010 | BIZ  | P0       | Event count correct         | Events by this resource     |
| RS-011 | BIZ  | P1       | Case count correct          | Cases involving resource    |
| RS-012 | BIZ  | P1       | Distinct activities correct | Unique activities performed |
| RS-013 | BIZ  | P1       | Top activities listed       | Most frequent first         |

### Handover Tests

| ID     | Type | Priority | Test Scenario                  | Expected Outcome          |
| ------ | ---- | -------- | ------------------------------ | ------------------------- |
| RS-020 | BIZ  | P1       | Handover pairs detected        | A hands to B counted      |
| RS-021 | BIZ  | P1       | Handover frequency correct     | Count of handovers        |
| RS-022 | BIZ  | P1       | Average time between handovers | Computed correctly        |
| RS-023 | BIZ  | P2       | Self-handovers detected        | Same resource consecutive |

---

# PHASE 3: OCEL SUPPORT

## 3.1 Object Types

### Happy Path Tests

| ID     | Type | Priority | Test Scenario      | Expected Outcome         |
| ------ | ---- | -------- | ------------------ | ------------------------ |
| OT-001 | E2E  | P0       | Create object type | Type created with schema |
| OT-002 | E2E  | P0       | List object types  | All types for pool       |
| OT-003 | E2E  | P0       | Get object type    | Details and stats        |
| OT-004 | E2E  | P1       | Update object type | Schema changes saved     |
| OT-005 | E2E  | P1       | Delete object type | Cascade delete objects   |

### Schema Tests

| ID     | Type | Priority | Test Scenario             | Expected Outcome               |
| ------ | ---- | -------- | ------------------------- | ------------------------------ |
| OT-010 | BIZ  | P0       | Define attribute schema   | Attributes stored correctly    |
| OT-011 | BIZ  | P1       | Mark identifier attribute | is_identifier flag works       |
| OT-012 | BIZ  | P1       | Mark required attribute   | is_required flag works         |
| OT-013 | BIZ  | P1       | Support all data types    | string/int/float/datetime/bool |

---

## 3.2 Event Types

### Happy Path Tests

| ID     | Type | Priority | Test Scenario     | Expected Outcome                |
| ------ | ---- | -------- | ----------------- | ------------------------------- |
| ET-001 | E2E  | P0       | Create event type | Type created with schema        |
| ET-002 | E2E  | P0       | List event types  | All types for pool              |
| ET-003 | E2E  | P0       | Get event type    | Details with object involvement |
| ET-004 | E2E  | P1       | Update event type | Changes saved                   |
| ET-005 | E2E  | P1       | Delete event type | Cascade delete events           |

### Statistics Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome        |
| ------ | ---- | -------- | ------------------------ | ----------------------- |
| ET-010 | BIZ  | P0       | Occurrence count correct | Event count for type    |
| ET-011 | BIZ  | P1       | Avg objects per event    | Computed from E2O       |
| ET-012 | BIZ  | P1       | Object type involvement  | Which types participate |

---

## 3.3 OCEL Objects

### Happy Path Tests

| ID     | Type | Priority | Test Scenario         | Expected Outcome        |
| ------ | ---- | -------- | --------------------- | ----------------------- |
| OO-001 | E2E  | P0       | List objects          | Paginated by type       |
| OO-002 | E2E  | P0       | Get object details    | Attributes and stats    |
| OO-003 | E2E  | P1       | Get object events     | Events involving object |
| OO-004 | E2E  | P1       | Get related objects   | O2O relationships       |
| OO-005 | E2E  | P1       | Get object lifecycle  | Full lifecycle view     |
| OO-006 | E2E  | P2       | Get attribute history | Changes over time       |

### Query Tests

| ID     | Type | Priority | Test Scenario              | Expected Outcome        |
| ------ | ---- | -------- | -------------------------- | ----------------------- |
| OO-010 | INT  | P0       | Filter by object_type      | Returns matching type   |
| OO-011 | INT  | P1       | Filter by ocel_id          | Exact match             |
| OO-012 | INT  | P1       | Filter by attribute value  | Custom attribute filter |
| OO-013 | INT  | P1       | Filter by event count      | Min events threshold    |
| OO-014 | INT  | P1       | Include events in response | Events loaded           |
| OO-015 | INT  | P1       | Include related objects    | O2O loaded              |

### Lifecycle Tests

| ID     | Type | Priority | Test Scenario                  | Expected Outcome        |
| ------ | ---- | -------- | ------------------------------ | ----------------------- |
| OO-020 | BIZ  | P0       | Events ordered chronologically | Timestamp order         |
| OO-021 | BIZ  | P1       | Lifecycle duration calculated  | Last - first event      |
| OO-022 | BIZ  | P1       | Other objects in events shown  | Co-occurring objects    |
| OO-023 | BIZ  | P1       | Attribute changes tracked      | Change history complete |

---

## 3.4 OCEL Events

### Happy Path Tests

| ID     | Type | Priority | Test Scenario        | Expected Outcome       |
| ------ | ---- | -------- | -------------------- | ---------------------- |
| OE-001 | E2E  | P0       | List OCEL events     | Paginated list         |
| OE-002 | E2E  | P0       | Get event details    | All fields and objects |
| OE-003 | E2E  | P1       | Get objects in event | E2O relationships      |
| OE-004 | E2E  | P1       | Get OC-DFG           | Object-centric DFG     |

### Query Tests

| ID     | Type | Priority | Test Scenario                | Expected Outcome            |
| ------ | ---- | -------- | ---------------------------- | --------------------------- |
| OE-010 | INT  | P0       | Filter by event_type         | Returns matching type       |
| OE-011 | INT  | P1       | Filter by timestamp range    | Date boundaries             |
| OE-012 | INT  | P1       | Filter by object involvement | Events with specific object |

### OC-DFG Tests

| ID     | Type | Priority | Test Scenario               | Expected Outcome             |
| ------ | ---- | -------- | --------------------------- | ---------------------------- |
| OE-020 | BIZ  | P1       | DFG per object type         | Correct perspective          |
| OE-021 | BIZ  | P1       | Object flow on edges        | Which objects flow between   |
| OE-022 | BIZ  | P1       | Multi-object events handled | Events with multiple objects |

---

## 3.5 E2O Relationships

### Tests

| ID      | Type | Priority | Test Scenario          | Expected Outcome            |
| ------- | ---- | -------- | ---------------------- | --------------------------- |
| E2O-001 | BIZ  | P0       | E2O created on import  | Links established           |
| E2O-002 | BIZ  | P0       | Qualifier stored       | Role captured               |
| E2O-003 | BIZ  | P1       | Qualifier value stored | Quantitative value captured |
| E2O-004 | BIZ  | P1       | Query events by object | Returns linked events       |
| E2O-005 | BIZ  | P1       | Query objects by event | Returns linked objects      |

---

## 3.6 O2O Relationships

### Tests

| ID      | Type | Priority | Test Scenario           | Expected Outcome        |
| ------- | ---- | -------- | ----------------------- | ----------------------- |
| O2O-001 | E2E  | P1       | Create O2O relationship | Link created            |
| O2O-002 | E2E  | P1       | List relationships      | By source or target     |
| O2O-003 | E2E  | P1       | Delete relationship     | Link removed            |
| O2O-004 | BIZ  | P1       | Temporal validity       | Valid from/to respected |
| O2O-005 | BIZ  | P1       | Relationship types      | Types categorized       |
| O2O-006 | BIZ  | P2       | Object graph traversal  | Multi-hop queries work  |

---

## 3.7 OCEL Import/Export

### Import Tests

| ID     | Type | Priority | Test Scenario             | Expected Outcome      |
| ------ | ---- | -------- | ------------------------- | --------------------- |
| OI-001 | E2E  | P0       | Import OCEL JSON          | All data imported     |
| OI-002 | E2E  | P1       | Import OCEL XML           | All data imported     |
| OI-003 | BIZ  | P0       | Event types created       | From ocel:eventTypes  |
| OI-004 | BIZ  | P0       | Object types created      | From ocel:objectTypes |
| OI-005 | BIZ  | P0       | Events imported           | From ocel:events      |
| OI-006 | BIZ  | P0       | Objects imported          | From ocel:objects     |
| OI-007 | BIZ  | P0       | E2O relationships created | Event-object links    |
| OI-008 | BIZ  | P1       | Qualifiers imported       | E2O qualifiers        |
| OI-009 | BIZ  | P2       | Merge with existing data  | No duplicates         |

### Export Tests

| ID     | Type | Priority | Test Scenario                | Expected Outcome            |
| ------ | ---- | -------- | ---------------------------- | --------------------------- |
| OX-001 | E2E  | P0       | Export as OCEL JSON          | Valid OCEL structure        |
| OX-002 | E2E  | P1       | Export as OCEL XML           | Valid OCEL structure        |
| OX-003 | INT  | P0       | Export is OCEL 2.0 compliant | Validates against spec      |
| OX-004 | INT  | P1       | Filter by event types        | Only specified types        |
| OX-005 | INT  | P1       | Filter by object types       | Only specified types        |
| OX-006 | INT  | P1       | Filter by date range         | Time-bounded export         |
| OX-007 | INT  | P0       | Round-trip test              | Export → Import = same data |

---

# PHASE 4: PROCESS DISCOVERY

## 4.1 Discovery Jobs

### Happy Path Tests

| ID     | Type | Priority | Test Scenario                   | Expected Outcome                 |
| ------ | ---- | -------- | ------------------------------- | -------------------------------- |
| DJ-001 | E2E  | P0       | Run Alpha Miner                 | Job completes, Petri net created |
| DJ-002 | E2E  | P0       | Run Heuristics Miner            | Job completes, model created     |
| DJ-003 | E2E  | P0       | Run Inductive Miner             | Job completes, model created     |
| DJ-004 | E2E  | P0       | Run DFG discovery               | Job completes, DFG created       |
| DJ-005 | E2E  | P1       | Get job status during execution | Progress returned                |
| DJ-006 | E2E  | P1       | Cancel discovery job            | Status = cancelled               |
| DJ-007 | E2E  | P1       | List discovery jobs             | History returned                 |

### Algorithm Parameter Tests

| ID     | Type | Priority | Test Scenario                     | Expected Outcome          |
| ------ | ---- | -------- | --------------------------------- | ------------------------- |
| DJ-010 | BIZ  | P1       | Heuristics with custom thresholds | Parameters applied        |
| DJ-011 | BIZ  | P1       | Inductive with noise threshold    | Noise filtered            |
| DJ-012 | BIZ  | P1       | DFG with performance              | Edge performance computed |
| DJ-013 | BIZ  | P2       | OCEL OC-Petri net discovery       | Object-centric model      |

### Error Tests

| ID     | Type | Priority | Test Scenario                   | Expected Outcome       |
| ------ | ---- | -------- | ------------------------------- | ---------------------- |
| DJ-020 | BIZ  | P1       | Discovery on empty log          | Graceful error         |
| DJ-021 | BIZ  | P1       | Discovery on single-event cases | Handles edge case      |
| DJ-022 | BIZ  | P2       | Discovery timeout               | Job fails with timeout |

---

## 4.2 Discovered Models

### Happy Path Tests

| ID     | Type | Priority | Test Scenario           | Expected Outcome           |
| ------ | ---- | -------- | ----------------------- | -------------------------- |
| DM-001 | E2E  | P0       | List models             | All models returned        |
| DM-002 | E2E  | P0       | Get model details       | Full model with metrics    |
| DM-003 | E2E  | P1       | Update model metadata   | Name, description saved    |
| DM-004 | E2E  | P1       | Delete model            | Model removed              |
| DM-005 | E2E  | P0       | Get visualization data  | Render-ready structure     |
| DM-006 | E2E  | P1       | Compute quality metrics | Fitness/precision computed |

### Export Tests

| ID     | Type | Priority | Test Scenario  | Expected Outcome   |
| ------ | ---- | -------- | -------------- | ------------------ |
| DM-010 | INT  | P0       | Export as PNML | Valid PNML file    |
| DM-011 | INT  | P1       | Export as BPMN | Valid BPMN 2.0 XML |
| DM-012 | INT  | P1       | Export as JSON | Serialized model   |
| DM-013 | INT  | P1       | Export as SVG  | Visual rendering   |
| DM-014 | INT  | P2       | Export as PNG  | Image file         |
| DM-015 | INT  | P1       | Export as DOT  | Graphviz format    |

### Import Tests

| ID     | Type | Priority | Test Scenario | Expected Outcome  |
| ------ | ---- | -------- | ------------- | ----------------- |
| DM-020 | INT  | P1       | Import PNML   | Petri net created |
| DM-021 | INT  | P1       | Import BPMN   | Model created     |

---

## 4.3 Petri Net Operations

### Structure Tests

| ID     | Type | Priority | Test Scenario                 | Expected Outcome         |
| ------ | ---- | -------- | ----------------------------- | ------------------------ |
| PN-001 | BIZ  | P0       | Places list complete          | All places returned      |
| PN-002 | BIZ  | P0       | Transitions list complete     | All transitions returned |
| PN-003 | BIZ  | P0       | Arcs connect correctly        | Source/target valid      |
| PN-004 | BIZ  | P1       | Initial marking correct       | Start places marked      |
| PN-005 | BIZ  | P1       | Final marking correct         | End places marked        |
| PN-006 | BIZ  | P1       | Silent transitions identified | is_silent flag           |

### Property Tests

| ID     | Type | Priority | Test Scenario     | Expected Outcome    |
| ------ | ---- | -------- | ----------------- | ------------------- |
| PN-010 | BIZ  | P2       | Soundness check   | is_sound computed   |
| PN-011 | BIZ  | P2       | Liveness check    | is_live computed    |
| PN-012 | BIZ  | P2       | Boundedness check | is_bounded computed |

### Simulation Tests

| ID     | Type | Priority | Test Scenario              | Expected Outcome         |
| ------ | ---- | -------- | -------------------------- | ------------------------ |
| PN-020 | BIZ  | P1       | Step-by-step simulation    | Marking updated          |
| PN-021 | BIZ  | P1       | Enabled transitions listed | Correct enablement       |
| PN-022 | BIZ  | P1       | Detect deadlock            | deadlock flag when stuck |
| PN-023 | BIZ  | P1       | Reach final marking        | reached_final flag       |

---

# PHASE 5: CONFORMANCE & QUALITY

## 5.1 Conformance Jobs

### Happy Path Tests

| ID     | Type | Priority | Test Scenario      | Expected Outcome                |
| ------ | ---- | -------- | ------------------ | ------------------------------- |
| CJ-001 | E2E  | P0       | Run token replay   | Job completes, results saved    |
| CJ-002 | E2E  | P0       | Run alignment      | Job completes, alignments saved |
| CJ-003 | E2E  | P1       | Run footprints     | Job completes, results saved    |
| CJ-004 | E2E  | P1       | Get job status     | Progress returned               |
| CJ-005 | E2E  | P1       | Re-run conformance | New results computed            |

### Configuration Tests

| ID     | Type | Priority | Test Scenario     | Expected Outcome     |
| ------ | ---- | -------- | ----------------- | -------------------- |
| CJ-010 | BIZ  | P1       | Custom move costs | Costs applied        |
| CJ-011 | BIZ  | P1       | Sample size limit | Only N cases checked |
| CJ-012 | BIZ  | P1       | Timeout per trace | Long traces skipped  |

---

## 5.2 Conformance Results

### Metrics Tests

| ID     | Type | Priority | Test Scenario              | Expected Outcome         |
| ------ | ---- | -------- | -------------------------- | ------------------------ |
| CR-001 | BIZ  | P0       | Fitness score calculated   | 0-1 range, correct value |
| CR-002 | BIZ  | P1       | Precision score calculated | 0-1 range                |
| CR-003 | BIZ  | P1       | Conformance rate correct   | conforming / total       |
| CR-004 | BIZ  | P0       | Case counts correct        | Sum = total checked      |

### Deviation Tests

| ID     | Type | Priority | Test Scenario                  | Expected Outcome             |
| ------ | ---- | -------- | ------------------------------ | ---------------------------- |
| CR-010 | BIZ  | P0       | Missing activities detected    | deviation_type = missing     |
| CR-011 | BIZ  | P0       | Unexpected activities detected | deviation_type = unexpected  |
| CR-012 | BIZ  | P1       | Wrong order detected           | deviation_type = wrong_order |
| CR-013 | BIZ  | P1       | Deviation counts by type       | Aggregation correct          |
| CR-014 | BIZ  | P1       | Deviation counts by activity   | Per-activity breakdown       |

### Alignment Tests

| ID     | Type | Priority | Test Scenario              | Expected Outcome     |
| ------ | ---- | -------- | -------------------------- | -------------------- |
| CR-020 | BIZ  | P0       | Alignment sequence correct | Sync/log/model moves |
| CR-021 | BIZ  | P0       | Alignment cost calculated  | Sum of move costs    |
| CR-022 | BIZ  | P1       | Fitness from alignment     | Derived correctly    |
| CR-023 | BIZ  | P1       | Optimal alignment found    | Minimum cost path    |

---

## 5.3 Quality Metrics

### Tests

| ID     | Type | Priority | Test Scenario           | Expected Outcome    |
| ------ | ---- | -------- | ----------------------- | ------------------- |
| QM-001 | BIZ  | P0       | Fitness computed        | Correct value       |
| QM-002 | BIZ  | P0       | Precision computed      | Correct value       |
| QM-003 | BIZ  | P1       | Generalization computed | Correct value       |
| QM-004 | BIZ  | P1       | Simplicity computed     | Based on model size |
| QM-005 | BIZ  | P1       | F-score computed        | Harmonic mean       |
| QM-006 | BIZ  | P1       | Quality history tracked | Time series stored  |

---

# PHASE 6: ANALYTICS & PERFORMANCE

## 6.1 Performance Metrics

### Happy Path Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome     |
| ------ | ---- | -------- | ------------------------ | -------------------- |
| PM-001 | E2E  | P0       | Create metric definition | Metric saved         |
| PM-002 | E2E  | P0       | Compute metric value     | Value calculated     |
| PM-003 | E2E  | P1       | Get metric history       | Time series returned |
| PM-004 | E2E  | P1       | Update metric            | Changes saved        |
| PM-005 | E2E  | P1       | Delete metric            | Metric removed       |

### Computation Tests

| ID     | Type | Priority | Test Scenario               | Expected Outcome        |
| ------ | ---- | -------- | --------------------------- | ----------------------- |
| PM-010 | BIZ  | P0       | Throughput time calculation | End - start time        |
| PM-011 | BIZ  | P1       | Waiting time calculation    | Time between activities |
| PM-012 | BIZ  | P1       | Service time calculation    | Activity duration       |
| PM-013 | BIZ  | P1       | Count metrics               | Event/case counts       |
| PM-014 | BIZ  | P1       | Cost aggregation            | Sum/avg of costs        |
| PM-015 | BIZ  | P1       | Custom formula execution    | Formula evaluated       |

### Aggregation Tests

| ID     | Type | Priority | Test Scenario       | Expected Outcome |
| ------ | ---- | -------- | ------------------- | ---------------- |
| PM-020 | BIZ  | P0       | Average aggregation | Mean calculated  |
| PM-021 | BIZ  | P1       | Sum aggregation     | Total calculated |
| PM-022 | BIZ  | P1       | Min/Max aggregation | Extremes found   |
| PM-023 | BIZ  | P1       | Median aggregation  | 50th percentile  |
| PM-024 | BIZ  | P1       | P95 aggregation     | 95th percentile  |

### Time Series Tests

| ID     | Type | Priority | Test Scenario      | Expected Outcome     |
| ------ | ---- | -------- | ------------------ | -------------------- |
| PM-030 | BIZ  | P1       | Hourly granularity | Data grouped by hour |
| PM-031 | BIZ  | P1       | Daily granularity  | Data grouped by day  |
| PM-032 | BIZ  | P1       | Weekly granularity | Data grouped by week |
| PM-033 | BIZ  | P1       | Trend calculation  | Up/down/stable       |

---

## 6.2 Bottleneck Analysis

### Tests

| ID     | Type | Priority | Test Scenario            | Expected Outcome |
| ------ | ---- | -------- | ------------------------ | ---------------- |
| BA-001 | E2E  | P0       | Run bottleneck analysis  | Results computed |
| BA-002 | BIZ  | P0       | Identify top bottlenecks | Ranked by impact |
| BA-003 | BIZ  | P1       | Sojourn time method      | Time at activity |
| BA-004 | BIZ  | P1       | Waiting time method      | Queue time       |
| BA-005 | BIZ  | P1       | Contribution percentage  | % of total delay |
| BA-006 | BIZ  | P2       | Peak hours identified    | Time patterns    |

---

## 6.3 Social Network Analysis

### Tests

| ID     | Type | Priority | Test Scenario           | Expected Outcome    |
| ------ | ---- | -------- | ----------------------- | ------------------- |
| SN-001 | E2E  | P1       | Run handover analysis   | Network computed    |
| SN-002 | E2E  | P1       | Run working together    | Network computed    |
| SN-003 | BIZ  | P1       | Node metrics calculated | Centrality scores   |
| SN-004 | BIZ  | P1       | Edge weights correct    | Interaction counts  |
| SN-005 | BIZ  | P2       | Communities detected    | Clusters identified |
| SN-006 | BIZ  | P2       | Key actors identified   | Hubs/bridges found  |

---

## 6.4 Dashboards

### Tests

| ID     | Type | Priority | Test Scenario       | Expected Outcome       |
| ------ | ---- | -------- | ------------------- | ---------------------- |
| DB-001 | E2E  | P1       | Create dashboard    | Dashboard saved        |
| DB-002 | E2E  | P1       | Add widgets         | Widgets configured     |
| DB-003 | E2E  | P1       | Get dashboard data  | All widget data loaded |
| DB-004 | E2E  | P1       | Update layout       | Positions saved        |
| DB-005 | E2E  | P1       | Delete dashboard    | Dashboard removed      |
| DB-006 | E2E  | P2       | Duplicate dashboard | Copy created           |

---

# PHASE 7: ONTOLOGY & SEMANTICS

## 7.1 Ontologies

### Tests

| ID     | Type | Priority | Test Scenario          | Expected Outcome        |
| ------ | ---- | -------- | ---------------------- | ----------------------- |
| ON-001 | E2E  | P1       | Upload OWL file        | Ontology stored         |
| ON-002 | E2E  | P1       | Parse ontology         | Concepts extracted      |
| ON-003 | E2E  | P1       | List ontologies        | All ontologies returned |
| ON-004 | E2E  | P1       | Export ontology        | File downloadable       |
| ON-005 | INT  | P1       | Support OWL/XML format | Parsed correctly        |
| ON-006 | INT  | P2       | Support Turtle format  | Parsed correctly        |

---

## 7.2 Concepts

### Tests

| ID     | Type | Priority | Test Scenario      | Expected Outcome       |
| ------ | ---- | -------- | ------------------ | ---------------------- |
| CO-001 | BIZ  | P1       | Extract classes    | All classes found      |
| CO-002 | BIZ  | P1       | Extract properties | Object/data properties |
| CO-003 | BIZ  | P1       | Build hierarchy    | Parent-child links     |
| CO-004 | BIZ  | P1       | Get concept tree   | Full tree structure    |
| CO-005 | BIZ  | P2       | Search concepts    | Text search works      |

---

## 7.3 Annotations

### Tests

| ID     | Type | Priority | Test Scenario        | Expected Outcome     |
| ------ | ---- | -------- | -------------------- | -------------------- |
| AN-001 | E2E  | P1       | Create annotation    | Link saved           |
| AN-002 | E2E  | P1       | List annotations     | By entity or concept |
| AN-003 | E2E  | P1       | Delete annotation    | Link removed         |
| AN-004 | E2E  | P2       | Auto-annotate        | ML suggestions       |
| AN-005 | BIZ  | P1       | Confidence score     | 0-1 stored           |
| AN-006 | BIZ  | P2       | Inferred annotations | Reasoning chain      |

---

## 7.4 Semantic Queries

### Tests

| ID     | Type | Priority | Test Scenario             | Expected Outcome      |
| ------ | ---- | -------- | ------------------------- | --------------------- |
| SQ-001 | BIZ  | P2       | Find instances of concept | Annotated entities    |
| SQ-002 | BIZ  | P2       | Include subclasses        | Inheritance respected |
| SQ-003 | BIZ  | P2       | Semantic filtering        | Concept-based filter  |

---

# PHASE 8: AUTOMATION

## 8.1 Action Rules

### Tests

| ID     | Type | Priority | Test Scenario           | Expected Outcome        |
| ------ | ---- | -------- | ----------------------- | ----------------------- |
| AR-001 | E2E  | P1       | Create rule             | Rule saved              |
| AR-002 | E2E  | P1       | Test rule               | Matching items returned |
| AR-003 | E2E  | P1       | Enable/disable rule     | Status toggled          |
| AR-004 | BIZ  | P1       | Pattern rule triggers   | Sequence detected       |
| AR-005 | BIZ  | P1       | Threshold rule triggers | Value crossed           |
| AR-006 | BIZ  | P2       | Cooldown enforced       | No duplicate triggers   |

---

## 8.2 Scheduled Jobs

### Tests

| ID     | Type | Priority | Test Scenario          | Expected Outcome    |
| ------ | ---- | -------- | ---------------------- | ------------------- |
| SJ-001 | E2E  | P1       | Create schedule        | Schedule saved      |
| SJ-002 | E2E  | P1       | Run now                | Job executed        |
| SJ-003 | BIZ  | P1       | Cron expression parsed | Next run calculated |
| SJ-004 | BIZ  | P1       | Job history tracked    | Runs logged         |

---

## 8.3 Execution History

### Tests

| ID     | Type | Priority | Test Scenario    | Expected Outcome   |
| ------ | ---- | -------- | ---------------- | ------------------ |
| EH-001 | E2E  | P1       | List executions  | History returned   |
| EH-002 | BIZ  | P1       | Success recorded | Status and results |
| EH-003 | BIZ  | P1       | Failure recorded | Error message      |
| EH-004 | BIZ  | P1       | Duration tracked | Time recorded      |

---

# CROSS-CUTTING TESTS

## Data Integrity

| ID     | Type | Priority | Test Scenario           | Expected Outcome     |
| ------ | ---- | -------- | ----------------------- | -------------------- |
| DI-001 | DATA | P0       | Foreign key constraints | No orphan records    |
| DI-002 | DATA | P0       | Unique constraints      | No duplicates        |
| DI-003 | DATA | P1       | Cascade deletes         | Related data removed |
| DI-004 | DATA | P1       | Transaction rollback    | Atomic operations    |

## API Behavior

| ID     | Type | Priority | Test Scenario                | Expected Outcome  |
| ------ | ---- | -------- | ---------------------------- | ----------------- |
| AP-001 | INT  | P0       | GET returns 200 for existing | Correct status    |
| AP-002 | INT  | P0       | GET returns 404 for missing  | Not found error   |
| AP-003 | INT  | P0       | POST returns 201 on create   | Created status    |
| AP-004 | INT  | P0       | DELETE returns 204           | No content status |
| AP-005 | INT  | P0       | Validation returns 400       | Validation errors |
| AP-006 | INT  | P1       | Pagination works             | Correct pages     |
| AP-007 | INT  | P1       | Sorting works                | Correct order     |
| AP-008 | INT  | P1       | Filtering works              | Correct subset    |

## Error Handling

| ID     | Type | Priority | Test Scenario          | Expected Outcome       |
| ------ | ---- | -------- | ---------------------- | ---------------------- |
| ER-001 | INT  | P0       | Invalid JSON body      | 400 parse error        |
| ER-002 | INT  | P0       | Missing required field | 400 with field name    |
| ER-003 | INT  | P1       | Invalid UUID format    | 400 validation error   |
| ER-004 | INT  | P1       | Invalid enum value     | 400 with valid options |
| ER-005 | INT  | P1       | Invalid date format    | 400 with format hint   |

## Performance

| ID     | Type | Priority | Test Scenario            | Expected Outcome     |
| ------ | ---- | -------- | ------------------------ | -------------------- |
| PF-001 | INT  | P2       | List with 10k items      | < 2s response        |
| PF-002 | INT  | P2       | Complex filter query     | < 1s response        |
| PF-003 | INT  | P2       | Large file import        | Progress updates     |
| PF-004 | INT  | P2       | Discovery on 100k events | Completes reasonably |

---

# TEST DATA REQUIREMENTS

## Minimal Test Dataset

| Entity     | Count | Purpose               |
| ---------- | ----- | --------------------- |
| Data Pools | 3     | Different types       |
| Event Logs | 5     | Various sizes         |
| Cases      | 1000  | Sufficient for stats  |
| Events     | 10000 | Sufficient for mining |
| Activities | 20    | Realistic process     |
| Variants   | 50    | Diversity             |
| Resources  | 15    | For SNA               |

## Edge Case Datasets

| Dataset               | Description                |
| --------------------- | -------------------------- |
| Single event per case | Minimal traces             |
| Single variant        | All same path              |
| High parallelism      | Many concurrent activities |
| Long cases            | 100+ events per case       |
| Loops                 | Self-loops and cycles      |
| Silent transitions    | Tau moves                  |
| Empty log             | Zero cases                 |

## OCEL Test Dataset

| Entity        | Count |
| ------------- | ----- |
| Object Types  | 5     |
| Event Types   | 15    |
| Objects       | 2000  |
| OCEL Events   | 8000  |
| E2O Relations | 15000 |
| O2O Relations | 1000  |

---

# TEST EXECUTION ORDER

## Suggested Order

1. **Infrastructure** (DP, UP, IJ, EL) - Foundation must work
2. **Case-Centric** (CA, EV, AC, VA, RS) - Core mining features
3. **OCEL** (OT, ET, OO, OE, E2O, O2O, OI, OX) - Object-centric support
4. **Discovery** (DJ, DM, PN) - Process discovery
5. **Conformance** (CJ, CR, QM) - Conformance checking
6. **Analytics** (PM, BA, SN, DB) - Performance analytics
7. **Ontology** (ON, CO, AN, SQ) - Semantic layer
8. **Automation** (AR, SJ, EH) - Automation features
9. **Cross-cutting** (DI, AP, ER, PF) - Integration tests

---

# Process Mining Test Checklist - ANNEX A

## pm4py Integration & Additional Functional Tests

---

# ANNEX A: PM4PY INTEGRATION TESTS

## A.1 EventLog Compatibility

### Database → pm4py Conversion

| ID     | Priority | Test Scenario                             | Expected Outcome                     |
| ------ | -------- | ----------------------------------------- | ------------------------------------ |
| PM-001 | P0       | Convert DB cases/events to pm4py EventLog | Valid EventLog object created        |
| PM-002 | P0       | Case attributes transferred               | All case-level attributes in trace   |
| PM-003 | P0       | Event attributes transferred              | All event-level attributes preserved |
| PM-004 | P0       | Timestamp conversion                      | datetime objects, correct timezone   |
| PM-005 | P0       | Activity name mapping                     | concept:name set correctly           |
| PM-006 | P1       | Resource mapping                          | org:resource set correctly           |
| PM-007 | P1       | Lifecycle mapping                         | lifecycle:transition set             |
| PM-008 | P1       | Cost attribute mapping                    | cost:total if present                |
| PM-009 | P1       | Event ordering within trace               | Sorted by timestamp + sort_key       |
| PM-010 | P1       | Empty log handling                        | Returns empty EventLog, no crash     |

### pm4py → Database Storage

| ID     | Priority | Test Scenario               | Expected Outcome                 |
| ------ | -------- | --------------------------- | -------------------------------- |
| PM-020 | P0       | Store pm4py EventLog to DB  | All traces/events persisted      |
| PM-021 | P0       | XES extensions preserved    | Stored in event_log metadata     |
| PM-022 | P0       | XES classifiers preserved   | Stored in event_log.classifiers  |
| PM-023 | P1       | Global attributes preserved | Stored in global_attributes JSON |
| PM-024 | P1       | Nested attributes flattened | Dot notation in JSON             |
| PM-025 | P1       | Special characters in names | Properly escaped/stored          |

### Round-Trip Tests

| ID     | Priority | Test Scenario               | Expected Outcome                 |
| ------ | -------- | --------------------------- | -------------------------------- |
| PM-030 | P0       | DB → pm4py → DB             | Data identical after round-trip  |
| PM-031 | P0       | XES file → DB → XES file    | Files structurally equivalent    |
| PM-032 | P0       | pm4py EventLog → DB → pm4py | Object equivalence               |
| PM-033 | P1       | Attribute types preserved   | int stays int, float stays float |
| PM-034 | P1       | Null/None handling          | Nulls preserved correctly        |

---

## A.2 XES File Compatibility

### Import Tests

| ID      | Priority | Test Scenario                    | Expected Outcome                      |
| ------- | -------- | -------------------------------- | ------------------------------------- |
| XES-001 | P0       | Import XES via pm4py.read_xes()  | No errors, data matches               |
| XES-002 | P0       | Import gzipped XES               | Decompression + import works          |
| XES-003 | P1       | XES with all standard extensions | concept, time, lifecycle, org, cost   |
| XES-004 | P1       | XES with custom extensions       | Custom attributes preserved           |
| XES-005 | P1       | XES with multiple classifiers    | Classifiers stored correctly          |
| XES-006 | P1       | XES with nested attributes       | Flattened or structured storage       |
| XES-007 | P2       | XES with 1M+ events              | Memory-efficient processing           |
| XES-008 | P2       | Malformed XES recovery           | Graceful error, partial import option |

### Export Tests

| ID      | Priority | Test Scenario                       | Expected Outcome                 |
| ------- | -------- | ----------------------------------- | -------------------------------- |
| XES-020 | P0       | Export passes pm4py.read_xes()      | pm4py can read exported file     |
| XES-021 | P0       | Export validates against XES schema | Valid XES 2.0                    |
| XES-022 | P1       | Exported classifiers work           | pm4py uses classifiers correctly |
| XES-023 | P1       | Extension declarations present      | Required xmlns declarations      |
| XES-024 | P1       | Global attributes exported          | log/trace/event globals          |
| XES-025 | P2       | Large export streaming              | No memory overflow               |

---

## A.3 Discovery Algorithm Output

### Alpha Miner

| ID     | Priority | Test Scenario                        | Expected Outcome              |
| ------ | -------- | ------------------------------------ | ----------------------------- |
| AL-001 | P0       | Output matches pm4py alpha structure | PetriNet, im, fm tuple        |
| AL-002 | P0       | Places stored correctly              | All places in DB              |
| AL-003 | P0       | Transitions stored correctly         | All transitions, labels match |
| AL-004 | P0       | Arcs stored correctly                | Source/target/weight correct  |
| AL-005 | P0       | Initial marking correct              | Start places marked           |
| AL-006 | P0       | Final marking correct                | End places marked             |
| AL-007 | P1       | Can reconstruct pm4py PetriNet       | DB → pm4py object             |
| AL-008 | P1       | PNML export matches pm4py export     | Equivalent files              |

### Heuristics Miner

| ID     | Priority | Test Scenario                | Expected Outcome          |
| ------ | -------- | ---------------------------- | ------------------------- |
| HM-001 | P0       | Output structure valid       | PetriNet or HeuristicsNet |
| HM-002 | P1       | Dependency threshold applied | Edges filtered correctly  |
| HM-003 | P1       | And/loop thresholds work     | Parallelism detected      |
| HM-004 | P1       | Frequency on transitions     | Stored in DB              |

### Inductive Miner

| ID     | Priority | Test Scenario             | Expected Outcome         |
| ------ | -------- | ------------------------- | ------------------------ |
| IM-001 | P0       | Output valid Petri net    | Sound model              |
| IM-002 | P1       | Noise threshold applied   | Infrequent filtered      |
| IM-003 | P1       | Process tree intermediate | Can store tree structure |
| IM-004 | P1       | IMf variant works         | Frequency-based          |
| IM-005 | P1       | IMd variant works         | Directly-follows based   |

### DFG Discovery

| ID      | Priority | Test Scenario                    | Expected Outcome             |
| ------- | -------- | -------------------------------- | ---------------------------- |
| DFG-001 | P0       | DFG matches pm4py.discover_dfg() | Same nodes/edges/frequencies |
| DFG-002 | P0       | Start activities match           | pm4py.get_start_activities() |
| DFG-003 | P0       | End activities match             | pm4py.get_end_activities()   |
| DFG-004 | P1       | Performance DFG                  | Edge durations computed      |
| DFG-005 | P1       | DFG JSON serialization           | Can reconstruct in pm4py     |

---

## A.4 Conformance Checking Output

### Token Replay

| ID     | Priority | Test Scenario                      | Expected Outcome                       |
| ------ | -------- | ---------------------------------- | -------------------------------------- |
| TR-001 | P0       | Fitness matches pm4py result       | Same fitness value                     |
| TR-002 | P0       | Token counts match                 | produced, consumed, missing, remaining |
| TR-003 | P1       | Per-trace diagnostics stored       | Individual trace results               |
| TR-004 | P1       | Problematic transitions identified | Deviations match pm4py                 |

### Alignments

| ID     | Priority | Test Scenario                  | Expected Outcome       |
| ------ | -------- | ------------------------------ | ---------------------- |
| AG-001 | P0       | Alignment cost matches pm4py   | Same cost values       |
| AG-002 | P0       | Alignment sequence matches     | Same moves             |
| AG-003 | P0       | Fitness from alignment matches | Derived correctly      |
| AG-004 | P1       | Move types correct             | sync, log, model moves |
| AG-005 | P1       | Custom costs applied           | Non-default costs work |

### Precision/Generalization

| ID     | Priority | Test Scenario           | Expected Outcome             |
| ------ | -------- | ----------------------- | ---------------------------- |
| PG-001 | P1       | Precision matches pm4py | ETConformance or align-based |
| PG-002 | P1       | Generalization computed | k-fold or anti-alignment     |
| PG-003 | P2       | Simplicity metric       | Arc/node ratio               |

---

## A.5 Petri Net Operations

### Storage ↔ pm4py Objects

| ID     | Priority | Test Scenario                 | Expected Outcome    |
| ------ | -------- | ----------------------------- | ------------------- |
| PN-101 | P0       | DB Petri net → pm4py PetriNet | Valid object        |
| PN-102 | P0       | pm4py PetriNet → DB           | All elements stored |
| PN-103 | P0       | Marking objects convert       | im, fm correct      |
| PN-104 | P1       | Arc weights preserved         | Non-1 weights       |
| PN-105 | P1       | Silent transitions preserved  | label=None or tau   |
| PN-106 | P1       | Layout coordinates stored     | x, y positions      |

### PNML Import/Export

| ID     | Priority | Test Scenario                 | Expected Outcome        |
| ------ | -------- | ----------------------------- | ----------------------- |
| PN-110 | P0       | Export PNML readable by pm4py | pm4py.read_pnml() works |
| PN-111 | P0       | Import PNML from pm4py        | All elements captured   |
| PN-112 | P1       | PNML round-trip               | Equivalent nets         |

---

## A.6 Variant Analysis

| ID     | Priority | Test Scenario                       | Expected Outcome          |
| ------ | -------- | ----------------------------------- | ------------------------- |
| VA-101 | P0       | Variants match pm4py.get_variants() | Same groupings            |
| VA-102 | P0       | Variant counts match                | Same frequencies          |
| VA-103 | P1       | Variant statistics match            | Duration stats            |
| VA-104 | P1       | Variant hash stable                 | Same sequence = same hash |

---

## A.7 Statistics Comparison

| ID     | Priority | Test Scenario                      | Expected Outcome       |
| ------ | -------- | ---------------------------------- | ---------------------- |
| ST-001 | P0       | Case count = len(pm4py_log)        | Matches                |
| ST-002 | P0       | Event count = sum of trace lengths | Matches                |
| ST-003 | P0       | Activity set matches               | get_attribute_values() |
| ST-004 | P1       | Trace duration stats match         | pm4py case duration    |
| ST-005 | P1       | Activity frequency matches         | get_attribute_values() |

---

## A.8 SNA Compatibility

| ID      | Priority | Test Scenario                 | Expected Outcome            |
| ------- | -------- | ----------------------------- | --------------------------- |
| SNA-001 | P1       | Handover matrix matches pm4py | discover_handover_of_work() |
| SNA-002 | P1       | Working together matches      | discover_working_together() |
| SNA-003 | P1       | Subcontracting matches        | discover_subcontracting()   |
| SNA-004 | P2       | Similar activities matches    | discover_roles_from_sna()   |

---

## A.9 OCEL pm4py Compatibility

| ID          | Priority | Test Scenario                         | Expected Outcome        |
| ----------- | -------- | ------------------------------------- | ----------------------- |
| OCEL-PM-001 | P0       | Import OCEL matches pm4py.read_ocel() | Same objects/events     |
| OCEL-PM-002 | P0       | Export readable by pm4py              | pm4py.read_ocel() works |
| OCEL-PM-003 | P1       | Object-centric DFG matches            | pm4py OC-DFG algorithms |
| OCEL-PM-004 | P1       | OCEL flattening works                 | to_log() equivalent     |

---

# ANNEX B: ADDITIONAL FUNCTIONAL TESTS

## B.1 Data Type Handling

| ID     | Priority | Test Scenario             | Expected Outcome            |
| ------ | -------- | ------------------------- | --------------------------- |
| DT-001 | P0       | Integer attributes        | Stored and retrieved as int |
| DT-002 | P0       | Float attributes          | Precision preserved         |
| DT-003 | P0       | String attributes         | Unicode support             |
| DT-004 | P0       | Boolean attributes        | true/false handling         |
| DT-005 | P0       | Datetime attributes       | Timezone preserved          |
| DT-006 | P1       | Null values               | Null vs empty string        |
| DT-007 | P1       | Very long strings         | 10K+ characters             |
| DT-008 | P1       | Special characters        | Emojis, RTL, control chars  |
| DT-009 | P2       | Binary data in attributes | Base64 or rejection         |

---

## B.2 Timezone & Date Handling

| ID     | Priority | Test Scenario             | Expected Outcome         |
| ------ | -------- | ------------------------- | ------------------------ |
| TZ-001 | P0       | UTC timestamps stored     | Consistent storage       |
| TZ-002 | P0       | Local timezone conversion | Input conversion correct |
| TZ-003 | P1       | Mixed timezones in import | Normalized to UTC        |
| TZ-004 | P1       | DST edge cases            | Spring/fall transitions  |
| TZ-005 | P1       | Date-only values          | Midnight UTC assumed     |
| TZ-006 | P2       | Microsecond precision     | Not truncated            |
| TZ-007 | P2       | Dates before 1970         | Handled correctly        |

---

## B.3 Concurrent Access

| ID     | Priority | Test Scenario             | Expected Outcome       |
| ------ | -------- | ------------------------- | ---------------------- |
| CC-001 | P1       | Simultaneous reads        | No blocking            |
| CC-002 | P1       | Read during import        | Consistent view        |
| CC-003 | P1       | Multiple imports same log | Serialized or conflict |
| CC-004 | P1       | Discovery during import   | Waits or uses snapshot |
| CC-005 | P2       | Update during conformance | Defined behavior       |
| CC-006 | P2       | Delete during analysis    | Graceful handling      |

---

## B.4 Background Job Processing

| ID     | Priority | Test Scenario           | Expected Outcome              |
| ------ | -------- | ----------------------- | ----------------------------- |
| BG-001 | P0       | Job queued and executes | Status transitions correct    |
| BG-002 | P0       | Job progress updates    | Real-time progress            |
| BG-003 | P0       | Job completion callback | Results accessible            |
| BG-004 | P1       | Job failure handling    | Error captured, status=failed |
| BG-005 | P1       | Job cancellation        | Stops promptly, cleanup       |
| BG-006 | P1       | Job timeout             | Killed after limit            |
| BG-007 | P1       | Job retry on failure    | Configurable retries          |
| BG-008 | P2       | Job priority ordering   | Higher priority first         |
| BG-009 | P2       | Job dependencies        | Waits for prerequisite        |

---

## B.5 File System Operations

| ID     | Priority | Test Scenario             | Expected Outcome     |
| ------ | -------- | ------------------------- | -------------------- |
| FS-001 | P0       | Upload creates file       | File on disk         |
| FS-002 | P0       | Delete removes file       | File gone            |
| FS-003 | P1       | Disk space check          | Rejects if full      |
| FS-004 | P1       | Path traversal prevention | No ../ escapes       |
| FS-005 | P1       | Temp file cleanup         | No orphan temp files |
| FS-006 | P2       | Special chars in filename | Sanitized            |
| FS-007 | P2       | Very long filenames       | Truncated safely     |

---

## B.6 Large Scale Handling

| ID     | Priority | Test Scenario       | Expected Outcome         |
| ------ | -------- | ------------------- | ------------------------ |
| LS-001 | P1       | 100K cases          | Import < 5 min           |
| LS-002 | P1       | 1M events           | Import < 10 min          |
| LS-003 | P1       | 10M events          | Streaming/chunked import |
| LS-004 | P1       | 1000 activities     | Discovery completes      |
| LS-005 | P1       | 10K variants        | Variant detection works  |
| LS-006 | P2       | 100K objects (OCEL) | OCEL operations work     |
| LS-007 | P2       | 500 event types     | Type management works    |

---

## B.7 Edge Cases in Algorithms

| ID     | Priority | Test Scenario          | Expected Outcome           |
| ------ | -------- | ---------------------- | -------------------------- |
| EC-001 | P1       | Single-event traces    | Discovery handles          |
| EC-002 | P1       | Single-activity log    | Valid simple model         |
| EC-003 | P1       | All identical traces   | Single variant             |
| EC-004 | P1       | No repeated activities | Sequential model           |
| EC-005 | P1       | All loops (A→A→A)      | Loop detected              |
| EC-006 | P1       | Disconnected process   | Multiple components        |
| EC-007 | P2       | Trace length = 1000    | Alignment timeout handling |
| EC-008 | P2       | 100% unique variants   | All cases different        |

---

## B.8 Import Idempotency & Updates

| ID     | Priority | Test Scenario             | Expected Outcome   |
| ------ | -------- | ------------------------- | ------------------ |
| ID-001 | P1       | Re-import same file       | No duplicates      |
| ID-002 | P1       | Import with new cases     | Appended correctly |
| ID-003 | P1       | Import with updated cases | Merged or replaced |
| ID-004 | P1       | Import with deleted cases | Defined behavior   |
| ID-005 | P2       | Partial update            | Only changed rows  |

---

## B.9 Cascading Operations

| ID     | Priority | Test Scenario           | Expected Outcome                |
| ------ | -------- | ----------------------- | ------------------------------- |
| CS-001 | P0       | Delete event log        | Cases, events, variants deleted |
| CS-002 | P0       | Delete data pool        | All contained data deleted      |
| CS-003 | P1       | Delete model            | Conformance results deleted     |
| CS-004 | P1       | Delete case             | Events deleted                  |
| CS-005 | P1       | Delete OCEL object type | Objects deleted                 |
| CS-006 | P1       | Delete OCEL object      | E2O, O2O cleaned                |

---

## B.10 Statistics Recalculation

| ID     | Priority | Test Scenario            | Expected Outcome            |
| ------ | -------- | ------------------------ | --------------------------- |
| SR-001 | P0       | Stats after import       | Automatically computed      |
| SR-002 | P1       | Stats after case delete  | Recalculated                |
| SR-003 | P1       | Manual stats refresh     | Correct values              |
| SR-004 | P1       | Stats consistency        | No stale data               |
| SR-005 | P2       | Incremental stats update | Efficient for small changes |

---

## B.11 Export Integrity

| ID     | Priority | Test Scenario               | Expected Outcome            |
| ------ | -------- | --------------------------- | --------------------------- |
| EX-001 | P0       | CSV export is valid CSV     | Parseable by any CSV reader |
| EX-002 | P0       | XES export is valid XML     | Well-formed XML             |
| EX-003 | P0       | OCEL JSON is valid JSON     | Parseable                   |
| EX-004 | P1       | PNML is valid XML           | Schema-valid                |
| EX-005 | P1       | BPMN is valid BPMN 2.0      | Schema-valid                |
| EX-006 | P1       | Export includes all data    | No missing records          |
| EX-007 | P2       | Export file size reasonable | Compression if needed       |

---

## B.12 Query Edge Cases

| ID     | Priority | Test Scenario               | Expected Outcome         |
| ------ | -------- | --------------------------- | ------------------------ |
| QE-001 | P1       | Filter returns zero results | Empty array, not error   |
| QE-002 | P1       | Filter with special chars   | Properly escaped         |
| QE-003 | P1       | Sort on null values         | Defined order            |
| QE-004 | P1       | Page beyond data            | Empty page               |
| QE-005 | P2       | Very complex filter         | Reasonable response time |
| QE-006 | P2       | SQL injection attempt       | Rejected/escaped         |

---

## B.13 API Response Consistency

| ID     | Priority | Test Scenario                    | Expected Outcome      |
| ------ | -------- | -------------------------------- | --------------------- |
| RC-001 | P0       | All responses have success field | true or false         |
| RC-002 | P0       | All responses have meta          | timestamp, request_id |
| RC-003 | P0       | All errors have error object     | code, message         |
| RC-004 | P1       | All lists have pagination        | Even if single page   |
| RC-005 | P1       | Dates always ISO 8601            | Consistent format     |
| RC-006 | P1       | UUIDs always lowercase           | Consistent format     |

---

## B.14 Startup & Initialization

| ID     | Priority | Test Scenario               | Expected Outcome        |
| ------ | -------- | --------------------------- | ----------------------- |
| SI-001 | P0       | Fresh database init         | Tables created          |
| SI-002 | P0       | Default tenant created      | Local dev tenant exists |
| SI-003 | P1       | Missing directories created | uploads/, models/, etc. |
| SI-004 | P1       | Corrupted DB handling       | Clear error message     |
| SI-005 | P2       | Schema migration            | Future versions migrate |

---

## B.15 Memory Management

| ID     | Priority | Test Scenario          | Expected Outcome            |
| ------ | -------- | ---------------------- | --------------------------- |
| MM-001 | P1       | Large file import      | Streamed, not loaded to RAM |
| MM-002 | P1       | Large query result     | Paginated/streamed          |
| MM-003 | P1       | Discovery on large log | pm4py memory limits         |
| MM-004 | P2       | Memory limit exceeded  | Graceful failure            |
| MM-005 | P2       | No memory leaks        | Stable over time            |

---

# ANNEX C: INTEGRATION TEST FLOWS

## C.1 Complete Import-to-Discovery Flow

| Step | Action                         | Validation                       |
| ---- | ------------------------------ | -------------------------------- |
| 1    | Create data pool               | Pool exists                      |
| 2    | Upload CSV file                | Upload status = ready            |
| 3    | Create import job with mapping | Job saved                        |
| 4    | Run import job                 | Status = success, events created |
| 5    | Verify event log statistics    | Counts correct                   |
| 6    | Run Alpha miner                | Model created                    |
| 7    | Verify Petri net structure     | Places/transitions/arcs valid    |
| 8    | Export as PNML                 | Valid PNML file                  |
| 9    | Run conformance check          | Results computed                 |
| 10   | Verify fitness score           | 0-1 range, reasonable value      |

## C.2 Complete OCEL Flow

| Step | Action                       | Validation                    |
| ---- | ---------------------------- | ----------------------------- |
| 1    | Create data pool (type=ocel) | Pool exists                   |
| 2    | Upload OCEL JSON             | Upload ready                  |
| 3    | Import OCEL                  | Objects, events, E2O created  |
| 4    | Verify object types          | All types present             |
| 5    | Verify event types           | All types present             |
| 6    | Query objects by type        | Correct objects returned      |
| 7    | Get object lifecycle         | Events in order               |
| 8    | Export as OCEL JSON          | Valid OCEL                    |
| 9    | Round-trip validation        | Import exported file, compare |

## C.3 Analytics Flow

| Step | Action                   | Validation             |
| ---- | ------------------------ | ---------------------- |
| 1    | Import event log         | Log exists             |
| 2    | Define throughput metric | Metric saved           |
| 3    | Compute metric           | Values computed        |
| 4    | Run bottleneck analysis  | Bottlenecks identified |
| 5    | Run SNA handover         | Network computed       |
| 6    | Create dashboard         | Dashboard saved        |
| 7    | Get dashboard data       | All widgets populated  |

## C.4 pm4py Compatibility Flow

| Step | Action                | Validation                      |
| ---- | --------------------- | ------------------------------- |
| 1    | Import XES via API    | Log in database                 |
| 2    | Export as XES         | File created                    |
| 3    | Load in pm4py         | pm4py.read_xes() succeeds       |
| 4    | Compare statistics    | Case/event counts match         |
| 5    | Run pm4py Alpha       | Model created                   |
| 6    | Run API Alpha         | API model created               |
| 7    | Compare models        | Equivalent structure            |
| 8    | Run pm4py conformance | Results computed                |
| 9    | Run API conformance   | API results computed            |
| 10   | Compare fitness       | Values match (within tolerance) |

---

# SUMMARY: WHAT WE NEED TO TEST

## Critical Functional Areas

| Area                         | Coverage                   | Priority |
| ---------------------------- | -------------------------- | -------- |
| **pm4py Data Compatibility** | EventLog ↔ DB conversion   | P0       |
| **pm4py Algorithm Parity**   | Same results as pm4py      | P0       |
| **XES Round-Trip**           | Import → Export → Import   | P0       |
| **OCEL Round-Trip**          | Import → Export → Import   | P0       |
| **Petri Net Storage**        | DB ↔ pm4py objects         | P0       |
| **Conformance Accuracy**     | Matches pm4py results      | P0       |
| **Data Type Preservation**   | Types survive round-trip   | P0       |
| **Timezone Handling**        | UTC normalization          | P1       |
| **Large Scale**              | 1M+ events                 | P1       |
| **Background Jobs**          | Queue, progress, cancel    | P1       |
| **Cascading Deletes**        | No orphans                 | P1       |
| **Concurrent Access**        | Safe operations            | P1       |
| **Edge Cases**               | Single events, loops, etc. | P1       |
| **Export Validity**          | Schema-valid outputs       | P1       |
| **Memory Safety**            | No leaks, streaming        | P2       |

## Test Data Matrix

| Scenario | Cases   | Events    | Activities | Variants |
| -------- | ------- | --------- | ---------- | -------- |
| Minimal  | 10      | 50        | 5          | 3        |
| Small    | 100     | 1,000     | 10         | 15       |
| Medium   | 1,000   | 10,000    | 20         | 50       |
| Large    | 10,000  | 100,000   | 50         | 500      |
| Stress   | 100,000 | 1,000,000 | 100        | 5,000    |

## pm4py Functions to Validate Against

| pm4py Function                                 | API Equivalent                | Priority |
| ---------------------------------------------- | ----------------------------- | -------- |
| `read_xes()`                                   | POST /uploads + import        | P0       |
| `write_xes()`                                  | GET /event-logs/{id}/export   | P0       |
| `discover_petri_net_alpha()`                   | POST /discovery (alpha)       | P0       |
| `discover_petri_net_heuristics()`              | POST /discovery (heuristics)  | P0       |
| `discover_petri_net_inductive()`               | POST /discovery (inductive)   | P0       |
| `discover_dfg()`                               | GET /events/dfg               | P0       |
| `conformance_diagnostics_token_based_replay()` | POST /conformance (token)     | P0       |
| `conformance_diagnostics_alignments()`         | POST /conformance (alignment) | P0       |
| `get_variants()`                               | GET /variants                 | P0       |
| `get_start_activities()`                       | Included in DFG               | P1       |
| `get_end_activities()`                         | Included in DFG               | P1       |
| `discover_handover_of_work()`                  | POST /sna (handover)          | P1       |
| `read_ocel()`                                  | POST /ocel/import             | P1       |
| `write_ocel()`                                 | GET /ocel/export              | P1       |

---
