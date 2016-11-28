'use strict';
logic.csv2json=function(csv)
{
	var arr=csv.split(/\r?\n/);
	var props=logic.setKeys(arr.shift().split(/\t/));//this is here for performance
	return arr.map(function(entry)
	{
		var obj={};
		entry.split(/\t/).forEach(function(val,index)
		{
			if (val!==undefined)//allows values of 0
			{
				obj[props[index]]=val;
			}
		});
		return obj;
	});
};
logic.clone=function(obj)
{
	return JSON.parse(JSON.stringify(obj));
};
logic.colName2dataAttr=function(str)
{
	return str.replace(/[ \/]/g,'-');
};
logic.normalize=function(prop)
{
	return (prop||'').toLowerCase();
};
logic.sortBy=function(prop)
{
	return function(a,b)
	{
		var textA=logic.normalize(a[prop]);
		var textB=logic.normalize(b[prop]);
		return (textA<textB)?-1:(textA>textB)?1:0;
	};
};