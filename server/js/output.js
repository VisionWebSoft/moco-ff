'use strict';
const bodyParser=require('body-parser');
const compression=require('compression');
const express=require('express');
const fs=require('fs');
//const mongoose=require('mongoose');
const path=require('path');

global.output={};
/*output.connect=function()
{
	mongoose.connect('mongodb://localhost:27017/moco-ff');
	var db=mongoose=connection;
	db.on('error',output.error);
};*/
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
			console.log(ip+':8080');
			output.server(url,ip);
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
	app.listen(8080,logic.getNetworkIP());//app.listen(8080,logic.getNetworkIP());
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