const express = require("express");
const { catchErrors } = require("../utils/custom-helpers");
const Router = express.Router({ caseSensitive: true });

const RecipeSearch = require("../controller/recipeSearchController");
const recipeSearch = new RecipeSearch();

Router.get(
  "/recipe",
  catchErrors(async (req, res) => {
    let { page, pageSize, searchText, searchTerm, region, subRegion } =
      req.query;
    const result = await recipeSearch.getRecipes(
      searchText || "",
      region || "",
      subRegion || "",
      searchTerm || "",
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.post(
  "/recipesAdvanced",
  catchErrors(async (req, res) => {
    let { page, pageSize, searchTerm, sortColumn, sortType } = req.query;
    let {
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
    } = req.body;
    const result = await recipeSearch.getRecipesAdvanced(
      sortColumn || "",
      sortType || "",
      searchTerm || "",
      continent || "",
      region || "",
      subRegion || "",
      recipeTitle || "",
      ingredientUsed || "",
      ingredientNotUsed || "",
      cookingProcess || "",
      utensil || "",
      energyMin || "",
      energyMax || "",
      carbohydratesMin || "",
      carbohydratesMax || "",
      fatMin || "",
      fatMax || "",
      proteinMin || "",
      proteinMax || "",
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.post(
  "/recipesByNutrition",
  catchErrors(async (req, res) => {
    let { page, pageSize } = req.query;
    let {
      energyMin,
      energyMax,
      carbohydratesMin,
      carbohydratesMax,
      fatMin,
      fatMax,
      proteinMin,
      proteinMax,
    } = req.body;
    const result = await recipeSearch.getRecipesByNutrition(
      energyMin || "",
      energyMax || "",
      carbohydratesMin || "",
      carbohydratesMax || "",
      fatMin || "",
      fatMax || "",
      proteinMin || "",
      proteinMax || "",
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.post(
  "/recipesByIngredient",
  catchErrors(async (req, res) => {
    let { page, pageSize } = req.query;
    let { ingredientUsed, ingredientNotUsed } = req.body;
    const result = await recipeSearch.getRecipesByIngredient(
      ingredientUsed || "",
      ingredientNotUsed || "",
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.post(
  "/recipesByCategory",
  catchErrors(async (req, res) => {
    let { page, pageSize, searchTerm } = req.query;
    let { categoryUsed, categoryNotUsed } = req.body;
    const result = await recipeSearch.getRecipesByCategory(
      searchTerm,
      categoryUsed || "",
      categoryNotUsed || "",
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/regions",
  catchErrors(async (req, res) => {
    let { searchText, subRegion, continent } = req.query;
    const result = await recipeSearch.getRegions(
      searchText || "",
      subRegion || "",
      continent || ""
    );
    const response = {
      success: "true",
      message: "Regions fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/sub-regions",
  catchErrors(async (req, res) => {
    let { searchText, region, continent } = req.query;
    const result = await recipeSearch.getSubRegions(
      searchText || "",
      region || "",
      continent || ""
    );
    const response = {
      success: "true",
      message: "Sub-regions fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/continents",
  catchErrors(async (req, res) => {
    let { searchText, region, subRegion } = req.query;
    const result = await recipeSearch.getContinents(
      searchText || "",
      region || "",
      subRegion || ""
    );
    const response = {
      success: "true",
      message: "Continents fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/ingredients",
  catchErrors(async (req, res) => {
    let { searchText } = req.query;
    const result = await recipeSearch.getIngredients(searchText || "");
    const response = {
      success: "true",
      message: "Ingredients fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/categories",
  catchErrors(async (req, res) => {
    let { searchText } = req.query;
    const result = await recipeSearch.getCategories(searchText || "");
    const response = {
      success: "true",
      message: "Categories fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/processes",
  catchErrors(async (req, res) => {
    let { searchText } = req.query;
    const result = await recipeSearch.getProcesses(searchText || "");
    const response = {
      success: "true",
      message: "Processes fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/utensils",
  catchErrors(async (req, res) => {
    let { searchText } = req.query;
    const result = await recipeSearch.getUtensils(searchText || "");
    const response = {
      success: "true",
      message: "Utensils fetched successfully.",
      payload: result,
    };
    res.status(200).send(response);
  })
);

module.exports = Router;
