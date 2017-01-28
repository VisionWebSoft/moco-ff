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
logic.json2mongo=function(arr)//rewrite using async loop
{
	if (arr.length)
	{
		var obj=arr.pop();
		Object.keys(obj).forEach(function(prop)
		{
			obj[prop]=logic.trim(obj[prop]);
		});		
		logic.val2link(obj,'contact')
		.then(obj=>logic.val2link(obj,'department'))
		.then(obj=>logic.val2link(obj,'unit'))
		.then(obj=>schema.item.create(obj,(err,obj)=>err?output.error(err):console.log(obj.name)))
		.then(()=>logic.json2mongo(arr))
		.catch(output.error);
	}
	else
	{
		console.log('done!');
	}
};
output.newDatabase=function(url)
{
	mr.freeze(config,input,logic,output);
	var users=require('../data/users.json');
	output.json(url)
	.then(function(data)
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
		output.collection(contacts,'contact')
		.then(()=>output.collection(depts,'department'))
		.then(()=>output.collection(units,'unit'))
		.then(function()
		{
			var salt=bcrypt.genSaltSync(10);
			return logic.asyncLoop(users,function(user)
			{
				return new Promise(function(resolve,reject)
				{
					user.password=bcrypt.hashSync(user.password,salt);
					schema.user.create(user,(err,obj)=>err?reject(err):resolve(obj));
				});
			});
		})
		.then(function()
		{
			var {renameProp,trim,val2link}=logic;
			return logic.asyncLoop(json,function(obj)
			{
				Object.keys(obj).forEach(prop=>obj[prop]=trim(obj[prop]));
				obj=renameProp(obj,'Item','item');
				obj=renameProp(obj,'Description/Type','desc');
				obj=renameProp(obj,'Number On Hand','on-hand');
				obj=renameProp(obj,'Fire Department','department');
				obj=renameProp(obj,'Unit Number','unit');
				obj=renameProp(obj,'Contact Person','contact');
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
		//create users
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