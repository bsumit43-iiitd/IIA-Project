const RecipeDb = require("../db/recipe");
const nullImagesId = [];
class Recipe {
  constructor() {
    this.recipeDb = new RecipeDb();
  }
  async getAllRecipes(page, pageSize) {
    const result = await this.recipeDb.getAllRecipes(page, pageSize);
    return result;
  }

  async getRecipeofTheDay(dayOfYear) {
    const skip =
      dayOfYear + nullImagesId.filter((item) => item <= dayOfYear).length;
    const result = await this.recipeDb.getRecipeofTheDay(skip);
    if (
      result?.img_url ==
        "https://geniuskitchen.sndimg.com/gk/img/gk-shareGraphic.png" ||
      result?.img_url == "https://images.media-allrecipes.com/images/79591.png"
    ) {
      nullImagesId.push(skip);
      this.getRecipeofTheDay(dayOfYear+1);
    }
    return result;
  }

  async getRecipeById(id) {
    const [recipeDetails, ingredients, instructions, nutritions] =
      await Promise.all([
        this.recipeDb.getRecipeDetailsById(id),
        this.recipeDb.getRecipeIngredients(id),
        this.recipeDb.getRecipeInstructions(id),
        this.recipeDb.getRecipeNutritionsById(id),
      ]);
    let instructionList = instructions
      ?.split(/[.;]/)
      ?.filter((item) => {
        if (item) return item;
      })
      .map(
        (ins) =>
          ins
            .trim()
            .replace(/ ?, ?/g, ", ")
            .replace(/(^\w|(?<=\. )\w)/g, (match) => match.toUpperCase()) + "."
      );
    return {
      ...recipeDetails,
      ingredients: ingredients,
      instructions: instructionList,
      nutritions: nutritions,
    };
  }
}

module.exports = Recipe;
