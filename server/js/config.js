'use strict';
global.config={};
config.sessionExperation=1000*60*60*12;//12hrs
config.schema={};
config.schema.autofill=
{
	"type":"object"
};
config.schema.login=
{
	"password":"string",
	"user":"string"
};
config.schema.search=
{
	"type":"object"
};