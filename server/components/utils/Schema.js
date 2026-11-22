const { sql } = require('../config/dbConnect');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Types = { String, Number, Boolean, Date, UUID: 'UUID', Mixed: 'Mixed' };
const typeName = (t) => (typeof t === 'function' ? t.name : t);

class ValidationError extends Error {
    constructor(errors) {
        super(Object.values(errors).join(', '));
        this.name = 'ValidationError';
        this.errors = errors; // { field: 'message' }
    }
}

/**
 * Field options: type, required, default, unique, enum, trim, lowercase, uppercase, maxlength, minlength,
 *   match, min, max, integer, select (false = hidden), primaryKey,
 *   ref ('table'), onDelete ('cascade' | 'restrict' | 'set null'),
 *   onUpdate (value or function, set automatically on every update, e.g. Date.now for updated_at),
 *   sqlType (override the column type for createTable, e.g. 'date', 'time', 'numeric(12,2)').
 *
 * Schema options:
 *   id: false               -> don't add the auto-increment `id` (declare your own primaryKey field)
 *   unique: [['a', 'b']]    -> composite unique keys
 */
class Schema {
    constructor(definition, options = {}) {
        this.paths = {};
        // Auto-increment integer primary key (like SQL AUTO_INCREMENT), assigned by the database
        if (!definition.id && options.id !== false) {
            this.paths.id = { type: Number, integer: true, primaryKey: true, autoIncrement: true };
        }
        for (const [key, def] of Object.entries(definition)) {
            this.paths[key] = typeof def === 'object' && !Array.isArray(def) ? { ...def } : { type: def };
        }
        this.primaryKey = Object.keys(this.paths).find((k) => this.paths[k].primaryKey);
        if (!this.primaryKey) throw new Error('Schema needs a primary key (use id: false only with a primaryKey field)');
        this.options = { unique: [], ...options };
        this.statics = {};
    }
}
Schema.Types = Types;

// ---- casting & validation ---------------------------------------------------

function castValue(key, value, def) {
    if (value === null) return null;
    switch (typeName(def.type)) {
        case 'String': {
            let v = String(value);
            if (def.trim) v = v.trim();
            if (def.lowercase) v = v.toLowerCase();
            if (def.uppercase) v = v.toUpperCase();
            return v;
        }
        case 'Number': {
            const v = Number(value);
            if (Number.isNaN(v)) throw new ValidationError({ [key]: `${key} must be a number` });
            if (def.integer && !Number.isInteger(v)) throw new ValidationError({ [key]: `${key} must be a whole number` });
            return v;
        }
        case 'Boolean':
            if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
            return Boolean(value);
        case 'Date': {
            const v = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(v.getTime())) throw new ValidationError({ [key]: `${key} must be a valid date` });
            return v;
        }
        case 'UUID': {
            const v = String(value);
            if (!UUID_RE.test(v)) throw new ValidationError({ [key]: `${key} must be a valid UUID` });
            return v;
        }
        case 'Mixed':
            return sql.json(value);
        default:
            throw new Error(`Unsupported type for "${key}"`);
    }
}

function validateValue(key, v, def) {
    if (v === null || v === undefined) return def.required ? `${key} is required` : null;
    if (def.enum && !def.enum.includes(v)) return `${key} must be one of: ${def.enum.join(', ')}`;
    if (typeof v === 'string') {
        if (def.required && v === '') return `${key} is required`;
        if (def.maxlength && v.length > def.maxlength) return `${key} must be at most ${def.maxlength} characters`;
        if (def.minlength && v.length < def.minlength) return `${key} must be at least ${def.minlength} characters`;
        if (def.match && !def.match.test(v)) return `${key} is invalid`;
    }
    if (typeof v === 'number') {
        if (def.min !== undefined && v < def.min) return `${key} must be at least ${def.min}`;
        if (def.max !== undefined && v > def.max) return `${key} must be at most ${def.max}`;
    }
    return null;
}

/** Casts + validates a document. `partial` = update (skip defaults & missing required fields). */
function castDoc(paths, doc, { partial = false } = {}) {
    const data = {};
    const errors = {};
    for (const [key, def] of Object.entries(paths)) {
        if (def.autoIncrement) continue; // the database assigns auto-increment ids
        let value = doc[key];
        if (value === undefined && !partial && def.default !== undefined) {
            value = typeof def.default === 'function' ? def.default() : def.default;
        }
        if (value === undefined && partial) continue;
        try {
            const v = value === undefined ? undefined : castValue(key, value, def);
            const err = validateValue(key, v, def);
            if (err) errors[key] = err;
            else if (v !== undefined) data[key] = v;
        } catch (e) {
            if (e instanceof ValidationError) Object.assign(errors, e.errors);
            else throw e;
        }
    }
    if (Object.keys(errors).length) throw new ValidationError(errors);
    return data;
}

// ---- model ------------------------------------------------------------------

/** Casts an update and fills `onUpdate` fields (e.g. updated_at). Never changes the primary key. */
function castUpdate(schema, update) {
    const data = castDoc(schema.paths, update, { partial: true });
    delete data[schema.primaryKey];
    if (!Object.keys(data).length) return data;
    for (const [key, def] of Object.entries(schema.paths)) {
        if (def.onUpdate !== undefined && data[key] === undefined) {
            data[key] = castValue(key, typeof def.onUpdate === 'function' ? def.onUpdate() : def.onUpdate, def);
        }
    }
    return data;
}

/**
 * Registers a model. Like Mongoose, registering the same name twice is an error, so model files use:
 *   module.exports = models.user || model('user', UserModel);
 */
function model(table, schema) {
    if (models[table]) throw new Error(`Model "${table}" is already defined. Use: models.${table} || model('${table}', ...)`);
    const { paths } = schema;
    const keys = Object.keys(paths);
    const pk = schema.primaryKey;

    // Postgres returns numeric/decimal columns as strings; turn Number fields back into numbers
    const numericKeys = keys.filter((k) => typeName(paths[k].type) === 'Number');
    function hydrate(rows) {
        for (const row of rows) {
            for (const k of numericKeys) if (typeof row[k] === 'string') row[k] = Number(row[k]);
        }
        return rows;
    }

    function assertField(key) {
        if (!paths[key]) throw new Error(`Unknown field "${key}" on model "${table}"`);
    }

    /** Mongoose-style select: 'email first_name', '-contact', '+password_hash'. */
    function columns(select = '') {
        const tokens = select.split(/\s+/).filter(Boolean);
        const picked = tokens.filter((t) => !/^[+-]/.test(t));
        picked.forEach(assertField);
        let cols = picked.length ? [pk, ...picked] : keys.filter((k) => paths[k].select !== false);
        for (const t of tokens) {
            const name = t.slice(1);
            if (t[0] === '+') { assertField(name); if (!cols.includes(name)) cols.push(name); }
            if (t[0] === '-') cols = cols.filter((c) => c !== name);
        }
        return [...new Set(cols)];
    }

    /** { email: 'a@b.c', status: ['active','suspended'], middle_name: null } -> WHERE ... */
    function where(filter = {}) {
        const parts = Object.entries(filter).map(([key, value]) => {
            assertField(key);
            // never silently drop a condition: { id: undefined } would otherwise match every row
            if (value === undefined) throw new ValidationError({ [key]: `${key} is required` });
            if (value === null) return sql`${sql(key)} is null`;
            if (Array.isArray(value)) {
                return sql`${sql(key)} in ${sql(value.map((v) => castValue(key, v, paths[key])))}`;
            }
            return sql`${sql(key)} = ${castValue(key, value, paths[key])}`;
        });
        if (!parts.length) return sql``;
        return sql`where ${parts.reduce((a, b) => sql`${a} and ${b}`)}`;
    }

    /** { created_at: -1, last_name: 1 } -> ORDER BY ... */
    function orderBy(sort) {
        const parts = Object.entries(sort || {}).map(([key, dir]) => {
            assertField(key);
            return sql`${sql(key)} ${dir === -1 || dir === 'desc' ? sql`desc` : sql`asc`}`;
        });
        if (!parts.length) return sql``;
        return sql`order by ${parts.reduce((a, b) => sql`${a}, ${b}`)}`;
    }

    const Model = {
        modelName: table,
        schema,
        primaryKey: pk,

        /** Insert one row. Returns the created row. */
        async create(doc) {
            const data = castDoc(paths, doc);
            const [row] = hydrate(await sql`
                insert into ${sql(table)} ${sql(data)}
                returning ${sql(columns())}`);
            return row;
        },

        /** Insert many rows. Returns the created rows. */
        async insertMany(docs) {
            if (!docs.length) return [];
            const data = docs.map((d) => castDoc(paths, d));
            const cols = [...new Set(data.flatMap(Object.keys))];
            for (const d of data) for (const c of cols) if (d[c] === undefined) d[c] = null;
            return hydrate(await sql`
                insert into ${sql(table)} ${sql(data, cols)}
                returning ${sql(columns())}`);
        },

        /** find(filter, { select, sort, limit, skip }) */
        async find(filter = {}, { select, sort, limit, skip } = {}) {
            return hydrate(await sql`
                select ${sql(columns(select))} from ${sql(table)}
                ${where(filter)}
                ${orderBy(sort)}
                ${limit ? sql`limit ${limit}` : sql``}
                ${skip ? sql`offset ${skip}` : sql``}`);
        },

        async findOne(filter = {}, options = {}) {
            const [row] = await Model.find(filter, { ...options, limit: 1 });
            return row || null;
        },

        /** Finds by primary key (`id`, or the schema's own primaryKey field). */
        async findById(id, options = {}) {
            return Model.findOne({ [pk]: id }, options);
        },

        /** Updates one row and returns the UPDATED row (like Mongoose's { new: true }). */
        async findByIdAndUpdate(id, update, { select } = {}) {
            const data = castUpdate(schema, update);
            if (!Object.keys(data).length) return Model.findById(id, { select });
            const [row] = hydrate(await sql`
                update ${sql(table)} set ${sql(data)}
                ${where({ [pk]: id })}
                returning ${sql(columns(select))}`);
            return row || null;
        },

        /** Updates every matching row. Returns the number of rows updated. */
        async updateMany(filter, update) {
            const data = castUpdate(schema, update);
            if (!Object.keys(data).length) return 0;
            const result = await sql`update ${sql(table)} set ${sql(data)} ${where(filter)}`;
            return result.count;
        },

        /** Deletes one row and returns it. */
        async findByIdAndDelete(id) {
            const [row] = hydrate(await sql`
                delete from ${sql(table)} ${where({ [pk]: id })}
                returning ${sql(columns())}`);
            return row || null;
        },

        /** Deletes every matching row. Returns the number of rows deleted. */
        async deleteMany(filter) {
            if (!filter || !Object.keys(filter).length) {
                throw new Error('deleteMany needs a filter (refusing to delete every row)');
            }
            const result = await sql`delete from ${sql(table)} ${where(filter)}`;
            return result.count;
        },

        async countDocuments(filter = {}) {
            const [{ count }] = await sql`select count(*)::int as count from ${sql(table)} ${where(filter)}`;
            return count;
        },

        async exists(filter) {
            const [row] = await sql`select 1 from ${sql(table)} ${where(filter)} limit 1`;
            return Boolean(row);
        },

        /** Creates the table if it doesn't exist (like Mongoose's createCollection). */
        async createTable() {
            // skip quietly if the table already exists (avoids a Postgres notice per table)
            const [{ exists }] = await sql`select to_regclass(${`"${table}"`}) is not null as exists`;
            if (exists) return false;

            const literal = (v) => (typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : String(v));
            const pgType = (def) => {
                if (def.sqlType) return def.sqlType;
                switch (typeName(def.type)) {
                    case 'String': return def.maxlength ? `varchar(${def.maxlength})` : 'text';
                    case 'Number': return def.integer ? 'integer' : 'numeric';
                    case 'Boolean': return 'boolean';
                    case 'Date': return 'timestamptz';
                    case 'UUID': return 'uuid';
                    case 'Mixed': return 'jsonb';
                    default: throw new Error(`Unsupported type "${typeName(def.type)}"`);
                }
            };
            const cols = keys.map((key) => {
                const def = paths[key];
                let col = `"${key}" ${pgType(def)}`;
                if (def.autoIncrement) col += ' generated by default as identity';
                if (def.primaryKey) col += ' primary key';
                if (def.required && !def.primaryKey) col += ' not null';
                if (def.unique) col += ' unique';
                if (def.primaryKey && typeName(def.type) === 'UUID') col += ' default gen_random_uuid()';
                else if (def.default === Date.now) col += ' default now()';
                else if (def.default !== undefined && def.default !== null && typeof def.default !== 'function') {
                    col += ` default ${literal(def.default)}`;
                }
                if (def.enum) col += ` check ("${key}" in (${def.enum.map(literal).join(', ')}))`;
                if (def.ref) {
                    col += ` references "${def.ref}"`;
                    if (def.onDelete) col += ` on delete ${def.onDelete}`;
                }
                return col;
            });
            for (const group of schema.options.unique) {
                group.forEach(assertField);
                cols.push(`unique (${group.map((k) => `"${k}"`).join(', ')})`);
            }
            await sql.unsafe(`create table if not exists "${table}" (\n  ${cols.join(',\n  ')}\n)`);
            return true;
        },
    };

    // Like Mongoose: make sure the table exists before the first query.
    // Checked once per process; the result (a promise) is shared by every request.
    let tableReady = null;
    Model.ensureTable = function ensureTable() {
        if (!tableReady) {
            tableReady = (async () => {
                // tables this one references must exist first
                for (const def of Object.values(paths)) {
                    if (def.ref && def.ref !== table) await getModel(def.ref).ensureTable();
                }
                return Model.createTable();
            })().catch((error) => {
                tableReady = null; // allow a retry on the next query
                throw error;
            });
        }
        return tableReady;
    };

    for (const name of ['create', 'insertMany', 'find', 'findByIdAndUpdate', 'updateMany',
        'findByIdAndDelete', 'deleteMany', 'countDocuments', 'exists']) {
        const query = Model[name];
        Model[name] = async (...args) => {
            await Model.ensureTable();
            return query(...args);
        };
    }

    // schema.statics.myFn = function () { this.findOne(...) }  ->  Model.myFn()
    for (const [name, fn] of Object.entries(schema.statics)) Model[name] = fn.bind(Model);

    models[table] = Model;

    // Like Mongoose's autoCreate: check the table as soon as the model is registered.
    // Deferred until the current require() calls finish, so every referenced model is registered first.
    setImmediate(() => {
        Model.ensureTable()
            .then((created) => { if (created) console.log(`Created table "${table}"`); })
            .catch((error) => console.error(`Could not create table "${table}": ${error.message}`));
    });

    return Model;
}

/** Every registered model, by table name (like mongoose.models). */
const models = {};

/** Finds a registered model; loads all model files if it isn't registered yet. */
function getModel(table) {
    if (!models[table]) require('../models');
    if (!models[table]) throw new Error(`Model "${table}" is referenced but not defined`);
    return models[table];
}

module.exports = { Schema, model, models, ValidationError };
