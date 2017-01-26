'use strict';
const bodyParser=require('body-parser');
const bcrypt=require('bcryptjs');
const compression=require('compression');
const express=require('express');
const fs=require('fs');
const mongoose=require('mongoose');
const path=require('path');
//mongoose schemas
const schema=require('./schema.js')
logic.uniqueEntries=(arr,prop)=>arr.map(item=>logic.trim(item[prop]||'')).filter(logic.unique).filter(str=>str.length).sort();
logic.val2link=function(obj,prop,collection)
{
	return new Promise(function(resolve,reject)
	{
		if (obj[prop])
		{
			var query={name:obj[prop]};
			console.log(query);
			schema[collection].findOne(query,function(err,match)
			{
				if (err)
				{
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
output.entry=(err,obj)=>err?output.error(err):console.log(obj.name);
output.newDatabase=function(url)
{
	mr.freeze(config,input,logic,output);
	var users=require('../data/users.json');
	//output.json(url);	
	fs.readFile(url+'/data/inventory.csv','utf8',function(err,data)
	{
		if (err)
		{
			output.error(err);
		}
		else
		{
			logic.setDB(data);
			mongoose.connect('mongodb://localhost:27017/moco-ff');
			var db=mongoose.connection;
			db.on('error',output.error);
			var json=logic.getDB();
			var contacts=logic.uniqueEntries(json,'Contact Person');
			var depts=logic.uniqueEntries(json,'Fire Department');//fix redundant data!!
			var units=logic.uniqueEntries(json,'Unit Number');	
			//create collections
			logic.asyncLoop(contacts,function(name)
			{
				return new Promise(function(resolve,reject)
				{
					schema.contact.create({name},(err,obj)=>err?reject(err):resolve(obj));
				});
			})
			.then(function()
			{
				return logic.asyncLoop(depts,function(name)
				{
					return new Promise(function(resolve,reject)
					{
						schema.department.create({name},(err,obj)=>err?reject(err):resolve(obj));
					});
				});
			})
			.then(function()
			{
				return logic.asyncLoop(units,function(name)
				{
					return new Promise(function(resolve,reject)
					{
						schema.unit.create({name},(err,obj)=>err?reject(err):resolve(obj));
					});
				});
			})
			.then(function()
			{
				var salt=bcrypt.genSaltSync(10);
				return logic.asyncLoop(users,function(user)
				{
					return new Promise(function(resolve,reject)
					{
						var hash=bcrypt.hashSync(user.password,salt);
						user.password=hash;
						console.log(user);
						schema.user.create(user,function(err,obj)
						{
							
							if (err)
							{
								console.error(err);
								reject(err);
							}
							else
							{
								resolve(obj);
							}
						});
					});
				});
			})
			.then(function()
			{
				return new Promise(function(resolve,reject)
				{
					//logic.json2mongo(logic.getDB());
					resolve();
				});
			})
			.then(()=>console.log('done!'))
			.catch(()=>console.log('failed...'));
			//create users
			setTimeout(console.log,1000*60);
		}
	});
};
logic.json2mongo=function(arr)
{
	if (arr.length)
	{
		var obj=arr.pop();
		Object.keys(obj).forEach(function(prop)
		{
			obj[prop]=logic.trim(obj[prop]);
		});
		logic.val2link(obj,'Contact Person','contact')
		.then(obj=>logic.val2link(obj,'Unit Number','unit'))
		.then(obj=>logic.val2link(obj,'Fire Department','department'))
		.then(obj=>schema.item.create(obj,(err,obj)=>err?output.error(err):console.log(obj.name)))
		.then(()=>logic.json2mongo(arr))
		.catch(output.error);
	}
	else
	{
		console.log('done!');
	}
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
output.zip=function(path,json)
{
	return new Promise(function(resolve,reject)
	{
		let zip=new Zip();
		let opts=
		{
			compression:'DEFLATE',
			type:'nodebuffer',
			streamFiles:true
		};
		zip.file('database.json',JSON.stringify(json));
		zip.generateNodeStream(opts).pipe(fs.createWriteStream(path)).on('finish',function(error)
		{
			(error?reject:resolve)();
		});
	});
};