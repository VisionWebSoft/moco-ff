'use strict';
const bodyParser=require('body-parser');
const bcrypt=require('bcryptjs');
const compression=require('compression');
const express=require('express');
const fs=require('fs');
const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
const path=require('path');
//mongoose schemas
const schema=require('./schema.js')
logic.uniqueEntries=(arr,prop)=>arr.map(item=>logic.trim(item[prop]||'')).filter(logic.unique).filter(str=>str.length).sort();
logic.val2link=function(obj,prop)
{
	return new Promise(function(resolve,reject)
	{
		if (obj[prop])
		{
			var query={name:obj[prop]};
			schema[prop].findOne(query,function(err,match)
			{
				if (err)
				{
					console.log(err);
					reject(err);
				}
				else
				{
					obj[prop]=match._id;
					resolve(obj);
				}				
			});
		}
		else
		{
			resolve(obj);
		}
	});
};
global.output={};
output.cleanJSON=function(data)
{
	var {csv2json,renameProp,trim}=logic;
	return csv2json(data)
	.map(obj=>renameProp(obj,'Item','item'))
	.map(obj=>renameProp(obj,'Description/Type','desc'))
	.map(obj=>renameProp(obj,'Number On Hand','on-hand'))
	.map(obj=>renameProp(obj,'Fire Department','department'))
	.map(obj=>renameProp(obj,'Unit Number','unit'))
	.map(obj=>renameProp(obj,'Contact Person','contact'))
	.map(function(obj)
	{
		Object.keys(obj).forEach(prop=>obj[prop]=trim(obj[prop]));
		return obj;
	});
};
output.collection=function(arr,collection)
{
	return logic.asyncLoop(arr,function(name)
	{
		return new Promise(function(resolve,reject)
		{
			schema[collection].create({name},(err,obj)=>err?reject(err):resolve(obj));
		});
	});
};
output.connect=function()
{
	mongoose.connect('mongodb://localhost:27017/moco-ff');
	var db=mongoose.connection;
	db.on('error',output.error);	
/*	bcrypt.compare("1longPassPhrase!",hash).then(function(res)
	{
		console.log(res);//boolean
		console.log(Date.now()-start);
	}).catch(output.error);*/
	/*bcrypt.compare("B4c0/\/",hash).then(function(res)
	{
		console.log(res);//boolean
	}).catch(output.error);*/
};
output.error=function(err)
{
	if (err)
	{
		console.error(err);
	}
};
output.errorPage=function(req,res)
{
	//triggered by looking for favicon.ico
	res.status(400);
	res.send('No file found at: '+req.path);
};
output.json=function(url)
{
	return new Promise(function(resolve,reject)
	{
		fs.readFile(url+'/data/inventory.csv','utf8',(err,data)=>err?reject(err):resolve(data));
	});
};
output.init=function(url)
{
	mr.freeze(config,input,logic,output);
	output.json(url)
	.then(function(data)
	{
		logic.setDB(data);
		let ip=logic.getNetworkIP();
		console.log(ip);
		output.server(url,ip);
		output.connect();
	})
	.catch(output.error);
};
output.entry=(err,obj)=>err?output.error(err):console.log(obj);
output.newDatabase=function(url)
{
	mr.freeze(config,input,logic,output);
	mongoose.connect('mongodb://localhost:27017/moco-ff');
	var users=require('../data/users.json');
	var db=mongoose.connection;
	var {collection,cleanJSON}=output;
	db.on('error',output.error);
	output.json(url)
	.then(cleanJSON)
	.then(function(json)
	{
		var {asyncLoop,uniqueEntries,val2link}=logic;
		collection(uniqueEntries(json,'contact'),'contact')
		.then(()=>collection(uniqueEntries(json,'department'),'department'))
		.then(()=>collection(uniqueEntries(json,'unit'),'unit'))
		.then(function()
		{
			return asyncLoop(users,function(user)
			{
				return new Promise(function(resolve,reject)
				{
					var salt=bcrypt.genSaltSync(10);
					user.password=bcrypt.hashSync(user.password,salt);
					schema.user.create(user,(err,obj)=>err?reject(err):resolve(obj));
				});
			});
		})
		.then(function()
		{
			return asyncLoop(json,function(obj)
			{
				return new Promise(function(resolve,reject)
				{
					val2link(obj,'contact')
					.then(obj=>val2link(obj,'unit'))
					.then(obj=>val2link(obj,'department'))
					.then(obj=>schema.item.create(obj,function(err,obj)
					{
						console.log(obj);
						err?reject(err):resolve(obj);
					}));
				});
			});
		})
		.then(()=>console.log('done!'))
		.catch(()=>console.log('failed...'));
		setTimeout(console.log,1000*60);
	});
};
output.server=function(url,ip)
{
	var app=express();
	//middleware
	app.use(bodyParser.json({limit:'1mb'}));
	app.use(compression());
	app.use(function(req,res,next)//cors support for thumbnails
	{
		res.header('Access-Control-Allow-Origin','*');
		res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
	//static
	app.use('/', express.static(url+'/../client'));//static file hosting for apps
	app.use('/', express.static(url+'/../shared'));//send shared resources
	//api
	app.all('/api/:route/',input.router);
	//init
	app.use(output.errorPage);	
	app.listen(80,logic.getNetworkIP());
};