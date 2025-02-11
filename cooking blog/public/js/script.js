let addIngredientsBtn = document.getElementById('addIngredientsBtn');
let ingredientList = document.querySelector('.ingredientList');
let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];

addIngredientsBtn.addEventListener('click', function(){
    let newingredients = ingredientDiv.cloneNode(true);
    let input = newingredients.getElementsByTagName('input')[0];
    input.value = '';
    ingredientList.appendChild(newingredients);
});