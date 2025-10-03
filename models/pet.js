"use strict";

const mongoose = require('mongoose'),
        Schema = mongoose.Schema;

const mongoosePaginate = require('mongoose-paginate');

mongoosePaginate.paginate.options = {
  limit: 3 // how many records on each page
};

const PetSchema = new Schema({
    name            : { 
      type: String, 
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters long']
    }
  , species         : { 
      type: String,
      required: [true, 'Species is required']
    }
  , birthday        : { type: Date }
  , picUrl          : { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Picture URL must be a valid image URL (jpg, jpeg, png, gif, webp)'
      }
    }
  , picUrlSq        : { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Square picture URL must be a valid image URL (jpg, jpeg, png, gif, webp)'
      }
    }
  , avatarUrl       : { type: String }
  , favoriteFood    : { type: String }
  , description     : { type: String }
  , price           : { 
      type: Number, 
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 999999;
        },
        message: 'Price must be between 0 and 999,999'
      }
    }
},
{
  timestamps: true
});

PetSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Pet', PetSchema);
