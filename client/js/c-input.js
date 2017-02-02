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
	var password=form.q('.password').val()+'';
	var user=form.q('.user').val()+'';
	var obj=
	{
		data:{password,user}//iOS might not be able to handle this!!
	};
	if (password.length&&user.length)//optimize these vars!!
	{
		output.req('api/login/',obj)
		.then(function(res)
		{
			console.log(res);
			q('.login__msg').html('');
			res.auth?q('.login').hide():q('.login__msg').html(res.error);
		}).catch(output.error);
	}
	else
	{
		let arr=[];
		!password.length?arr.push('Enter a password.'):'';
		!user.length?arr.push('Enter a user name.'):'';
		q('.login__msg').html(arr.join('<br>'));
	}
	
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