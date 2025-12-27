# ODIN Call Graph Documentation

> Comprehensive dependency and call graph analysis for the ODIN Process Mining Platform

**Generated:** December 27, 2024  
**Files Analyzed:** 198 TypeScript files  
**Circular Dependencies:** ✅ None detected

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Package-Level Dependencies](#package-level-dependencies)
3. [Layer-by-Layer Call Graphs](#layer-by-layer-call-graphs)
4. [Cross-Layer Dependencies](#cross-layer-dependencies)
5. [Visual Diagrams](#visual-diagrams)

---

## Architecture Overview

ODIN follows a strict DDD (Domain-Driven Design) architecture with clear layer separation:

```mermaid
graph TB
    subgraph "L3 - API Layer"
        API[api/]
    end

    subgraph "L2 - Services Layer"
        SVC[services/]
    end

    subgraph "I1-I4 - Infrastructure"
        INFRA[infra/database]
        EXT[infra/external]
    end

    subgraph "L1 - Domain Layer"
        DOM[domain/]
    end

    subgraph "L0 - Core Foundation"
        CC[core-contracts/]
        CL[core-lib/]
    end

    API --> SVC
    SVC --> INFRA
    SVC --> DOM
    INFRA --> DOM
    INFRA --> CC
    DOM --> CC
    CL --> CC
```

---

## Package-Level Dependencies

### core-contracts (L0 - Foundation)

The foundation layer with zero external dependencies.

```mermaid
graph LR
    subgraph "core-contracts"
        direction TB
        INDEX["index.ts"]

        subgraph "Types"
            COMMON["types/common.ts"]
            IDENT["types/identifiers.ts"]
            PAGE["types/pagination.ts"]
            QUERY["types/query.ts"]
            RESULT["types/result.ts"]
        end

        subgraph "Auth"
            CONTEXT["auth/context.ts"]
            PERMS["auth/permissions.ts"]
            ROLES["auth/roles.ts"]
        end

        subgraph "Contracts"
            CACHE["contracts/cache.ts"]
            DT["contracts/datetime.ts"]
            EVENTS["contracts/events.ts"]
            LOGGER["contracts/logger.ts"]
            STORAGE["contracts/storage.ts"]
        end

        subgraph "Errors"
            BASE["errors/base.ts"]
            ETYPES["errors/types.ts"]
        end

        INDEX --> COMMON
        INDEX --> IDENT
        INDEX --> PAGE
        INDEX --> QUERY
        INDEX --> RESULT
        INDEX --> CONTEXT
        INDEX --> PERMS
        INDEX --> ROLES
        INDEX --> CACHE
        INDEX --> DT
        INDEX --> EVENTS
        INDEX --> LOGGER
        INDEX --> STORAGE
        INDEX --> BASE
        INDEX --> ETYPES

        QUERY --> COMMON
        QUERY --> PAGE
        RESULT --> BASE
        ETYPES --> BASE
        ETYPES --> COMMON
        ROLES --> PERMS
        DT --> COMMON
    end
```

### core-lib (L0 - Utilities)

```mermaid
graph LR
    subgraph "core-lib"
        INDEX["index.ts"]

        subgraph "Implementations"
            LOGGER["implementations/logger.ts"]
            RESULT["implementations/result.ts"]
        end

        subgraph "Utils"
            DATE["utils/date.ts"]
            GUARDS["utils/guards.ts"]
            STRING["utils/string.ts"]
            VALID["utils/validation.ts"]
        end

        INDEX --> LOGGER
        INDEX --> RESULT
        INDEX --> DATE
        INDEX --> GUARDS
        INDEX --> STRING
        INDEX --> VALID

        LOGGER --> CC["@odin/core-contracts"]
        RESULT --> CC
    end
```

---

## Layer-by-Layer Call Graphs

### Domain Layer - Entities

```mermaid
graph TB
    subgraph "domain/entities"
        IDX["index.ts"]

        subgraph "Existence"
            TENANT["tenant.ts"]
            ORG["organization.ts"]
            ENV["environment.ts"]
        end

        subgraph "Identity"
            USER["user.ts"]
            ROLE["role.ts"]
            SESSION["session.ts"]
            TEAM["team.ts"]
            MFA["mfa-device.ts"]
            IDP["identity-provider.ts"]
        end

        subgraph "Commercial"
            PLAN["plan.ts"]
            SUB["subscription.ts"]
            INV["invoice.ts"]
            PAY["payment-method.ts"]
            USAGE["usage-record.ts"]
            COUPON["coupon.ts"]
        end

        subgraph "Process Mining"
            DM["data-model.ts"]
            DP["data-pool.ts"]
            TBL["table.ts"]
            CASE["case.ts"]
            OCEL["ocel-*.ts"]
            PM["process-model.ts"]
        end

        IDX --> TENANT
        IDX --> ORG
        IDX --> ENV
        IDX --> USER
        IDX --> ROLE
        IDX --> SESSION
        IDX --> TEAM
        IDX --> MFA
        IDX --> IDP
        IDX --> PLAN
        IDX --> SUB
        IDX --> INV
        IDX --> PAY
        IDX --> USAGE
        IDX --> COUPON
        IDX --> DM
        IDX --> DP
        IDX --> TBL
        IDX --> CASE
        IDX --> OCEL
        IDX --> PM
    end

    TENANT --> CC["@odin/core-contracts"]
    ORG --> CC
    ENV --> CC
    USER --> CC
    PLAN --> TENANT
    COUPON --> PLAN
    INV --> PLAN
    USAGE --> PLAN
```

### Domain Layer - Repositories

```mermaid
graph TD
    subgraph "Repository Interfaces"
        direction TB

        subgraph "Existence Layer"
            ITR["ITenantRepository"]
            IOR["IOrganizationRepository"]
            IER["IEnvironmentRepository"]
        end

        subgraph "Identity Layer"
            IUR["IUserRepository"]
            IRR["IRoleRepository"]
            ISR["ISessionRepository"]
            ITRM["ITeamRepository"]
            IMR["IMfaDeviceRepository"]
            IIPR["IIdentityProviderRepository"]
        end

        subgraph "Commercial Layer"
            IPR["IPlanRepository"]
            ISUBR["ISubscriptionRepository"]
            IINVR["IInvoiceRepository"]
            IPMR["IPaymentMethodRepository"]
            IUSR["IUsageRepository"]
            ICPR["ICouponRepository"]
        end

        subgraph "Process Mining Layer"
            IDPR["IDataPoolRepository"]
            IDMR["IDataModelRepository"]
            ITBLR["ITableRepository"]
            ICSR["ICaseRepository"]
            IOCLR["IOCELRepository"]
            IPMMR["IProcessModelRepository"]
        end
    end

    ITR --> TENT["Tenant Entity"]
    IOR --> ORGE["Organization Entity"]
    IUR --> USRE["User Entity"]
    IDPR --> DPE["DataPool Entity"]
```

### Infrastructure Layer - Repository Implementations

```mermaid
graph TB
    subgraph "infra/database"
        CONN["connection.ts"]
        TYPES["types.ts"]
        ERR["error-mapper.ts"]
        FACT["repository-factory.ts"]

        subgraph "repositories/existence"
            TR["TenantRepository"]
            OR["OrganizationRepository"]
            ER["EnvironmentRepository"]
        end

        subgraph "repositories/identity"
            UR["UserRepository"]
            RR["RoleRepository"]
            SR["SessionRepository"]
            TMR["TeamRepository"]
            MR["MfaDeviceRepository"]
            IPR["IdentityProviderRepository"]
        end

        subgraph "repositories/commercial"
            PLANR["PlanRepository"]
            SUBR["SubscriptionRepository"]
            INVR["InvoiceRepository"]
            PAYR["PaymentMethodRepository"]
            USAGER["UsageRecordRepository"]
            COUPR["CouponRepository"]
        end

        FACT --> CONN
        FACT --> TR
        FACT --> OR
        FACT --> ER
        FACT --> UR
        FACT --> RR
        FACT --> SR
        FACT --> TMR
        FACT --> MR
        FACT --> IPR

        TR --> CONN
        TR --> TYPES
        TR --> ERR
        TR --> DOM["@odin/domain"]
        TR --> CC["@odin/core-contracts"]

        UR --> CONN
        UR --> TYPES
        UR --> ERR
        UR --> DOM
        UR --> CC
    end
```

---

## Cross-Layer Dependencies

### Complete Dependency Flow

```mermaid
flowchart TD
    subgraph API["API Routes"]
        R1["/api/tenants"]
        R2["/api/users"]
        R3["/api/auth"]
    end

    subgraph SVC["Use Cases"]
        UC1["CreateTenantUseCase"]
        UC2["AuthenticateUserUseCase"]
        UC3["CreateDataPoolUseCase"]
    end

    subgraph REPOS["Repository Implementations"]
        TR["SqliteTenantRepository"]
        UR["SqliteUserRepository"]
        SR["SqliteSessionRepository"]
        DPR["SqliteDataPoolRepository"]
    end

    subgraph IFACE["Repository Interfaces"]
        ITR["ITenantRepository"]
        IUR["IUserRepository"]
        ISR["ISessionRepository"]
        IDPR["IDataPoolRepository"]
    end

    subgraph ENT["Domain Entities"]
        TE["Tenant"]
        UE["User"]
        SE["Session"]
        DPE["DataPool"]
    end

    subgraph CORE["Core Contracts"]
        RES["Result<T>"]
        TYPES["Common Types"]
        ERR["AppError"]
    end

    R1 --> UC1
    R2 --> UC2

    UC1 --> TR
    UC2 --> UR
    UC2 --> SR
    UC3 --> DPR

    TR -.implements.-> ITR
    UR -.implements.-> IUR
    SR -.implements.-> ISR
    DPR -.implements.-> IDPR

    ITR --> TE
    IUR --> UE
    ISR --> SE
    IDPR --> DPE

    TE --> RES
    TE --> TYPES

    TR --> ERR
    TR --> RES
```

---

## Visual Diagrams

The following SVG files have been generated in `docs/architecture/`:

| File                                                 | Description                          |
| ---------------------------------------------------- | ------------------------------------ |
| [core-contracts-deps.svg](./core-contracts-deps.svg) | Core contracts internal dependencies |
| [domain-entities.svg](./domain-entities.svg)         | Domain entity relationships          |
| [domain-repositories.svg](./domain-repositories.svg) | Repository interface dependencies    |
| [full-deps.json](./full-deps.json)                   | Raw JSON dependency data (198 files) |

---

## Statistics

### File Count by Package

| Package        | Files | Status          |
| -------------- | ----- | --------------- |
| core-contracts | 21    | ✅ Complete     |
| core-lib       | 9     | ✅ Complete     |
| domain         | 48    | ✅ Complete     |
| infra          | 52    | 🟡 28% Complete |
| services       | 2     | 🔴 Scaffolded   |
| api            | 3     | 🔴 Scaffolded   |

### Repository Implementation Status

| Layer          | Interfaces | Implemented | Coverage |
| -------------- | ---------- | ----------- | -------- |
| Existence      | 3          | 3           | 100%     |
| Identity       | 6          | 6           | 100%     |
| Commercial     | 6          | 6           | 100%     |
| Operational    | 3          | 3           | 100%     |
| Temporal       | 3          | 3           | 100%     |
| Integration    | 4          | 4           | 100%     |
| Process Mining | 6          | 6           | 100%     |
| Analytics      | 5          | 5           | 100%     |
| Studio         | 4          | 4           | 100%     |
| Automation     | 6          | 6           | 100%     |

---

## Key Call Chains

### 1. Tenant Creation Flow

```mermaid
sequenceDiagram
    participant API as API Layer
    participant UC as CreateTenantUseCase
    participant TR as TenantRepository
    participant DB as SQLite Database

    API->>UC: execute(request)
    UC->>UC: validate(request)
    UC->>TR: create(tenant)
    TR->>DB: INSERT INTO tenants
    DB-->>TR: result
    TR-->>UC: Result<Tenant>
    UC-->>API: Result<TenantResponse>
```

### 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant API as API Layer
    participant UC as AuthenticateUseCase
    participant UR as UserRepository
    participant SR as SessionRepository
    participant DB as SQLite Database

    API->>UC: execute(credentials)
    UC->>UR: findByEmail(email)
    UR->>DB: SELECT * FROM users
    DB-->>UR: user row
    UR-->>UC: Result<User>
    UC->>UC: verifyPassword()
    UC->>SR: create(session)
    SR->>DB: INSERT INTO sessions
    DB-->>SR: result
    SR-->>UC: Result<Session>
    UC-->>API: Result<AuthResponse>
```

### 3. Data Pool Import Flow

```mermaid
sequenceDiagram
    participant API as API Layer
    participant UC as ImportDataUseCase
    participant DPR as DataPoolRepository
    participant TR as TableRepository
    participant PM4PY as PM4Py Adapter
    participant DB as SQLite Database

    API->>UC: execute(importRequest)
    UC->>DPR: create(dataPool)
    DPR->>DB: INSERT INTO data_pools
    DB-->>DPR: result
    UC->>PM4PY: parseEventLog(file)
    PM4PY-->>UC: OCELLog
    UC->>TR: bulkCreate(tables)
    TR->>DB: INSERT INTO tables
    DB-->>TR: result
    UC-->>API: Result<DataPoolResponse>
```

---

## Next Steps

1. **Function-Level Analysis** - Use ts-morph for detailed method call tracking
2. **Event Flow Diagrams** - Map domain event publishers and subscribers
3. **API Route Documentation** - Generate OpenAPI specs from routes
4. **Interactive HTML** - Create d3.js-based interactive dependency explorer

---

_Generated with madge + graphviz + mermaid_
