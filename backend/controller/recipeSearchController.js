const RecipeSearch = require("../db/recipeSearch");

class Recipe {
  constructor() {
    this.recipeDb = new RecipeSearch();
  }
  async getRecipes(searchText, region, subRegion, searchTerm, page, pageSize) {
    const { result, count } = await this.recipeDb.getRecipes(
      searchText,
      region,
      subRegion,
      searchTerm,
      page,
      pageSize
    );
    let data = [];
    result?.hits?.forEach((item) => {
      data.push({
        ...item?._source,
        Recipe_title:
          item?.highlight?.Recipe_title?.[0] || item._source?.Recipe_title,
        Sub_region:
          item?.highlight?.Sub_region?.[0] || item._source?.Sub_region,
        Region: item?.highlight?.Region?.[0] || item._source?.Region,
        servings: item?.highlight?.servings?.[0] || item._source?.servings,
        Calories: item?.highlight?.Calories?.[0] || item._source?.Calories,
        "Protein (g)":
          item?.highlight?.["Protein (g).keyword"]?.[0] ||
          item._source?.["Protein (g)"],
        "Total lipid (fat) (g)":
          item?.highlight?.["Total lipid (fat) (g).keyword"]?.[0] ||
          item._source?.["Total lipid (fat) (g)"],
      });
    });
    return { data: data, totalCount: count?.count || result?.total?.value };
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
    const response = await this.recipeDb.getRecipesAdvanced(
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
      Number(energyMin),
      Number(energyMax),
      Number(carbohydratesMin),
      Number(carbohydratesMax),
      Number(fatMin),
      Number(fatMax),
      Number(proteinMin),
      Number(proteinMax),
      page,
      pageSize
    );

    return response;
  }

  async getRecipesByIngredient(
    ingredientUsed,
    ingredientNotUsed,
    page,
    pageSize
  ) {
    const result = await this.recipeDb.getRecipesByIngredient(
      ingredientUsed,
      ingredientNotUsed,
      page,
      pageSize
    );
    return result;
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
    const result = await this.recipeDb.getRecipesByNutrition(
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
    );
    return result;
  }

  async getRecipesByCategory(
    searchTerm,
    categoryUsed,
    categoryNotUsed,
    page,
    pageSize
  ) {
    const result = await this.recipeDb.getRecipesByCategory(
      searchTerm,
      categoryUsed,
      categoryNotUsed,
      page,
      pageSize
    );
    return result;
  }

  async getContinents(searchText, region, subRegion) {
    const response = await this.recipeDb.getContinents(
      searchText,
      region,
      subRegion
    );
    const result = response.map((item) => item.key);
    return result;
  }

  async getRegions(searchText, subRegion, continent) {
    const response = await this.recipeDb.getRegions(
      searchText,
      subRegion,
      continent
    );
    const result = response.map((item) => item.key);
    return result;
  }
  async getSubRegions(searchText, region, continent) {
    const response = await this.recipeDb.getSubRegions(
      searchText,
      region,
      continent
    );
    const result = response.map((item) => item.key);
    return result;
  }

  async getIngredients(searchText) {
    const response = await this.recipeDb.getIngredients(searchText);
    const result = response.map((item) => item.key);
    return result;
  }

  async getCategories(searchText) {
    const response = await this.recipeDb.getCategories(searchText);
    const result = response.map((item) => item.key);
    return result;
  }

  async getProcesses(searchText) {
    const response = await this.recipeDb.getProcesses(searchText);
    const result = response.map((item) => item.key);
    return result;
  }

  async getUtensils(searchText) {
    const response = await this.recipeDb.getUtensils(searchText);
    const result = response.map((item) => item.key);
    return result;
  }
}

module.exports = Recipe;
