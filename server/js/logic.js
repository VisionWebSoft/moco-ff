'use strict';
const fs=require('fs');
const os=require('os');
var state={};//don't expose state to other pages
state.db=[];
state.keys=[];
state.sessions={};
global.logic={};
logic.asyncLoop=function(arr,func)
{
	return new Promise(function(resolve,reject)
	{
		var loop=function(arr)
		{
			arr.length?func(arr.pop()).then(()=>loop(arr)).catch(reject):resolve();
		};
		loop(arr);
	});
};
logic.clone=obj=>JSON.parse(JSON.stringify(obj));
logic.createSession=function(length=16)
{
	var arr=[];
	for (let c=0,l=length;c<l;c++)
	{
		let buf=new Uint8Array(1);
		crypto.getRandomValues(buf);
		arr.push(buf[0]);
	}
	return arr.join('');
};
logic.csv2json=function(csv)//merge with setDB!!
{
	var arr=csv.split(/\r?\n/);
	var props=arr.shift().split(/\t/);
	state.keys=props;//statement is here for performance!!
	return arr.map(function(entry)
	{
		var obj={};
		entry.split(/\t/).forEach(function(val,index)
		{
			if (val)
			{
				obj[props[index]]=val;
			}
		});
		return obj;
	});
};
logic.getKeywords=()=>state.keys;
logic.getDB=()=>state.db;
logic.getNetworkIP=function()//if there are multiple IPs, this returns the first IP
{
	var addresses=[];
	var interfaces=os.networkInterfaces();
	for (let k in interfaces)
	{
		for (let k2 in interfaces[k])
		{
			let address=interfaces[k][k2];
			if (address.family==='IPv4'&&!address.internal)
			{
				addresses.push(address.address);
			}
		}
	}
	return addresses[0];
};
logic.login=ip=>state.sessions[ip]=Date.now();
logic.loggedIn=function(ip)
{
	var sessions=state.sessions;
	var now=Date.now();
	Object.keys(sessions).forEach(function(session)
	{
		if (sessions[session]>=now)
		{
			delete sessions[session];
		}
	});
	return !!sessions[ip];//convert time to bool
};
logic.match=function(query,entry)//simplify!!!
{
	return entry?entry.toLowerCase().match(query.toLowerCase()):false;
};
logic.renameProp=function(obj,from,to)
{
	if (obj[from])
	{
		obj[to]=obj[from];
		delete obj[from];
	}
	return obj;
};
logic.search=function(query)
{
	var props=Object.keys(query);//remove sort and focus!!
	return logic.clone(state.db).filter(item=>props.every(prop=>logic.match(query[prop],item[prop]))).reverse();//add sort function here!!
};
logic.setDB=data=>state.db=data;
logic.setKeys=keys=>state.keys=keys;
logic.trim=(str)=>str.trim().replace(/\s+/,' ');
logic.unique=(val,i,arr)=>arr.indexOf(val)===i;