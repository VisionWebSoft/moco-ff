'use strict';
input.search=function()
{
	var selectors=[];
	q('input.search').each(function()
	{
		var val=logic.normalize(this.val());
		if (val!=='')
		{
			var attr=logic.colName2dataAttr(this.attr('placeholder'));
			selectors.push('[data-'+attr+']:not([data-'+attr+'*='+val+'])');
		}
	});
	q('style.search').html(selectors.length?selectors.join(',')+'{display:none;}':'');
};
input.sort=function()//simplify to one line?!!
{
	var col=event.target.value;
	var sort=logic.sortBy(col);
	output.results(logic.getDB().sort(sort),col);
};