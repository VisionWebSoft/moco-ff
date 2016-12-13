'use strict';
//var state=output.req('/json/state.json',{data:'optionalParam',type:'defaults2json'});
output.req=function(url,opts={})//this is only capable of posting JSON//spinoff into own file and replace output.request
{
	var data=opts.data;
	return fetch(data?new Request(url,
	{
		method:'post',
		json:true,
		headers:new Headers(
		{
			'Content-Type':'application/json'
		}),
		body:JSON.stringify(data)
	}):url).then(res=>(res[opts.type||'json'])());
};