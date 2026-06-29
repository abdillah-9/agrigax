const joi = require('joi');

module.exports.category_schema = joi.object(
    {
        name : joi.string().trim().max(50).required() ,
        slug : joi.string() // Iwrote this but its auto generated and hidden to users so I dont think if its worth it here.
    }
);

//is there a need to create anothe schema ie: this for create , this for upfdate??? coz both query processes use same input fields ( what changes in update is is passed id which is not users responsibility , they even do not know what is happening in the background ). BUT DO U SUGGEST??? 