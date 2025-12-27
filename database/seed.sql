-- ============================================================================
-- SEED DATA for Development & Testing
-- ============================================================================

-- Default tenant for local development
INSERT INTO tenants (id, name, slug, settings, subscription_tier)
VALUES (
    'tn_dev_00000000-0000-0000-0000-000000000001',
    'Local Development',
    'local-dev',
    '{"timezone":"UTC","features":{"ocel_enabled":true,"neo4j_sync":false,"ml_predictions":true}}',
    'enterprise'
);

-- Sample data pool
INSERT INTO data_pools (id, tenant_id, name, description, pool_type, status)
VALUES (
    'dp_dev_00000000-0000-0000-0000-000000000001',
    'tn_dev_00000000-0000-0000-0000-000000000001',
    'Sample Process Data',
    'Sample data pool for development and testing',
    'hybrid',
    'active'
);

-- Sample event log
INSERT INTO event_logs (id, tenant_id, data_pool_id, name, description, case_notion, activity_key, timestamp_key, resource_key)
VALUES (
    'el_dev_00000000-0000-0000-0000-000000000001',
    'tn_dev_00000000-0000-0000-0000-000000000001',
    'dp_dev_00000000-0000-0000-0000-000000000001',
    'Order-to-Cash Process',
    'Sample order processing workflow',
    'order_id',
    'activity',
    'timestamp',
    'resource'
);

-- Sample activities
INSERT INTO activities (id, tenant_id, event_log_id, name, display_name, category, is_automated, color)
VALUES
    ('act_01', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'Create Order', 'Create Order', 'Order', 0, '#4CAF50'),
    ('act_02', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'Approve Order', 'Approve Order', 'Approval', 0, '#2196F3'),
    ('act_03', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'Ship Order', 'Ship Order', 'Fulfillment', 0, '#FF9800'),
    ('act_04', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'Invoice', 'Create Invoice', 'Billing', 1, '#9C27B0'),
    ('act_05', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'Payment', 'Receive Payment', 'Billing', 1, '#E91E63'),
    ('act_06', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'Close Order', 'Close Order', 'Order', 1, '#607D8B');

-- Sample resources
INSERT INTO resources (id, tenant_id, event_log_id, name, display_name, resource_type, department, role)
VALUES
    ('res_01', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'john.doe', 'John Doe', 'human', 'Sales', 'Sales Rep'),
    ('res_02', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'jane.smith', 'Jane Smith', 'human', 'Sales', 'Sales Manager'),
    ('res_03', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'warehouse_bot', 'Warehouse Bot', 'system', 'Logistics', 'Automation'),
    ('res_04', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'billing_system', 'Billing System', 'system', 'Finance', 'Automation');

-- Sample variant (happy path)
INSERT INTO variants (id, tenant_id, event_log_id, sequence, sequence_hash, case_count, percentage, is_happy_path)
VALUES (
    'var_01',
    'tn_dev_00000000-0000-0000-0000-000000000001',
    'el_dev_00000000-0000-0000-0000-000000000001',
    '["Create Order","Approve Order","Ship Order","Invoice","Payment","Close Order"]',
    'sha256_happy_path',
    3,
    60.0,
    1
);

-- Sample cases
INSERT INTO cases (id, tenant_id, event_log_id, case_id, variant_id, start_time, end_time, duration_seconds, event_count, status)
VALUES
    ('case_01', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'ORD-2024-001', 'var_01', '2024-01-15T09:00:00Z', '2024-01-17T14:00:00Z', 190800, 6, 'completed'),
    ('case_02', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'ORD-2024-002', 'var_01', '2024-01-16T10:30:00Z', '2024-01-18T16:00:00Z', 192600, 6, 'completed'),
    ('case_03', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'ORD-2024-003', 'var_01', '2024-01-17T08:00:00Z', NULL, NULL, 3, 'open');

-- Sample events for case 1
INSERT INTO events (id, tenant_id, event_log_id, case_id, activity_id, activity_name, timestamp, sort_key, resource_id, resource_name, lifecycle)
VALUES
    ('evt_01_01', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'case_01', 'act_01', 'Create Order', '2024-01-15T09:00:00Z', 0, 'res_01', 'john.doe', 'complete'),
    ('evt_01_02', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'case_01', 'act_02', 'Approve Order', '2024-01-15T11:30:00Z', 0, 'res_02', 'jane.smith', 'complete'),
    ('evt_01_03', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'case_01', 'act_03', 'Ship Order', '2024-01-16T08:00:00Z', 0, 'res_03', 'warehouse_bot', 'complete'),
    ('evt_01_04', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'case_01', 'act_04', 'Invoice', '2024-01-16T09:00:00Z', 0, 'res_04', 'billing_system', 'complete'),
    ('evt_01_05', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'case_01', 'act_05', 'Payment', '2024-01-17T10:00:00Z', 0, 'res_04', 'billing_system', 'complete'),
    ('evt_01_06', 'tn_dev_00000000-0000-0000-0000-000000000001', 'el_dev_00000000-0000-0000-0000-000000000001', 'case_01', 'act_06', 'Close Order', '2024-01-17T14:00:00Z', 0, 'res_04', 'billing_system', 'complete');

-- Sample OCEL object types
INSERT INTO ocel_object_types (id, tenant_id, data_pool_id, name, display_name, attribute_schema, is_process_object, color)
VALUES
    ('ot_order', 'tn_dev_00000000-0000-0000-0000-000000000001', 'dp_dev_00000000-0000-0000-0000-000000000001', 'Order', 'Order', '{"attributes":[{"name":"customer_id","type":"string"},{"name":"total_amount","type":"float"}]}', 1, '#4CAF50'),
    ('ot_item', 'tn_dev_00000000-0000-0000-0000-000000000001', 'dp_dev_00000000-0000-0000-0000-000000000001', 'Item', 'Order Item', '{"attributes":[{"name":"product_name","type":"string"},{"name":"quantity","type":"integer"}]}', 1, '#2196F3'),
    ('ot_customer', 'tn_dev_00000000-0000-0000-0000-000000000001', 'dp_dev_00000000-0000-0000-0000-000000000001', 'Customer', 'Customer', '{"attributes":[{"name":"name","type":"string"},{"name":"segment","type":"string"}]}', 0, '#FF9800');

-- Sample OCEL event types
INSERT INTO ocel_event_types (id, tenant_id, data_pool_id, name, display_name, attribute_schema, category, color)
VALUES
    ('et_create', 'tn_dev_00000000-0000-0000-0000-000000000001', 'dp_dev_00000000-0000-0000-0000-000000000001', 'Create Order', 'Create Order', '{"attributes":[{"name":"resource","type":"string"}]}', 'Order', '#4CAF50'),
    ('et_add_item', 'tn_dev_00000000-0000-0000-0000-000000000001', 'dp_dev_00000000-0000-0000-0000-000000000001', 'Add Item', 'Add Item to Order', '{"attributes":[{"name":"resource","type":"string"}]}', 'Order', '#2196F3'),
    ('et_ship', 'tn_dev_00000000-0000-0000-0000-000000000001', 'dp_dev_00000000-0000-0000-0000-000000000001', 'Ship', 'Ship Order', '{"attributes":[{"name":"carrier","type":"string"}]}', 'Fulfillment', '#FF9800');

-- Update statistics on event log
UPDATE event_logs
SET statistics = '{"case_count":3,"event_count":6,"activity_count":6,"variant_count":1,"resource_count":4}'
WHERE id = 'el_dev_00000000-0000-0000-0000-000000000001';

-- Sample dashboard
INSERT INTO dashboards (id, tenant_id, name, description, layout, widgets)
VALUES (
    'dash_01',
    'tn_dev_00000000-0000-0000-0000-000000000001',
    'Process Overview',
    'Main process monitoring dashboard',
    '{"columns":12,"row_height":100}',
    '[{"id":"w1","type":"kpi_card","position":{"x":0,"y":0,"w":3,"h":2},"config":{"title":"Total Cases"}},{"id":"w2","type":"process_map","position":{"x":3,"y":0,"w":9,"h":6},"config":{"title":"Process Flow"}}]'
);

SELECT 'Seed data loaded successfully' AS message;
