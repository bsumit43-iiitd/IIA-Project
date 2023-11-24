const util = require("util");
const mongoClient = require("../utils/connectDb");
const client = require("../utils/connectElastic");

const map = {
  prep_time: "prep_time",
  Recipe_title: "Recipe_title.keyword",
  lacto_vegetarian: "lacto_vegetarian",
  vegan: "vegan",
  Processes: "Processes",
  "Protein (g)": "Protein (g)",
  Calories: "Calories",
  url: "url",
  Utensils: "Utensils.keyword",
  Processes: "Processes.keyword",
  Source: "Source",
  ovo_vegetarian: "ovo_vegetarian",
  cook_time: "cook_time",
  "Energy (kcal)": "Energy (kcal)",
  servings: "servings.keyword",
  Sub_region: "Sub_region.keyword",
  Continent: "Continent.keyword",
  img_url: "img_url",
  "Total lipid (fat) (g)": "Total lipid (fat) (g)",
  ovo_lacto_vegetarian: "ovo_lacto_vegetarian",
  Region: "Region.keyword",

  total_time: "total_time",
  pescetarian: "pescetarian",
  Recipe_id: "Recipe_id",
  "Carbohydrate, by difference (g)": "Carbohydrate, by difference (g)",
};

class RecipeSearch {
  constructor(context) {
    this.context = context;
  }

  async getRecipesAdvanced(
    sortColumn,
    sortType,
    searchTerm,
    continent,
    region,
    subRegion,
    recipeTitle,
    ingredientUsed,
    ingredientNotUsed,
    cookingProcess,
    utensil,
    energyMin,
    energyMax,
    carbohydratesMin,
    carbohydratesMax,
    fatMin,
    fatMax,
    proteinMin,
    proteinMax,
    page,
    pageSize
  ) {
    try {
      let values = [];
      if (
        Array.isArray(ingredientUsed) &&
        Array.isArray(ingredientNotUsed) &&
        (ingredientUsed?.length || ingredientNotUsed?.length)
      ) {
        const mClient = await mongoClient.getDb();
        const collection = mClient
          .db("recipedb2")
          .collection("RecipeDB_ingredient_phrase");
        const temp = await collection
          .aggregate([
            {
              $group: {
                _id: "$recipe_no",
                matching_values: { $addToSet: "$ingredient" },
              },
            },
            { $sort: { _id: -1 } },
            {
              $match: {
                $and: [
                  ingredientUsed?.length
                    ? { matching_values: { $all: ingredientUsed } }
                    : {},
                ],
              },
            },
            {
              $match: {
                matching_values: { $nin: ingredientNotUsed },
              },
            },
          ])
          .toArray();
        values = temp?.map((item) => item._id);
      }

      let term = [];
      if (
        Array.isArray(values) &&
        Array.isArray(ingredientUsed) &&
        Array.isArray(ingredientNotUsed) &&
        (ingredientUsed?.length || ingredientNotUsed?.length)
      ) {
        term.push({
          terms: {
            "Recipe_id.keyword": values,
          },
        });
      }
      if (searchTerm)
        term.push({
          multi_match: {
            query: searchTerm || "",
            fields: [
              "Recipe_title",
              "Sub_region",
              "Region",
              "servings",
              "Calories",
              "Protein (g).keyword",
              "Total lipid (fat) (g).keyword",
            ],
          },
        });
      if (continent) {
        term.push({
          term: {
            "Continent.keyword": {
              value: continent,
            },
          },
        });
      }
      if (region) {
        term.push({
          term: {
            "Region.keyword": {
              value: region,
            },
          },
        });
      }
      if (subRegion) {
        term.push({
          term: {
            "Sub_region.keyword": {
              value: subRegion,
            },
          },
        });
      }

      if (recipeTitle) {
        term.push({
          match: {
            Recipe_title: recipeTitle,
          },
        });
      }
      if (cookingProcess) {
        term.push({
          match: {
            Processes: cookingProcess,
          },
        });
      }
      if (utensil) {
        term.push({
          match: {
            Utensils: utensil,
          },
        });
      }
      if (energyMin && energyMax)
        term.push({
          range: {
            ["Energy (kcal)"]: {
              gte: energyMin,
              lte: energyMax,
            },
          },
        });
      if (carbohydratesMin && carbohydratesMax)
        term.push({
          range: {
            ["Carbohydrate, by difference (g)"]: {
              gte: carbohydratesMin,
              lte: carbohydratesMax,
            },
          },
        });

      if (fatMin && fatMax)
        term.push({
          range: {
            ["Total lipid (fat) (g)"]: {
              gte: fatMin,
              lte: fatMax,
            },
          },
        });
      if (proteinMin && proteinMax)
        term.push({
          range: {
            ["Protein (g)"]: {
              gte: proteinMin,
              lte: proteinMax,
            },
          },
        });

      const result = await client.search({
        index: "recipedb2_general",
        body: {
          _source: {
            excludes: ["_id_str"],
          },
          from: page * pageSize,
          size: pageSize,
          sort: sortColumn && sortType ? [{ [map[sortColumn]]: sortType }] : [],
          query: {
            bool: {
              must: term,
            },
          },
          highlight: {
            pre_tags: ["<em>"],
            post_tags: ["</em>"],
            tags_schema: "styled",
            fields: {
              Recipe_title: {},
              Sub_region: {},
              Region: {},
              servings: {},
              Calories: {},
              "Protein (g)": {},
              "Total lipid (fat) (g)": {},
              "Protein (g).keyword": {},
              "Total lipid (fat) (g).keyword": {},
            },
          },
        },
      });

      const count = await client.count({
        index: "recipedb2_general",
        body: {
          query: {
            bool: {
              must: term,
            },
          },
        },
      });
      return {
        data:
          result?.hits?.hits?.map((item) => {
            return {
              ...item?._source,
              Recipe_title:
                item?.highlight?.Recipe_title?.[0] ||
                item._source?.Recipe_title,
              Sub_region:
                item?.highlight?.Sub_region?.[0] || item._source?.Sub_region,
              Region: item?.highlight?.Region?.[0] || item._source?.Region,
              servings:
                item?.highlight?.servings?.[0] || item._source?.servings,
              Calories:
                item?.highlight?.Calories?.[0] || item._source?.Calories,
              "Protein (g)":
                item?.highlight?.["Protein (g).keyword"]?.[0] ||
                item._source?.["Protein (g)"],
              "Total lipid (fat) (g)":
                item?.highlight?.["Total lipid (fat) (g).keyword"]?.[0] ||
                item._source?.["Total lipid (fat) (g)"],
            };
          }) || [],
        totalCount: count?.count || result?.hits?.total?.value,
      };
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }
  async getRecipesByNutrition(
    energyMin,
    energyMax,
    carbohydratesMin,
    carbohydratesMax,
    fatMin,
    fatMax,
    proteinMin,
    proteinMax,
    page,
    pageSize
  ) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("recipedb2").collection("RecipeDB_general");
      const result = await collection
        .aggregate([
          {
            $match: {
              $and: [
                energyMin && energyMax
                  ? {
                      "Energy (kcal)": {
                        $gte: energyMin,
                        $lte: energyMax,
                      },
                    }
                  : {},
                proteinMax && proteinMin
                  ? {
                      "Protein (g)": {
                        $gte: proteinMin,
                        $lte: proteinMax,
                      },
                    }
                  : {},
                fatMax && fatMin
                  ? {
                      "Total lipid (fat) (g)": {
                        $gte: fatMin,
                        $lte: fatMax,
                      },
                    }
                  : {},
                carbohydratesMax && carbohydratesMin
                  ? {
                      "Carbohydrate, by difference (g)": {
                        $gte: carbohydratesMin,
                        $lte: carbohydratesMax,
                      },
                    }
                  : {},
              ],
            },
          },
          { $sort: { Recipe_id: -1 } },

          {
            $facet: {
              data: [
                {
                  $skip: page * pageSize,
                },
                {
                  $limit: pageSize,
                },
              ],

              totalCount: [{ $count: "count" }],
            },
          },
        ])
        .toArray();
      return {
        data: result?.[0]?.data,
        totalCount: result?.[0]?.totalCount?.[0]?.count,
      };
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getUsedIngredientsChunk(categoryUsed) {
    const mclient = await mongoClient.getDb();
    const collection1 = mclient
      .db("recipedb2")
      .collection("RecipeDB_ingredient_flavor");
    let usedIngredientsChunk = [];
    for (const category of categoryUsed) {
      const res = await collection1
        .find({
          Dietrx_Category: category,
        })
        .toArray();

      usedIngredientsChunk.push(res.map((item) => item.IngID));
    }

    return usedIngredientsChunk;
  }

  async getRecipesByCategory(
    searchTerm,
    categoryUsed,
    categoryNotUsed,
    page,
    pageSize
  ) {
    try {
      const mclient = await mongoClient.getDb();
      let usedIngredientsValues = [],
        notUsedIngredientsValues = [];

      const collection1 = mclient
        .db("recipedb2")
        .collection("RecipeDB_ingredient_flavor");
      const usedIngredientsChunk = await this.getUsedIngredientsChunk(
        categoryUsed
      );
      const query = [];
      usedIngredientsChunk.map((ids) => {
        if (ids?.length)
          query.push({
            $match: {
              $and: [
                Array.isArray(categoryUsed) && categoryUsed?.length
                  ? { matching_values: { $in: ids } }
                  : {},
              ],
            },
          });
      });
      const usedIngredients = await collection1
        .find({
          Dietrx_Category: { $in: categoryUsed },
        })
        .toArray();
      const notUsedIngredients = await collection1
        .find({
          Dietrx_Category: { $in: categoryNotUsed },
        })
        .toArray();
      usedIngredientsValues = usedIngredients.map((item) => item.IngID);
      notUsedIngredientsValues = notUsedIngredients.map((item) => item.IngID);
      const collection = mclient
        .db("recipedb2")
        .collection("RecipeDB_ingredient_phrase");
      const temp = await collection
        .aggregate([
          {
            $group: {
              _id: "$recipe_no",
              matching_values: { $addToSet: "$ing_id" },
            },
          },
          { $sort: { _id: -1 } },
          ...query,
          {
            $match: {
              $and: [
                Array.isArray(categoryNotUsed) && categoryNotUsed?.length
                  ? { matching_values: { $nin: notUsedIngredientsValues } }
                  : {},
              ],
            },
          },
          {
            $facet: {
              data: [
                // {
                //   $skip: page * pageSize,
                // },
                // {
                //   $limit: pageSize,
                // },
              ],

              totalCount: [{ $count: "count" }],
            },
          },
        ])
        .toArray();

      const values = temp[0].data.map((item) => item._id);
      let term = [];
      if (Array.isArray(values)) {
        term.push({
          terms: {
            "Recipe_id.keyword": values,
          },
        });
      }

      if (searchTerm)
        term.push({
          multi_match: {
            query: searchTerm || "",
            fields: [
              "Recipe_title",
              "Sub_region",
              "Region",
              "servings",
              "Calories",
              "Protein (g).keyword",
              "Total lipid (fat) (g).keyword",
            ],
          },
        });
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          _source: {
            excludes: ["_id_str"],
          },
          from: page * pageSize,
          size: pageSize,

          query: {
            bool: {
              must: term,
            },
          },
          highlight: {
            pre_tags: ["<em>"],
            post_tags: ["</em>"],
            tags_schema: "styled",
            fields: {
              Recipe_title: {},
              Sub_region: {},
              Region: {},
              servings: {},
              Calories: {},
              "Protein (g)": {},
              "Total lipid (fat) (g)": {},
              "Protein (g).keyword": {},
              "Total lipid (fat) (g).keyword": {},
            },
          },
        },
      });

      const count = await client.count({
        index: "recipedb2_general",
        body: {
          query: {
            bool: {
              must: term,
            },
          },
        },
      });
      return {
        data:
          result?.hits?.hits?.map((item) => {
            return {
              ...item?._source,
              Recipe_title:
                item?.highlight?.Recipe_title?.[0] ||
                item._source?.Recipe_title,
              Sub_region:
                item?.highlight?.Sub_region?.[0] || item._source?.Sub_region,
              Region: item?.highlight?.Region?.[0] || item._source?.Region,
              servings:
                item?.highlight?.servings?.[0] || item._source?.servings,
              Calories:
                item?.highlight?.Calories?.[0] || item._source?.Calories,
              "Protein (g)":
                item?.highlight?.["Protein (g).keyword"]?.[0] ||
                item._source?.["Protein (g)"],
              "Total lipid (fat) (g)":
                item?.highlight?.["Total lipid (fat) (g).keyword"]?.[0] ||
                item._source?.["Total lipid (fat) (g)"],
            };
          }) || [],
        totalCount: count?.count || result?.hits?.total?.value,
      };
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getRecipesByIngredient(
    ingredientUsed,
    ingredientNotUsed,
    page,
    pageSize
  ) {
    try {
      const client = await mongoClient.getDb();
      const collection = client
        .db("recipedb2")
        .collection("RecipeDB_ingredient_phrase");
      const temp = await collection
        .aggregate([
          {
            $group: {
              _id: "$recipe_no",
              matching_values: { $addToSet: "$ingredient" },
            },
          },
          { $sort: { _id: -1 } },
          {
            $match: {
              $and: [
                ingredientUsed
                  ? { matching_values: { $eq: ingredientUsed } }
                  : {},
              ],
            },
          },
          {
            $match: {
              matching_values: { $ne: ingredientNotUsed },
            },
          },
          {
            $facet: {
              data: [
                {
                  $skip: page * pageSize,
                },
                {
                  $limit: pageSize,
                },
              ],

              totalCount: [{ $count: "count" }],
            },
          },
        ])
        .toArray();

      const values = temp[0].data.map((item) => item._id);
      const collection2 = client.db("recipedb2").collection("RecipeDB_general");
      const result = await collection2
        .aggregate([
          { $match: { Recipe_id: { $in: values } } },
          { $sort: { Recipe_id: -1 } },
        ])
        .toArray();

      return { data: result, totalCount: temp[0].totalCount[0].count };
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getRecipes(searchText, region, subRegion, searchTerm, page, pageSize) {
    try {
      let term = [];
      if (region) {
        term.push({
          term: {
            "Region.keyword": {
              value: region,
            },
          },
        });
      }
      if (subRegion) {
        term.push({
          term: {
            "Sub_region.keyword": {
              value: subRegion,
            },
          },
        });
      }
      if (searchText) {
        term.push({
          match: {
            Recipe_title: searchText,
          },
        });
      }
      if (searchTerm) {
        term.push({
          multi_match: {
            query: searchTerm || "",
            fields: [
              "Recipe_title",
              "Sub_region",
              "Region",
              "servings",
              "Calories.keyword",
              "Protein (g).keyword",
              "Total lipid (fat) (g).keyword",
            ],
          },
        });
      }
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          _source: {
            excludes: ["_id_str"],
          },
          from: page * pageSize,
          size: pageSize,
          query: {
            bool: {
              must: term,
            },
          },
          highlight: {
            pre_tags: ["<em>"],
            post_tags: ["</em>"],
            tags_schema: "styled",
            fields: {
              Recipe_title: {},
              Sub_region: {},
              Region: {},
              servings: {},
              Calories: {},
              "Protein (g).keyword": {},
              "Total lipid (fat) (g).keyword": {},
            },
          },
        },
      });

      const count = await client.count({
        index: "recipedb2_general",
        body: {
          query: {
            bool: {
              must: term,
            },
          },
        },
      });

      return { result: result.hits, count: count };
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getContinents(searchText, region, subRegion) {
    let term = [];
    if (subRegion) {
      term.push({
        term: {
          "Sub_region.keyword": {
            value: subRegion,
          },
        },
      });
    }
    if (region) {
      term.push({
        term: {
          "Region.keyword": {
            value: region,
          },
        },
      });
    }
    try {
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                ...term,
                {
                  match: {
                    Continent: searchText,
                  },
                },
              ],
            },
          },
          aggs: {
            distinct_colors: {
              terms: {
                field: "Continent.keyword",
                size: 1000000,
              },
            },
          },
        },
      });
      return result?.aggregations?.distinct_colors?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getRegions(searchText, subRegion, continent) {
    let term = [];
    if (subRegion) {
      term.push({
        term: {
          "Sub_region.keyword": {
            value: subRegion,
          },
        },
      });
    }
    if (continent) {
      term.push({
        term: {
          "Continent.keyword": {
            value: continent,
          },
        },
      });
    }
    try {
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                ...term,
                {
                  match: {
                    Region: searchText,
                  },
                },
              ],
            },
          },
          aggs: {
            distinct_colors: {
              terms: {
                field: "Region.keyword",
                size: 1000000,
              },
            },
          },
        },
      });
      return result?.aggregations?.distinct_colors?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getSubRegions(searchText, region, continent) {
    let term = [];
    if (region) {
      term.push({
        term: {
          "Region.keyword": {
            value: region,
          },
        },
      });
    }
    if (continent) {
      term.push({
        term: {
          "Continent.keyword": {
            value: continent,
          },
        },
      });
    }
    try {
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                ...term,
                {
                  match: {
                    Sub_region: searchText,
                  },
                },
              ],
            },
          },
          aggs: {
            distinct_colors: {
              terms: {
                field: "Sub_region.keyword",
                size: 1000000,
              },
            },
          },
        },
      });
      return result?.aggregations?.distinct_colors?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getIngredients(searchText) {
    try {
      const result = await client.search({
        index: "recipedb2_ingredient_phrase",
        body: {
          size: 0,
          query: {
            match: {
              ingredient: searchText,
            },
          },
          aggs: {
            distinct_colors: {
              terms: {
                field: "ingredient.keyword",
                size: 1000000,
              },
            },
          },
        },
      });
      return result?.aggregations?.distinct_colors?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getCategories(searchText) {
    try {
      const result = await client.search({
        index: "recipedb2_ingredient_flavor",
        body: {
          size: 0,
          query: {
            match: {
              Dietrx_Category: searchText,
            },
          },
          aggs: {
            distinct_colors: {
              terms: {
                field: "Dietrx_Category.keyword",
                size: 1000000,
              },
            },
          },
        },
      });
      return result?.aggregations?.distinct_colors?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getProcesses(searchText) {
    try {
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          size: 0,
          query: {
            match: {
              Processes: searchText,
            },
          },
          aggs: {
            unique_words: {
              terms: {
                field: "Processes.keyword",
                include:
                  searchText.toUpperCase() +
                  ".*" +
                  "|" +
                  searchText.toLowerCase() +
                  ".*",
                size: 10000,
              },
            },
          },
        },
      });
      return result?.aggregations?.unique_words?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getUtensils(searchText) {
    try {
      const result = await client.search({
        index: "recipedb2_general",
        body: {
          size: 0,
          query: {
            match: {
              Utensils: searchText,
            },
          },
          aggs: {
            unique_words: {
              terms: {
                field: "Utensils.keyword",
                include:
                  searchText.toUpperCase() +
                  ".*" +
                  "|" +
                  searchText.toLowerCase() +
                  ".*",
                size: 10000,
              },
            },
          },
        },
      });
      return result?.aggregations?.unique_words?.buckets;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }
}

module.exports = RecipeSearch;
