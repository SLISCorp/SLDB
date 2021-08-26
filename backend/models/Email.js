var mongoose = require('mongoose');
var Schema = mongoose.Schema;
slug = require('mongoose-slug-generator');

var Email = new Schema({
    slug   : {type: String,  slug: ["title"]},
    title  : {type: String, required: true},
    subject    : {type: String, required: true},
    body    : {type: String, required: true},    
	},
	{
 		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at'},
 		versionKey: false
	}
);

mongoose.plugin(slug);

module.exports = mongoose.model('Email', Email,'email_templates');