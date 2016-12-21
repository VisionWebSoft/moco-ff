'use strict';
input.close=function(event)
{
	q(event.target).parent('.modal').hide();
};
input.search=function()
{
	var obj={data:output.query()};
	output.req('api/search/',obj)
	.then(output.results);
};
input.sort=function()//simplify to one line?!!
{
	var col=event.target.value;
	var sort=logic.sortBy(col);
	output.results(logic.getDB().sort(sort),col);
};