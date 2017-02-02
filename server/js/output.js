'use strict';
const bodyParser=require('body-parser');
const bcrypt=require('bcryptjs');
const compression=require('compression');
const express=require('express');
const session=require('express-session');
const fs=require('fs');
const mongoose=require('mongoose');
const MongoDBStore=require('connect-mongodb-session')(session);
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
output.auth=function(name,password)
{
	return new Promise(function(resolve,reject)
	{
		output.mongoQuery('user')
		.then(users=>users.find(user=>user.name===name))
		.then(user=>user?user.password:undefined)
		.then(function(hash)
		{
			if (hash)
			{
				bcrypt.compare(password,hash)//wrong username not tirggering...!!
				.then((bool)=>bool?resolve(bool):reject('Wrong user name or password.')).catch(reject);
			}
			else
			{
				reject('Invalid user name.');
			}
		});
	});
};
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
logic.mongo2json=function(contacts,depts,items,units)
{
	contacts=logic.collection2obj(contacts);//this block changes the object type, bad for perf!!
	depts=logic.collection2obj(depts);
	units=logic.collection2obj(units);
	return items.map(function(item,i,arr,contact=item.contact,dept=item.department,unit=item.unit)
	{
		contact?item.contact=contacts[contact]:'';
		dept?item.department=depts[dept]:'';
		unit?item.unit=units[unit]:'';
		delete item.__v;
		delete item._id;
		return item;
	});
};
logic.collection2obj=function(arr)//this type of structure is more efficient and should be used in the database?!!
{
	var obj={};
	arr.forEach(item=>obj[item._id]=item.name);
	return obj;
};
output.mongoQuery=function(collection)
{
	return new Promise(function(resolve,reject)
	{
		schema[collection].find().lean().exec((err,arr)=>err?reject(err):resolve(arr));
	});
};
output.connect=function()
{
	mongoose.connect('mongodb://localhost:27017/moco-ff');
	var db=mongoose.connection;
	var {error,mongoQuery}=output;
	db.on('error',output.error);
	db.once('open',function()
	{
		console.log('connected');
		var collections=['contact','department','item','unit'];
		var contacts=[];
		var depts=[];
		var items=[];
		var units=[];
		var inProgress=4;//number of groups
		var done=function()
		{
			inProgress-=1;
			if (!inProgress)
			{
				let arr=logic.mongo2json(contacts,depts,items,units);
				let keys={};
				arr.forEach(obj=>Object.keys(obj).forEach(key=>keys[key]=true));
				logic.setKeys(Object.keys(keys));
				logic.setDB(arr);
				console.log(arr.length);
			}
		};
		mongoQuery('contact').then(arr=>contacts=arr).then(done).catch(error);
		mongoQuery('department').then(arr=>depts=arr).then(done).catch(error);
		mongoQuery('item').then(arr=>items=arr).then(done).catch(error);
		mongoQuery('unit').then(arr=>units=arr).then(done).catch(error);
	});
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
	var ip=logic.getNetworkIP();
	mr.freeze(config,input,logic,output);
	console.log(ip);
	output.server(url,ip);
	output.connect();
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
	});
};
output.server=function(url,ip)
{
	var app=express();
	var store=new MongoDBStore(
	{
		uri:'mongodb://localhost:27017/moco-ff-sessions',
		collection:'session'
	});
	store.on('error',function(error)//edit this?!!
	{
		console.log(error);
	});
	//middleware
	app.use(session)(//new code
	{
		secret:require('../data/secret.json').secret,
		cookie:
		{
			maxAge:1000*60*60*12//12hrs 
		},
		store:store,
		resave:true
	});
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