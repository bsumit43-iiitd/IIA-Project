const util = require("util");
const mongoClient = require("../utils/connectDb");

class RecipeDb {
  constructor(context) {
    this.context = context;
  }
  async getRecipeNutritionsById(id) {
    try {
      const client = await mongoClient.getDb();
      const collection = client
        .db("recipedb2")
        .collection("RecipeDB_micronutrients_v1");
      const response = await collection
        .aggregate([
          { $match: { Recipe_id: id } },
          {
            $project: {
              _id: 0,
              Recipe_id: 0,
              Recipe_index: 0,
              cook_time: 0,
              prep_time: 0,
              Recipe_title: 0,
              url: 0,
              servings: 0,
              Source: 0,
              img_url: 0,
              Processes: 0,
              Continent: 0,
              Region: 0,
              Sub_region: 0,
              Calories: 0,
              Total_time: 0,
              total_time: 0,
              "Protein(g)": 0,
              "Carbohydrate, by difference(g)": 0,
              "Total lipid (Fat) (g)": 0,
              Utensils: 0,
            },
          },
        ])
        .toArray();
      return response[0];
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

  async getRecipeDetailsById(id) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("recipedb2").collection("RecipeDB_general");
      const response = await collection
        .aggregate([
          { $match: { Recipe_id: id } },
          {
            $project: {
              _id: 0,
            },
          },
        ])
        .toArray();
      return response[0];
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

  async getRecipeInstructions(id) {
    try {
      const client = await mongoClient.getDb();
      const collection = client
        .db("recipedb2")
        .collection("RecipeDB_instructions");
      const response = await collection
        .aggregate([
          { $match: { recipe_id: id } },
          {
            $project: {
              _id: 0,
            },
          },
        ])
        .toArray();
      return response?.[0]?.steps;
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

  async getRecipeIngredients(id) {
    try {
      const client = await mongoClient.getDb();
      const collection = client
        .db("recipedb2")
        .collection("RecipeDB_ingredient_phrase");
      const collection1 = client
        .db("recipedb2")
        .collection("RecipeDB_ingredient_nutrition");
      const [ingredients, nutritions] = await Promise.all([
        collection
          .aggregate([
            { $match: { recipe_no: id } },
            {
              $project: {
                _id: 0,
                ingredient: 1,
                quantity: 1,
                unit: 1,
                state: 1,
                ndb_id: 1,
              },
            },
          ])
          .toArray(),
        collection1
          .aggregate([
            { $match: { Recipe_id: id } },
            {
              $project: {
                _id: 0,
                "Energy (kcal)": 1,
                "Carbohydrate, by difference (g)": 1,
                "Protein (g)": 1,
                "Total lipid (fat) (g)": 1,
                ndb_id: 1,
              },
            },
          ])
          .toArray(),
      ]);
      const response = ingredients.map((ingredient) => {
        let res = ingredient;
        nutritions.forEach((nutrition) => {
          if (ingredient.ndb_id == nutrition.ndb_id)
            res = { ...ingredient, ...nutrition };
        });
        return res;
      });
      return response;
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

  async getAllRecipes(page, pageSize) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("recipedb2").collection("RecipeDB_general");

      const result = await collection
        .aggregate([
          {
            $facet: {
              data: [
                { $sort: { _id: -1 } },
                {
                  $skip: page * pageSize,
                },
                {
                  $limit: pageSize,
                },
                {
                  $project: {
                    _id: 0,
                  },
                },
              ],
              totalCount: [{ $count: "count" }],
            },
          },
        ])
        .toArray();
      console.log(result);
      const response = {
        data: result[0].data,
        totalCount: result[0].totalCount[0].count,
      };
      return response;
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
  async getRecipeofTheDay(skip) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("recipedb2").collection("RecipeDB_general");

      const result = await collection
        .aggregate([
          {
            $skip: skip,
          },
          {
            $limit: 1,
          },
        ])
        .toArray();
      let companies = [];
      result.forEach((item)=>{
        companies.push(item.CompanyName)
      })
      return companies;
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

module.exports = RecipeDb;
