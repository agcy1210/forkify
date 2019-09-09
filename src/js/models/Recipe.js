import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try {
            const res = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.img = res.data.recipe.image_url;
            this.author = res.data.recipe.publisher;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch(error) {
            console.log(error);
        }
    }

    calcTime(){
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
    //ingredients = ["1-1/3 cup Shortening (may Substitute Butter)","1-1/2 cup Sugar","1 teaspoon Orange Zest","1 teaspoon Vanilla"]
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces,', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz','oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            //el = 1-1/3 cup Shortening (may Substitute Butter)
            let ingredient = el.toLowerCase();

            unitsLong.forEach((unit, i) => {
                //ingredient = 1-1/3 cup shortening (may substitute butter)
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2)Remove parentheses
            //ingredient = 1-1/3 cup shortening (may substitute butter)
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3)Parse ingredients in count, unit and ingredients
            //ingredient = 1-1/3 cup shortening
            const arrIng = ingredient.split(' ');

            //arrIng = ['1-1/3','cup','shortening']
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            //unitIndex = 1
            if(unitIndex > -1){
                //There is a unit
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                //arrCount = ['1-1/3']
                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-','+'));
                    //count = 1.33333
                }else{
                    count = eval(arrIng.slice(0,unitIndex).join('+'));
                }

                objIng = {
                    //unitIndex = 1
                    count: count.toFixed(1),   //1.3333
                    unit: arrIng[unitIndex],    //'cup'
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')   //'shortening'
                }

            }else if(parseInt(arrIng[0],10)){
                //There is NO unit but a 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0],10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            }else if(unitIndex === -1){
                //There is NO unit and 1st element isn't a number
                objIng = {
                    count : 1,
                    unit : '',
                    ingredient: ingredient
                }

            }

            return objIng;
        });

        this.ingredients = newIngredients;

    }

    updateServings (type){
        // Servings
        const newServings = type === 'dec'? this.servings - 1 : this.servings + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count = ing.count * (newServings / this.servings);
        });

        this.servings = newServings;
    }
}
