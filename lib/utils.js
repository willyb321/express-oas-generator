const generateSchema = require('generate-schema');
const fs = require('fs');
JSON.truncate = require('json-truncate');
JSON.truncate.configure({
  maxDepth: 2,
  replace: '[Truncated]'
});

module.exports.sortObject = o => {
  const sorted = {};
  let key;
  const a = [];
  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }
  a.sort();
  for (key = 0; key < a.length; key += 1) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
};

module.exports.getType = obj => {
  if ([true, false, 'true', 'false'].indexOf(obj) !== -1) {
    return 'boolean';
  }

  if (isNaN(obj)) {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  if (`${obj}`.indexOf('.') !== -1) {
    return 'float';
  }

  return 'integer';
};

const fillExamples = (schema, vals) => {
  for (const prop in schema.properties) {
    if (schema.properties[prop].type === 'object') {
      fillExamples(schema.properties[prop], vals[prop]);
    } else {
      schema.properties[prop].example = prop === 'password' ? '******' : vals[prop];
    }
  }
};

module.exports.getSchema = json => {
  const schema = generateSchema.json(json);
  delete schema.$schema;
  fillExamples(schema, JSON.truncate(json));
  return schema;
};


module.exports.save = (path, data) => {
  return fs.writeFileSync(path, JSON.stringify(data, null, 2));
};
