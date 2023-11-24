const express = require('express');
const { catchErrors } = require('../utils/custom-helpers');
const Router = express.Router({ caseSensitive: true });

const Recipe = require('../controller/recipeController');
const recipe = new Recipe();

Router.get(
  '/',
  catchErrors(async (req, res) => {
    let { page,pageSize } = req.query;
    const result = await recipe.getAllRecipes(Number(page) || 0, Number(pageSize) || 20);
    const response = {
      success: 'true',
      message: 'Recipes fetched successfully.',
      payload: result
    };
    res.status(200).send(response);
  }) 
);

Router.get(
  '/recipeOftheDay',
  catchErrors(async (req, res) => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diffInMilliseconds = today - startOfYear;
    const dayOfYear = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const result = await recipe.getRecipeofTheDay(dayOfYear);
    const response = {
      success: 'true',
      message: 'Recipes fetched successfully.',
      payload: result
    };
    res.status(200).send(response);
  }) 
);

Router.get(
  '/:id',
  catchErrors(async (req, res) => {
    let { id } = req.params;
    const result = await recipe.getRecipeById(id);
    const response = {
      success: 'true',
      message: 'Recipes fetched successfully.',
      payload: result
    };
    res.status(200).send(response);
  }) 
);




module.exports = Router;
