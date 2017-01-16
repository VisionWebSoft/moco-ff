var mongoose=require('mongoose');
var schema={};
var collections={};
var contactSchema=new mongoose.Schema(
{
	name:
	{
		required:true,
		trim:true,
		type:String
	}
});
var departmentSchema=new mongoose.Schema(
{
	name:
	{
		required:true,
		trim:true,
		type:String
	}
});
var itemSchema=new mongoose.Schema(
{
	contact:
	{
		required:true,
		type:ObjectId
	},
	desc:
	{
		trim:true,
		type:String,
	},
	department:
	{
		required:true,
		type:ObjectId
	},
	item:
	{
		required:true;
		trim:true,
		type:String,
	},
	'on-hand':
	{
		trim:true,
		type:String,
	},
	unit:
	{
		required:true,
		type:ObjectId
	}
});
var unitSchema=new mongoose.Schema(
{
	name:
	{
		required:true,
		trim:true,
		type:String
	}
});
var userSchema=new mongoose.Schema(
{
	name:
	{
		required:true,
		trim:true,
		type:String
	},
	password://must encypt this!!
	{
		required:true,
		type:String
	}
});

schema.contact=mongoose.model('Contact',contactSchema);
schema.department=mongoose.model('Department',departmentSchema);
schema.item=mongoose.model('Item',itemSchema);
schema.unit=mongoose.model('Unit',unitSchema);
schema.user=mongoose.model('User',userSchema);
module.exports=schema;