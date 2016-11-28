'use strict';
((typeof global!=='undefined')?global:window).mr={};
mr.freeze=function()
{
	Array.prototype.slice.call(arguments).forEach(function(obj)
	{
		Object.freeze(obj);
		Object.keys(obj).forEach(function(key)
		{
			if (obj[key]!==null&&obj[key!=undefined])
			{
				mr.freeze(obj[key]);
			}
		});
	});
};
mr.freeze(mr);