'use strict';
output.eventlisteners=function()
{
};
output.fields=function(arr)
{
	logic.setKeys(arr);//move this elsewhere!!
	var original=$('header .col');
	arr.forEach(function(item)
	{
		var clone=original.clone(true);
		clone.find('.search').attr('placeholder',item).on('input',input.search);
		clone.find('.sort-toggle-button').val(item).attr('id',item).on('click',input.sort);
		clone.find('.sort-toggle-label').attr('for',item);
		original.before(clone);
	});
	$('.sort-toggle-button').first().attr('checked','checked');
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
	$('dl').append($('<dt>').addClass('row table__heading').html(char));
};
output.results=function(arr,sortedProp='Item')
{
	var props=logic.getKeys();
	var list=$('dl').html('');
	var heading=output.firstChar(arr[0][sortedProp]);
	output.heading(heading);
	arr.forEach(function(item)
	{
		var row=$('<dd>').addClass('row table__item');
		props.forEach(function(prop)
		{
			var val=item[prop]||'';
			var col=$('<span>').addClass('col').html(val);
			row.attr('data-'+logic.colName2dataAttr(prop),val.toLowerCase()).append(col);
		});
		var char=output.firstChar(item[sortedProp])
		if (heading!=char)
		{
			heading=char;
			output.heading(heading);
		}
		list.append(row);
	});
	logic.setDB(arr);
};