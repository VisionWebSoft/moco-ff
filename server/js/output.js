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

global.output={};
output.connect=function()
{
	mongoose.connect('mongodb://localhost:27017/moco-ff');
	var db=mongoose.connection;
	db.on('error',output.error);
	var json=logic.getDB();
	var contacts=logic.uniqueEntries(json,'Contact Person');
	var depts=logic.uniqueEntries(json,'Fire Department');//fix redundant data!!
	var units=logic.uniqueEntries(json,'Unit Number');
	
	//schema.contact();
	//clear database
	//create "tables"
	//fill database
	
	//this will generate the contacts collections fine!!
	contacts.map(name=>({name})).forEach(function(obj)
	{
		schema.contact.create(obj,(err,obj)=>err?output.error(err):console.log(obj.name));
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
output.init=function(url)
{
	mr.freeze(config,input,logic,output);
	fs.readFile(url+'/data/inventory.csv','utf8',function(err,data)
	{
		if (err)
		{
			output.error(err);
		}
		else
		{
			logic.setDB(data);
			let ip=logic.getNetworkIP();
			console.log(ip);
			output.server(url,ip);
			output.connect();
		}
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
	app.listen(80,logic.getNetworkIP());//app.listen(8080,logic.getNetworkIP());
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