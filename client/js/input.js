'use strict';
input.search=function()
{
	var selectors=[];
	$('input.search').each(function()
	{
		var val=logic.normalize($(this).val());
		console.log(val);
		if (val!=='')
		{
			console.log(($(this).attr('placeholder')));
			var attr=logic.colName2dataAttr($(this).attr('placeholder'));
			console.log(attr);
			selectors.push('[data-'+attr+']:not([data-'+attr+'*='+val+'])');
		}
	});
	$('style.search').html(selectors.length?selectors.join(',')+'{display:none;}':'');
};
input.sort=function()//simplify to one line?!!
{
	var col=event.target.value;
	var sort=logic.sortBy(col);
	output.results(logic.getDB().sort(sort),col);
	//console.log(JSON.stringify(logic.getDB().map(obj=>obj[col]||'').sort()));
};