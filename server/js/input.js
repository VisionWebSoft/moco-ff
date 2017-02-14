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
	//res.json(logic.loggedIn(req.ip)?logic.getKeywords():{error:'Not logged in.'});
};
/*input.get.database=function(req,res)//remove?!!
{
	res.json(logic.loggedIn(req.ip)?logic.getDB():{error:'Not logged in.'});
};*/
input.post.search=function(req,res)
{
	res.json(logic.loggedIn(req.ip)?logic.search(req.body):{"error":"Not logged in."});
};
input.post.login=function(req,res)
{
	var {user,password}=req.body;
	output.auth(user,password)
	.then(function(auth)
	{
		logic.login(req.ip);
		res.json({auth});
	})
	.catch(error=>res.json({auth:false,error}));
};