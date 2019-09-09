import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, elementStrings, clearLoader, renderLoader } from './views/base';


/*
Global State of the App:
* - Search object
* - Current recipe object
* - Shopping List Object
* - Liked recipes
*/

const state = {};
window.state = state;

/*
*******************
* Search Controller
*******************
*/
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    // 2) New search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try{
        // 4) Search for recipes
        await state.search.getResults();

        // 5) Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
    }catch(e){
        console.log('Something went wrong with the search...');
        clearLoader();
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();;
        searchView.renderResults(state.search.result, goToPage);
    }
});


/*
*******************
* Recipe Controller
*******************
*/

const controlRecipe = async () => {
    //Get ID from url
    const id = window.location.hash.replace('#','');
    console.log(id);

    if(id){
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected recipe
        if(state.search) searchView.hightlightSelected(id);

        //Creating recipe object
        state.recipe = new Recipe(id);

        try{
            //Getting recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculating time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Rendering recipe to UI
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        }catch(e){
            console.log(e);
            alert('Error processing recipe!');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/*
*******************
* List Controller
*******************
*/

const controlList = () => {
    //Create a new list if there is none yet
    if(!state.list) state.list = new List();

    //Add each ingredient to list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};





// Handle delete and update list item events
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value,10);
        state.list.updateCount(id, val);
    }
});


/*
*******************
* Likes Controller
*******************
*/

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has NOT liked the current recipe
    if(!state.likes.isLiked(currentID)){
        //Adding like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.author,
            state.recipe.title,
            state.recipe.img
        );

        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to the UI list
        likesView.renderLike(newLike);

    }else{
        //Removing like from the state
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipes on page load
window.addEventListener('load',() => {
    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage();

    //Toggle likes menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

});



//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
        };

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        // Like Controller
        controlLike();
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
});


window.listItem = new List();


