'use strict';
const fs=require('fs');
const os=require('os');
var state={};//don't expose state to other pages
state.db=[];
state.keys=[];
global.logic={};
logic.clone=obj=>JSON.parse(JSON.stringify(obj));
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
logic.match=function(query,entry)//simplify!!
{
	return entry?entry.toLowerCase().match(query.toLowerCase()):false;
};
logic.search=function(query)
{
	var props=Object.keys(query);//remove sort and focus!!
	return logic.clone(state.db).filter(item=>props.every(prop=>logic.match(query[prop],item[prop])));//add sort function here!!
};
logic.setDB=function(data)
{
	state.db=logic.csv2json(data);
};