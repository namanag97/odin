#!/bin/bash

# Fix pagination issues - replace request.offset with Pagination.toOffset
find database/repositories -name "*.ts" -type f -exec sed -i '' 's/const limit = request\.limit || 20;/const { limit, offset } = Pagination.toOffset(request);/g' {} +
find database/repositories -name "*.ts" -type f -exec sed -i '' 's/const offset = request\.offset || 0;//g' {} +
find database/repositories -name "*.ts" -type f -exec sed -i '' '/^\s*$/d' {} +

# Fix pagination response - replace items with data
find database/repositories -name "*.ts" -type f -exec sed -i '' 's/items: data\.map/data: data.map/g' {} +

# Fix PageResponse manually built objects - replace with Pagination.buildResponse
# This is complex, so we'll handle it file by file

echo "Bulk fixes applied!"
