import {elements} from './base.js';

//function will return value of input and save it in getInput.
export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const hightlightSelected = id => {
    // const resArr = Array.from(document.querySelectorAll('.results__link'));
    // resArr.forEach(el => {
    //     el.classList.remove('results__link--active');
    // });

    // document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');

};

export const limitRecipeTitle = (title, limit = 17) => {
    if(title.length > 17){
        const newTitle = title.substr(0,limit);

        return `${newTitle}...`;
    }
    return title;

};


const renderRecipes = recipe => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend',markup);
};

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto = ${type === 'prev'? page - 1 : page + 1}>
        <span>Page ${type === 'prev'? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev'? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button;

    if(page === 1 && pages > 1){
        button = createButton(page, 'next');
    }else if(page < pages){
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    }else if(page === pages && pages > 1){
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipes);
    renderButtons(page, recipes.length, resPerPage);
};