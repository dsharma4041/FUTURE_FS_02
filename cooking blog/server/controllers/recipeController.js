require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');


/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {

  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);
    
    const food = { latest, thai, american, chinese };

    res.render('index', { title: 'Cooking Blog - Home', categories, food } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}


/**
 * GET /categories
 * Categories
 */
exports.exploreCategories = async (req, res) => {

  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - categories', categories } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}


/**
 * GET /categories/:id
 * Categories By Id
 */
exports.exploreCategoriesById = async (req, res) => {
    try {
        let categoryId = req.params.id;
        const limitNumber = 20;
        const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
        res.render('categories', { title: 'Cooking Blog - Categories', categoryById });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }
}


/**
 * GET /recipe/:id
 * Recipe
 */
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Cooking Blog - recipe', recipe } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}


/**
 * POST /search
 * Search
 */
exports.searchRecipe = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
        res.render('search', { title: 'Cooking Blog - Search', recipe } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
}
// exports.searchRecipe = async (req, res) => {
//     try {
//         let searchTerm = req.body.searchTerm;
//         let recipe = await Recipe.find({ 
//             $text: { $search: searchTerm, $diacriticSensitive: true } 
//         });

//         return res.render('search', { title: 'Cooking Blog - Search', recipes: recipe }); // ✅ Renders with data
//     } catch (error) {
//         return res.status(500).send({ message: error.message || "Error Occurred" });
//     }
// };


/**
 * GET /explore-latest
 * Explore latest
 */
exports.exploreLatest = async (req, res) => {
    try {
      const limitNumber = 5;
      const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
      res.render('explore-latest', { title: 'Cooking Blog - Explore-Latest', recipe } );
    } catch (error) {
      res.status(500).send({message: error.message || "Error Occured" });
    }
  }


/**
 * GET /explore-random
 * Explore Random
 */
exports.exploreRandom = async (req, res) => {
    try {
        let recipes = await Recipe.aggregate([{ $sample: { size: 1 } }]); // ✅ Fast random selection

        return res.render('explore-random', { 
            title: 'Cooking Blog - Explore Random', 
            recipes: recipes 
        });
    } catch (error) {
        return res.status(500).send({ message: error.message || "Error Occurred" });
    }
};





/**
 * GET /submit-recipe
 * Submit Recipe
 */
exports.submitRecipe = async (req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitsObj = req.flash('infoSubmit');
  return res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitsObj });
}



/**
 * POST /submit-recipe
 * Submit Recipe
 */
exports.submitRecipeOnPost = async (req, res) => {

  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No Files were uploaded.');
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
  
      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
  
      imageUploadFile.mv(uploadPath, function(err) {
          if (err) return res.status(500).send(err);
      });
    }
  
    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName
    });

    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
  } catch (error) {
    req.flash('infoErrors', error)
    res.redirect('/submit-recipe');
  }
}












// async function insertDummyCategoryData() {
//   try {
//       const count = await category.countDocuments();
//       if (count === 0) {
//           await category.insertMany([
//               { "name": "Thai", "image": "thai-food.jpg" },
//               { "name": "American", "image": "american-food.jpg" },
//               { "name": "Chinese", "image": "chinese-food.jpg" },
//               { "name": "Mexican", "image": "mexican-food.jpg" },
//               { "name": "Indian", "image": "indian-food.jpg" },
//               { "name": "Spanish", "image": "spanish-food.jpg" }
//           ]);
//           console.log("Dummy categories inserted");
//       } else {
//           console.log("Categories already exist");
//       }
//   } catch (error) {
//       console.log("Error inserting dummy data:", error);
//   }
// }

// // Ensure dummy data runs only once
// insertDummyCategoryData();




// async function insertDummyRecipeData() {
//   try {
//       const count = await Recipe.countDocuments();
//       if (count === 0) {
//           await Recipe.insertMany([
//               {
//                   "name": "Crab cakes",
//                   "description": "Preheat the oven to 175ºC/gas 3. Lightly grease a 22cm metal or glass pie dish with a little of the butter...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "4 large free-range egg yolks",
//                       "400 ml condensed milk",
//                       "5 limes",
//                       "200 ml double cream"
//                   ],
//                   "category": "American",
//                   "image": "crab-cakes.jpg"
//               },
//               {
//                   "name": "Thai-style mussels",
//                   "description": "Wash the mussels thoroughly, discarding any that aren’t tightly closed...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "1 kg mussels , debearded, from sustainable sources",
//                       "groundnut oil",
//                       "4 spring onions",
//                       "2 cloves of garlic",
//                       "½ a bunch of fresh coriander"
//                   ],
//                   "category": "Thai",
//                   "image": "thai-style-mussels.jpg"
//               },
//               {
//                   "name": "Thai-Chinese-inspired pinch salad",
//                   "description": "Peel and very finely chop the ginger and deseed and finely slice the chilli...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "5 cm piece of ginger",
//                       "1 fresh red chilli",
//                       "25 g sesame seeds",
//                       "24 raw peeled king prawns",
//                       "1 pinch Chinese five-spice powder"
//                   ],
//                   "category": "Chinese",
//                   "image": "thai-chinese-inspired-pinch-salad.jpg"
//               },
//               {
//                   "name": "Southern fried chicken",
//                   "description": "To make the brine, toast the peppercorns in a large pan on a high heat for 1 minute...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "4 free-range chicken thighs , skin on, bone in",
//                       "4 free-range chicken drumsticks",
//                       "200 ml buttermilk",
//                       "4 sweet potatoes",
//                       "200 g plain flour"
//                   ],
//                   "category": "American",
//                   "image": "southern-fried-chicken.jpg"
//               },
//               {
//                   "name": "Chocolate & banoffee whoopie pies",
//                   "description": "Preheat the oven to 170ºC/325ºF/gas 3 and line 2 baking sheets with greaseproof paper...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "3 spring onions",
//                       "½ a bunch of fresh flat-leaf parsley",
//                       "1 large free-range egg",
//                       "750 g cooked crabmeat",
//                       "300 g mashed potatoes"
//                   ],
//                   "category": "American",
//                   "image": "chocolate-banoffe-whoopie-pies.jpg"
//               },
//               {
//                   "name": "Veggie pad Thai",
//                   "description": "Cook the noodles according to the packet instructions, then drain and refresh under cold running water...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "150 g rice noodles",
//                       "sesame oil",
//                       "2 cloves of garlic",
//                       "80 g silken tofu",
//                       "low-salt soy sauce"
//                   ],
//                   "category": "Thai",
//                   "image": "veggie-pad-thai.jpg"
//               },
//               {
//                   "name": "Chinese steak & tofu stew",
//                   "description": "Get your prep done first, for smooth cooking. Chop the steak into 1cm chunks...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "250g rump or sirloin steak",
//                       "2 cloves of garlic",
//                       "4cm piece of ginger",
//                       "2 fresh red chilli",
//                       "1 bunch of spring onions"
//                   ],
//                   "category": "Chinese",
//                   "image": "chinese-steak-tofu-stew.jpg"
//               },
//               {
//                   "name": "Spring rolls",
//                   "description": "Put your mushrooms in a medium-sized bowl, cover with hot water and leave for 10 minutes...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "40 g dried Asian mushrooms",
//                       "50 g vermicelli noodles",
//                       "200 g Chinese cabbage",
//                       "1 carrot",
//                       "3 spring onions"
//                   ],
//                   "category": "Chinese",
//                   "image": "spring-rolls.jpg"
//               },
//               {
//                   "name": "Tom Daley's sweet & sour chicken",
//                   "description": "Drain the juices from the tinned fruit into a bowl, add the soy and fish sauces...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "1 x 227 g tin of pineapple in natural juice",
//                       "1 x 213 g tin of peaches in natural juice",
//                       "1 tablespoon low-salt soy sauce",
//                       "1 tablespoon fish sauce",
//                       "2 teaspoons cornflour"
//                   ],
//                   "category": "Chinese",
//                   "image": "tom-daley.jpg"
//               },
//               {
//                   "name": "Key lime pie",
//                   "description": "Preheat the oven to 175ºC/gas 3. Lightly grease a 22cm metal or glass pie dish with a little of the butter...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "4 large free-range egg yolks",
//                       "400 ml condensed milk",
//                       "5 limes",
//                       "200 ml double cream"
//                   ],
//                   "category": "American",
//                   "image": "key-lime-pie.jpg"
//               },
//               {
//                   "name": "Stir-fried vegetables",
//                   "description": "Crush the garlic and finely slice the chilli and spring onion...",
//                   "email": "hello@email.com",
//                   "ingredients": [
//                       "1 clove of garlic",
//                       "1 fresh red chilli",
//                       "3 spring onions",
//                       "1 small red onion",
//                       "1 handful of mangetout"
//                   ],
//                   "category": "Chinese",
//                   "image": "stir-fried-vegetables.jpg"
//               }
//           ]);
//           console.log("Dummy categories inserted");
//       } else {
//           console.log("Categories already exist");
//       }
//   } catch (error) {
//       console.log("Error inserting dummy data:", error);
//   }
// }

// // Ensure dummy data runs only once
// insertDummyRecipeData();
