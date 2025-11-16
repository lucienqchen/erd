// Minimal Relational Algebra execution engine (stub)
// Operates on in-memory tables represented as arrays of objects.
// Supported structured ops (initial):
// - project: { type: 'project', table: 'T', cols: ['a','b'] }
// - select: { type: 'select', table: 'T', predicate: { op: '=', left: 'col', right: value } }
// - rename: { type: 'rename', table: 'T', mapping: { old: new } }
// - join: { type: 'join', left: 'A', right: 'B', on: [{ left: 'a.id', right: 'b.a_id' }] }
// - union: { type: 'union', left: 'A', right: 'B' }
// - difference: { type: 'difference', left: 'A', right: 'B' }
// - product: { type: 'product', left: 'A', right: 'B' }

function cloneRow(row) {
  return JSON.parse(JSON.stringify(row));
}

function project(table, cols) {
  return table.map(r => {
    const out = {};
    cols.forEach(c => { out[c] = r[c]; });
    return out;
  });
}

function select(table, predicate) {
  // Very simple predicate evaluator: supports equalities and basic operators
  const evalPred = (row, p) => {
    if (!p) return true;
    const leftVal = (typeof p.left === 'string' && p.left in row) ? row[p.left] : p.left;
    const rightVal = (typeof p.right === 'string' && p.right in row) ? row[p.right] : p.right;
    switch (p.op) {
      case '=': return leftVal == rightVal;
      case '!=': return leftVal != rightVal;
      case '>': return leftVal > rightVal;
      case '<': return leftVal < rightVal;
      case '>=': return leftVal >= rightVal;
      case '<=': return leftVal <= rightVal;
      default: return false;
    }
  };
  return table.filter(r => evalPred(r, predicate));
}

function rename(table, mapping) {
  return table.map(r => {
    const out = {};
    Object.keys(r).forEach(k => {
      const newKey = mapping && mapping[k] ? mapping[k] : k;
      out[newKey] = r[k];
    });
    return out;
  });
}

function cartesian(left, right) {
  const out = [];
  left.forEach(l => {
    right.forEach(r => {
      out.push(Object.assign({}, cloneRow(l), cloneRow(r)));
    });
  });
  return out;
}

function join(leftTable, rightTable, on) {
  // naive nested-loop join on list of equality conditions
  const out = [];
  leftTable.forEach(l => {
    rightTable.forEach(r => {
      let ok = true;
      if (on && Array.isArray(on)) {
        for (const cond of on) {
          const leftVal = cond.left.includes('.') ? getNestedValue(cond.left, l, r) : (l[cond.left]);
          const rightVal = cond.right.includes('.') ? getNestedValue(cond.right, l, r) : (r[cond.right]);
          if (leftVal !== rightVal) { ok = false; break; }
        }
      }
      if (ok) out.push(Object.assign({}, cloneRow(l), cloneRow(r)));
    });
  });
  return out;
}

function union(left, right) {
  const key = (r) => JSON.stringify(r);
  const map = new Map();
  left.forEach(r => map.set(key(r), r));
  right.forEach(r => map.set(key(r), r));
  return Array.from(map.values());
}

function difference(left, right) {
  const rightKeys = new Set(right.map(r => JSON.stringify(r)));
  return left.filter(r => !rightKeys.has(JSON.stringify(r)));
}

function getNestedValue(spec, lRow, rRow) {
  // spec like 'a.id' or 'b.name' where prefix may indicate table alias; fall back to merging
  const parts = spec.split('.');
  const key = parts[parts.length - 1];
  if (lRow && key in lRow) return lRow[key];
  if (rRow && key in rRow) return rRow[key];
  return undefined;
}

function execute(op, tables) {
  switch (op.type) {
    case 'project': {
      const t = tables[op.table];
      if (!t) throw new Error('Table not found: ' + op.table);
      return project(t, op.cols || []);
    }
    case 'select': {
      const t = tables[op.table];
      if (!t) throw new Error('Table not found: ' + op.table);
      return select(t, op.predicate);
    }
    case 'rename': {
      const t = tables[op.table];
      if (!t) throw new Error('Table not found: ' + op.table);
      return rename(t, op.mapping || {});
    }
    case 'product': {
      const l = tables[op.left];
      const r = tables[op.right];
      if (!l || !r) throw new Error('Left or right table not found for product');
      return cartesian(l, r);
    }
    case 'join': {
      const l = tables[op.left];
      const r = tables[op.right];
      if (!l || !r) throw new Error('Left or right table not found for join');
      return join(l, r, op.on);
    }
    case 'union': {
      const l = tables[op.left];
      const r = tables[op.right];
      if (!l || !r) throw new Error('Left or right table not found for union');
      return union(l, r);
    }
    case 'difference': {
      const l = tables[op.left];
      const r = tables[op.right];
      if (!l || !r) throw new Error('Left or right table not found for difference');
      return difference(l, r);
    }
    default:
      throw new Error('Unsupported op type: ' + op.type);
  }
}

module.exports = { execute };
