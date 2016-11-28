'use strict';
const Ajv=require('ajv');
global.input={};
input.invalid=function(req,res,error)
{
	res.json({});
};
input.router=function(req,res)
{
	//determine if endpoint exists
	var route=req.params.route;
	var method=req.method.toLowerCase();
	var type=input[method];
	var func=type?type[route]:undefined;
	//validate json
	if (method=='post'&&func)
	{
		let ajv=new Ajv();
		let data=req.body;
		let schema=config.schema[route];
		let valid=ajv.validate(schema,data);
		if (!valid)
		{
			console.log('invalid schema');
			console.log(Object.keys(data));
			return input.invalid(req,res,JSON.stringify(ajv.errors));
		}
	}
	(func||input.invalid)(req,res);
};
input.get={};
input.post={};
input.get.keywords=function(req,res)
{
	res.json(logic.getKeywords());
};
input.get.database=function(req,res)
{
	res.json(logic.getDB());
};
input.post.query=function(req,res)
{
	res.json(logic.search(req.body));
};