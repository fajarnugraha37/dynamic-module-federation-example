// infer a JSON Schema (draft 4-ish) from a JS value
export function inferSchema(v) {
  if (v === null) return { type: "null" };
  if (Array.isArray(v)) {
    if (v.length === 0) return { type: "array", items: {} };
    // homogeneous? use first item; else anyOf
    const itemSchemas = v.map(inferSchema);
    const first = JSON.stringify(itemSchemas[0]);
    const homo = itemSchemas.every(s => JSON.stringify(s) === first);
    return { type: "array", items: homo ? itemSchemas[0] : { anyOf: itemSchemas } };
  }
  switch (typeof v) {
    case "string":  return { type: "string" };
    case "number":  return Number.isInteger(v) ? { type: "integer" } : { type: "number" };
    case "boolean": return { type: "boolean" };
    case "object": {
      const props = {};
      const required = [];
      for (const k of Object.keys(v)) {
        props[k] = inferSchema(v[k]);
        required.push(k);
      }
      return { type: "object", properties: props, required };
    }
    default: return {}; // fallback: "any"
  }
}
