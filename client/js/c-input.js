'use strict';
input.close=function(event)
{
	q(event.target).parent('.banner,.modal').hide();
};
input.login=function(event)
{
	event.preventDefault();
	var target=q(event.target);
	var form=target.parent('form');
	var obj=
	{
		data:
		{
			password:form.q('.password').val()+'',
			user:form.q('.user').val()+''
		}
	};
	output.req('api/login/',obj).then(console.log);
};
input.openModal=function(event)
{
	var btn=q(event.target);
	q('.modal.'+btn.data('modal')).show();
	btn.norm().blur();
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