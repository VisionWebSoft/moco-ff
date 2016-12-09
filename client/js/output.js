'use strict';
output.eventlisteners=function()
{
};
output.fields=function(arr)
{
	logic.setKeys(arr);//move this elsewhere!!
	var original=q('header .col');
	arr.forEach(function(item)
	{
		var clone=original.clone(true);
		clone.q('.search').attr('placeholder',item).on('input',input.search);
		clone.q('.sort-toggle-button').val(item).attr('id',item).on('click',input.sort);
		clone.q('.sort-toggle-label').attr('for',item);
		original.prev(clone);
	});
	q('.sort-toggle-button').index(0).attr('checked','checked');
	original.remove();
};
output.firstChar=function(prop)
{
	return (prop||'').charAt(0).toUpperCase();
};
output.init=function()
{
	var start=Date.now();
	mr.freeze(input,logic,output);
	fetch('data/inventory.csv')
	.then(res=>res.text())
	.then(function(csv)
	{
		var json=logic.setDB(logic.csv2json(csv));
		output.fields(logic.getKeys());
		output.results(json);
	});
	/*fetch('api/keywords').then(logic.res2json).then(output.fields);
	fetch('api/database').then(logic.res2json).then(output.results);*/
	output.eventlisteners();
	console.log('init time: '+(Date.now()-start));
};
output.heading=function(char)
{
	q('dl').last(q.create('dt').addClass('row').addClass('table__heading').html(char));
};
output.results=function(arr,sortedProp='Item')
{
	var props=logic.getKeys();
	var list=q('dl').html('');
	var heading=output.firstChar(arr[0][sortedProp]);
	output.heading(heading);
	arr.forEach(function(item)
	{
		var row=q.create('dd').addClass('row').addClass('table__item');
		props.forEach(function(prop)
		{
			var val=item[prop]||'';
			var col=q.create('span').addClass('col').html(val);
			row.last(col).data(logic.colName2dataAttr(prop),val.toLowerCase());
		});
		var char=output.firstChar(item[sortedProp])
		if (heading!=char)
		{
			heading=char;
			output.heading(heading);
		}
		list.last(row);
	});
	logic.setDB(arr);
};