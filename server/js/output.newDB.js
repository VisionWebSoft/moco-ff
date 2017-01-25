'use strict';
output.newDatabase=function(url)
{
	mr.freeze(config,input,logic,output);
	fs.readFile(url+'/data/inventory.csv','utf8',function(err,data)
	{
		if (err)
		{
			output.error(err);
		}
		else
		{
			logic.setDB(data);
			mongoose.connect('mongodb://localhost:27017/moco-ff');
			var db=mongoose.connection;
			db.on('error',output.error);
			var json=logic.getDB();
			var contacts=logic.uniqueEntries(json,'Contact Person');
			var depts=logic.uniqueEntries(json,'Fire Department');//fix redundant data!!
			var units=logic.uniqueEntries(json,'Unit Number');	
			//create items
			contacts.map(name=>({name})).forEach(obj=>schema.contact.create(obj,(err,obj)=>err?output.error(err):console.log(obj.name)));
			depts.map(name=>({name})).forEach(obj=>schema.department.create(obj,(err,obj)=>err?output.error(err):console.log(obj.name)));
			units.map(name=>({name})).forEach(obj=>schema.unit.create(obj,(err,obj)=>err?output.error(err):console.log(obj.name)));
			//create users
			var users=[{name:'user',password:'1longPassPhrase!'},{name:'admin',password:'ul7r4%3cur3C0d3!'}];
			users.forEach(function(user)
			{
				var salt=bcrypt.genSaltSync(10);
				var hash=bcrypt.hashSync(user.password,salt);
				user.password=hash;
				console.log(user);
				schema.user.create(user,(err,obj)=>err?output.error(err):console.log(obj));
			});
			logic.json2mongo(logic.getDB());
			setTimeout(console.log,1000*60);
		}
	});
};