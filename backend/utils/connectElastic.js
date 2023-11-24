const elasticsearch = require("@elastic/elasticsearch");
const elasticUrl = `http://localhost:9201`;

const client = new elasticsearch.Client({
  node: elasticUrl,
});

module.exports = client;
