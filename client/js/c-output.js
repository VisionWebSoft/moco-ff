'use strict';
output.eventlisteners=function()
{
	q('.close').on('click',input.close);
	q('.open-modal').on('click',input.openModal);
};
output.fields=function(arr)
{
	logic.setKeys(arr);//move this elsewhere!!
	var original=q('header .col');
	arr.forEach(function(item)
	{
		var clone=original.clone(true);
		clone.q('.search').attr('placeholder',item).data('query',item).on('input',input.search);
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
	mr.freeze(input,logic,output);
	fetch('api/keywords/')
	.then(res=>res.json())
	.then(output.fields);
	output.eventlisteners();
};
output.heading=function(char)
{
	q('dl').last(q.create('dt').addClass('row').addClass('table__heading').html(char));
};
output.query=function()
{
	var obj={};
	q('input.search').each(function()
	{
		var val=this.norm().value;
		if (!(val===''))
		{
			obj[this.data('query')+'']=val;
		}
	});
	return obj;
};
output.results=function(arr,sortedProp='Item')
{
	var props=logic.getKeys();
	var list=q('dl').html('');
	if (arr.length)
	{
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
	}
};