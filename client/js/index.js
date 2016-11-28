'use strict';
window.config={};
window.input={};
window.logic={};
window.output={};
(function()
{
	var state={};
	logic.getDB=function()
	{
		return logic.clone(state.db);//clone db to prevent tampering
	};
	logic.setDB=function(obj)
	{
		//validate schema here?!!
		state.db=obj;
		return obj;
	};
	logic.getKeys=function()
	{
		return logic.clone(state.keys);//clone db to prevent tampering
	};
	logic.setKeys=function(obj)
	{
		//validate here?!!
		state.keys=obj;
		return obj;
	};
})();