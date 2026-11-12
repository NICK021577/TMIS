# TMIS Mongoose Models (31 collections)

Converted from the supplied SQL v2 schema. One Mongoose model per SQL table.

## Setup

```bash
npm install mongoose
```

```js
const mongoose = require("mongoose");
const models = require("./models");

async function start() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tmis");
  await Promise.all(Object.values(models).map((model) => model.init()));
  console.log("TMIS connected; model indexes initialized");
}

start().catch(console.error);
```

## Conversion notes

- MongoDB `_id` ObjectIds replace SQL UUID primary keys; all foreign key columns retain their original snake_case field names and use ObjectId `ref` paths. Convert IDs during any SQL data migration.
- `client_id` fields are kept as UUID strings for offline synchronization and idempotency.
- `DECIMAL` uses MongoDB Decimal128 for accurate amounts. When creating documents, pass decimal strings (e.g. `"123.45"`).
- SQL `TIME` values are saved as 24-hour time strings (`HH:mm` or `HH:mm:ss`), because a clock time without a calendar date is not a JavaScript Date.
- Original required fields, default values, enum constraints, and declared unique indexes are retained. nullable unique columns are indexed with partial indexes.
- MongoDB does not enforce SQL foreign keys or `ON DELETE RESTRICT / SET NULL`; implement those checks in application services/transactions. `populate()` resolves references but does not guarantee they exist.
- SQL `VARCHAR` sizes and `DECIMAL(p,s)` limits are not automatically enforced. Add explicit maxlength/precision validation if needed.
- SQL DATE columns map to JS Date; ensure consistent timezone and midnight handling for calendar-only values.
- SQL primary key `id` is not retained; use `_id`.
- The source creates `tmis_semifinal` but then executes `USE tmis`; choose the intended MongoDB database name in your connection URI.
- The `session` unique compound index enforces activity/date/period. `program_flow` keeps its `resource_person_id` as an optional user reference.
