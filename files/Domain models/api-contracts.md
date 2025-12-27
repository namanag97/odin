# L3 API CONTRACTS — REST/OpenAPI SPECIFICATION
> HTTP API endpoints, request/response schemas, and conventions

---

## API DESIGN PRINCIPLES

```yaml
# Base URL Structure
Production: https://api.{tenant-slug}.processminer.io/v1
Sandbox:    https://api.sandbox.processminer.io/v1

# Versioning
- URL path versioning: /v1/, /v2/
- Header versioning for minor: X-API-Version: 2024-01-15

# Authentication
- Bearer token: Authorization: Bearer {access_token}
- API key: X-API-Key: {api_key}

# Multi-tenancy
- Tenant resolved from: subdomain, token claims, or X-Tenant-ID header

# Rate Limiting Headers
- X-RateLimit-Limit: 1000
- X-RateLimit-Remaining: 999
- X-RateLimit-Reset: 1640995200
```

---

## COMMON SCHEMAS

```yaml
# Error Response
ErrorResponse:
  type: object
  required: [error]
  properties:
    error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          example: "VALIDATION_FAILED"
        message:
          type: string
          example: "The request body contains invalid data"
        details:
          type: object
          additionalProperties: true
        traceId:
          type: string
          format: uuid
        violations:
          type: array
          items:
            $ref: '#/components/schemas/ValidationViolation'

ValidationViolation:
  type: object
  properties:
    field:
      type: string
    constraint:
      type: string
    message:
      type: string

# Pagination
PaginationParams:
  type: object
  properties:
    page:
      type: integer
      minimum: 1
      default: 1
    pageSize:
      type: integer
      minimum: 1
      maximum: 100
      default: 20
    cursor:
      type: string
      description: "Cursor for cursor-based pagination"

PaginatedResponse:
  type: object
  required: [items, total, hasMore]
  properties:
    items:
      type: array
    total:
      type: integer
    page:
      type: integer
    pageSize:
      type: integer
    hasMore:
      type: boolean
    nextCursor:
      type: string

# Sorting
SortParam:
  type: string
  pattern: "^[a-zA-Z_]+:(asc|desc)$"
  example: "createdAt:desc"

# Timestamps
Timestamp:
  type: string
  format: date-time
  example: "2024-01-15T10:30:00Z"

# UUID
UUID:
  type: string
  format: uuid
  example: "550e8400-e29b-41d4-a716-446655440000"
```

---

## AUTHENTICATION ENDPOINTS

```yaml
/auth:
  post:
    tags: [Authentication]
    operationId: authenticate
    summary: Authenticate user
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                format: password
              mfaCode:
                type: string
    responses:
      200:
        description: Authentication successful
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthResponse'
      401:
        description: Invalid credentials
      403:
        description: MFA required

/auth/refresh:
  post:
    tags: [Authentication]
    operationId: refreshToken
    summary: Refresh access token
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [refreshToken]
            properties:
              refreshToken:
                type: string
    responses:
      200:
        description: Token refreshed
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthResponse'

/auth/logout:
  post:
    tags: [Authentication]
    operationId: logout
    summary: Logout current session
    security:
      - bearerAuth: []
    responses:
      204:
        description: Logged out successfully

AuthResponse:
  type: object
  properties:
    accessToken:
      type: string
    refreshToken:
      type: string
    expiresAt:
      $ref: '#/components/schemas/Timestamp'
    user:
      $ref: '#/components/schemas/User'
    mfaRequired:
      type: boolean
```

---

## DATA POOL ENDPOINTS

```yaml
/data-pools:
  get:
    tags: [Data Pools]
    operationId: listDataPools
    summary: List data pools
    security:
      - bearerAuth: []
    parameters:
      - name: status
        in: query
        schema:
          type: string
          enum: [active, archived, error]
      - name: search
        in: query
        schema:
          type: string
      - $ref: '#/components/parameters/page'
      - $ref: '#/components/parameters/pageSize'
      - $ref: '#/components/parameters/sort'
    responses:
      200:
        description: List of data pools
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/DataPool'
  
  post:
    tags: [Data Pools]
    operationId: createDataPool
    summary: Create a new data pool
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [name]
            properties:
              name:
                type: string
                minLength: 1
                maxLength: 100
              description:
                type: string
                maxLength: 500
              settings:
                $ref: '#/components/schemas/DataPoolSettings'
    responses:
      201:
        description: Data pool created
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataPool'
      400:
        $ref: '#/components/responses/ValidationError'
      409:
        description: Name already exists

/data-pools/{poolId}:
  parameters:
    - name: poolId
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/UUID'
  
  get:
    tags: [Data Pools]
    operationId: getDataPool
    summary: Get data pool by ID
    security:
      - bearerAuth: []
    responses:
      200:
        description: Data pool details
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataPool'
      404:
        $ref: '#/components/responses/NotFound'
  
  patch:
    tags: [Data Pools]
    operationId: updateDataPool
    summary: Update data pool
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              description:
                type: string
              settings:
                $ref: '#/components/schemas/DataPoolSettings'
    responses:
      200:
        description: Data pool updated
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataPool'
  
  delete:
    tags: [Data Pools]
    operationId: deleteDataPool
    summary: Delete data pool
    security:
      - bearerAuth: []
    responses:
      204:
        description: Data pool deleted
      409:
        description: Cannot delete - has dependent resources

/data-pools/{poolId}/tables:
  get:
    tags: [Tables]
    operationId: listTables
    summary: List tables in data pool
    security:
      - bearerAuth: []
    parameters:
      - name: poolId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
    responses:
      200:
        description: List of tables
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/Table'
```

---

## TABLE ENDPOINTS

```yaml
/tables/{tableId}:
  parameters:
    - name: tableId
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/UUID'
  
  get:
    tags: [Tables]
    operationId: getTable
    summary: Get table details
    security:
      - bearerAuth: []
    responses:
      200:
        description: Table details with schema
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Table'

/tables/{tableId}/preview:
  get:
    tags: [Tables]
    operationId: previewTableData
    summary: Preview table data
    security:
      - bearerAuth: []
    parameters:
      - name: tableId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: limit
        in: query
        schema:
          type: integer
          default: 100
          maximum: 1000
      - name: columns
        in: query
        schema:
          type: array
          items:
            type: string
    responses:
      200:
        description: Preview data
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataPreview'

/tables/{tableId}/import:
  post:
    tags: [Tables]
    operationId: importTableData
    summary: Import data into table
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required: [file]
            properties:
              file:
                type: string
                format: binary
              mode:
                type: string
                enum: [replace, append, upsert]
                default: append
              options:
                type: string
                description: JSON string of import options
    responses:
      202:
        description: Import job started
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ImportJob'

/import-jobs/{jobId}:
  get:
    tags: [Tables]
    operationId: getImportJobStatus
    summary: Get import job status
    security:
      - bearerAuth: []
    parameters:
      - name: jobId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
    responses:
      200:
        description: Import job status
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ImportJob'
```

---

## DATA MODEL ENDPOINTS

```yaml
/data-models:
  get:
    tags: [Data Models]
    operationId: listDataModels
    summary: List data models
    security:
      - bearerAuth: []
    parameters:
      - name: dataPoolId
        in: query
        schema:
          $ref: '#/components/schemas/UUID'
      - name: type
        in: query
        schema:
          type: string
          enum: [case_centric, object_centric]
      - name: status
        in: query
        schema:
          type: string
          enum: [idle, loading, loaded, failed, stale]
    responses:
      200:
        description: List of data models
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/DataModel'
  
  post:
    tags: [Data Models]
    operationId: createDataModel
    summary: Create a new data model
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [dataPoolId, name, type]
            properties:
              dataPoolId:
                $ref: '#/components/schemas/UUID'
              name:
                type: string
              description:
                type: string
              type:
                type: string
                enum: [case_centric, object_centric]
    responses:
      201:
        description: Data model created
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataModel'

/data-models/{modelId}:
  parameters:
    - name: modelId
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/UUID'
  
  get:
    tags: [Data Models]
    operationId: getDataModel
    summary: Get data model details
    security:
      - bearerAuth: []
    responses:
      200:
        description: Data model details
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataModel'

/data-models/{modelId}/configuration:
  put:
    tags: [Data Models]
    operationId: configureDataModel
    summary: Configure data model
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/DataModelConfiguration'
    responses:
      200:
        description: Configuration updated
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataModel'

/data-models/{modelId}/load:
  post:
    tags: [Data Models]
    operationId: loadDataModel
    summary: Load data model
    security:
      - bearerAuth: []
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              loadType:
                type: string
                enum: [full, incremental]
                default: full
              options:
                $ref: '#/components/schemas/LoadOptions'
    responses:
      202:
        description: Load job started
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoadJob'

/data-models/{modelId}/statistics:
  get:
    tags: [Data Models]
    operationId: getDataModelStatistics
    summary: Get data model statistics
    security:
      - bearerAuth: []
    responses:
      200:
        description: Statistics
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DataModelStatistics'
```

---

## PROCESS DISCOVERY ENDPOINTS

```yaml
/data-models/{modelId}/discover:
  post:
    tags: [Process Discovery]
    operationId: discoverProcess
    summary: Discover process model
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [algorithm]
            properties:
              algorithm:
                type: string
                enum: [alpha, alpha_plus, inductive, inductive_infrequent, heuristic, ilp]
              parameters:
                $ref: '#/components/schemas/DiscoveryParameters'
              filters:
                type: array
                items:
                  $ref: '#/components/schemas/OCELFilter'
              outputFormat:
                type: string
                enum: [petri_net, process_tree, bpmn, dfg]
              saveName:
                type: string
    responses:
      200:
        description: Discovery result
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DiscoveryResult'

/data-models/{modelId}/dfg:
  get:
    tags: [Process Discovery]
    operationId: getDFG
    summary: Get Directly-Follows Graph
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: performanceMetrics
        in: query
        schema:
          type: boolean
          default: false
    responses:
      200:
        description: DFG
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DFGResult'

/process-models:
  get:
    tags: [Process Models]
    operationId: listProcessModels
    summary: List process models
    security:
      - bearerAuth: []
    parameters:
      - name: dataModelId
        in: query
        schema:
          $ref: '#/components/schemas/UUID'
      - name: format
        in: query
        schema:
          type: string
          enum: [petri_net, process_tree, bpmn, dfg, ocel_net]
    responses:
      200:
        description: List of process models
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/ProcessModel'

/process-models/{processModelId}/export:
  get:
    tags: [Process Models]
    operationId: exportProcessModel
    summary: Export process model
    security:
      - bearerAuth: []
    parameters:
      - name: processModelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: format
        in: query
        required: true
        schema:
          type: string
          enum: [pnml, bpmn, svg, png, dot, json]
    responses:
      200:
        description: Exported model
        content:
          application/octet-stream:
            schema:
              type: string
              format: binary
          image/svg+xml:
            schema:
              type: string
          image/png:
            schema:
              type: string
              format: binary
```

---

## CONFORMANCE CHECKING ENDPOINTS

```yaml
/data-models/{modelId}/conformance:
  post:
    tags: [Conformance]
    operationId: checkConformance
    summary: Check conformance against a process model
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [processModelId, method]
            properties:
              processModelId:
                $ref: '#/components/schemas/UUID'
              method:
                type: string
                enum: [token_replay, alignments, footprints]
              filters:
                type: array
                items:
                  $ref: '#/components/schemas/OCELFilter'
              options:
                $ref: '#/components/schemas/ConformanceOptions'
    responses:
      200:
        description: Conformance result
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConformanceResult'

/data-models/{modelId}/deviations:
  get:
    tags: [Conformance]
    operationId: getDeviations
    summary: Get process deviations
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: processModelId
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - $ref: '#/components/parameters/page'
      - $ref: '#/components/parameters/pageSize'
    responses:
      200:
        description: Deviations
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeviationsResult'

/data-models/{modelId}/quality-metrics:
  get:
    tags: [Conformance]
    operationId: getQualityMetrics
    summary: Get all quality metrics (fitness, precision, generalization, simplicity)
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: processModelId
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
    responses:
      200:
        description: Quality metrics
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AllMetricsResult'
```

---

## OCEL ANALYTICS ENDPOINTS

```yaml
/data-models/{modelId}/events:
  get:
    tags: [OCEL Analytics]
    operationId: getEvents
    summary: Get events from OCEL model
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: activities
        in: query
        schema:
          type: array
          items:
            type: string
      - name: objectTypes
        in: query
        schema:
          type: array
          items:
            type: string
      - name: startDate
        in: query
        schema:
          type: string
          format: date-time
      - name: endDate
        in: query
        schema:
          type: string
          format: date-time
      - $ref: '#/components/parameters/page'
      - $ref: '#/components/parameters/pageSize'
    responses:
      200:
        description: Events
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/OCELEvent'

/data-models/{modelId}/objects/{objectType}:
  get:
    tags: [OCEL Analytics]
    operationId: getObjects
    summary: Get objects by type
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: objectType
        in: path
        required: true
        schema:
          type: string
      - $ref: '#/components/parameters/page'
      - $ref: '#/components/parameters/pageSize'
    responses:
      200:
        description: Objects
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/OCELObject'

/data-models/{modelId}/objects/{objectType}/{objectId}/lifecycle:
  get:
    tags: [OCEL Analytics]
    operationId: getObjectLifecycle
    summary: Get object lifecycle
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: objectType
        in: path
        required: true
        schema:
          type: string
      - name: objectId
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        description: Object lifecycle
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ObjectLifecycleDetails'

/data-models/{modelId}/statistics/activities:
  get:
    tags: [OCEL Analytics]
    operationId: getActivityStatistics
    summary: Get activity statistics
    security:
      - bearerAuth: []
    responses:
      200:
        description: Activity statistics
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/ActivityStatistic'

/data-models/{modelId}/statistics/performance:
  get:
    tags: [OCEL Analytics]
    operationId: getPerformanceMetrics
    summary: Get performance metrics
    security:
      - bearerAuth: []
    parameters:
      - name: metrics
        in: query
        required: true
        schema:
          type: array
          items:
            type: string
            enum: [throughput_time, waiting_time, service_time, cycle_time]
      - name: objectType
        in: query
        schema:
          type: string
      - name: groupBy
        in: query
        schema:
          type: string
    responses:
      200:
        description: Performance metrics
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PerformanceMetrics'
```

---

## CASE ANALYTICS ENDPOINTS

```yaml
/data-models/{modelId}/cases:
  get:
    tags: [Case Analytics]
    operationId: getCases
    summary: Get cases
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: variantId
        in: query
        schema:
          type: string
      - name: minThroughputTime
        in: query
        schema:
          type: integer
          description: Minimum throughput time in milliseconds
      - name: maxThroughputTime
        in: query
        schema:
          type: integer
      - $ref: '#/components/parameters/page'
      - $ref: '#/components/parameters/pageSize'
    responses:
      200:
        description: Cases
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/Case'

/data-models/{modelId}/cases/{caseId}:
  get:
    tags: [Case Analytics]
    operationId: getCaseDetails
    summary: Get case details
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: caseId
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        description: Case details
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CaseDetails'

/data-models/{modelId}/variants:
  get:
    tags: [Case Analytics]
    operationId: getVariants
    summary: Get process variants
    security:
      - bearerAuth: []
    parameters:
      - name: modelId
        in: path
        required: true
        schema:
          $ref: '#/components/schemas/UUID'
      - name: minCaseCount
        in: query
        schema:
          type: integer
      - name: maxVariants
        in: query
        schema:
          type: integer
          default: 100
      - $ref: '#/components/parameters/page'
      - $ref: '#/components/parameters/pageSize'
    responses:
      200:
        description: Variants
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/Variant'

/data-models/{modelId}/analysis/bottlenecks:
  get:
    tags: [Case Analytics]
    operationId: getBottlenecks
    summary: Get bottleneck analysis
    security:
      - bearerAuth: []
    responses:
      200:
        description: Bottleneck analysis
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BottleneckAnalysis'

/data-models/{modelId}/analysis/root-cause:
  post:
    tags: [Case Analytics]
    operationId: analyzeRootCause
    summary: Perform root cause analysis
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/RootCauseInput'
    responses:
      200:
        description: Root cause analysis
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RootCauseAnalysis'
```

---

## WEBHOOKS & EVENTS

```yaml
# Webhook Registration
/webhooks:
  post:
    tags: [Webhooks]
    operationId: createWebhook
    summary: Register webhook
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [url, events]
            properties:
              name:
                type: string
              url:
                type: string
                format: uri
              events:
                type: array
                items:
                  type: string
                  enum:
                    - data_model.loaded
                    - data_model.failed
                    - process.discovered
                    - conformance.completed
                    - action_flow.completed
                    - action_flow.failed
                    - signal.created
                    - task.created
              headers:
                type: object
                additionalProperties:
                  type: string
    responses:
      201:
        description: Webhook created
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Webhook'

# Webhook Payload Example
WebhookPayload:
  type: object
  properties:
    id:
      type: string
      format: uuid
    type:
      type: string
    timestamp:
      type: string
      format: date-time
    tenantId:
      type: string
      format: uuid
    payload:
      type: object
    signature:
      type: string
      description: "HMAC-SHA256 signature for verification"
```
