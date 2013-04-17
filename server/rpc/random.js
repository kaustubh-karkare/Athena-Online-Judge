
rpc.on("socket.connect",function(socket){
	if(arguments.length!==1) return; // prevent remote triggering
	socket.data.user = null;
	socket.data.auth = 0;
	socket.data.files = [];
});

rpc.on("socket.disconnect",function(socket){
	if(arguments.length!==1) return; // prevent remote triggering
	socket.data.files.forEach(function(id){
		filesystem.file.delete(id,function(e){ console.log("socket.disconnect","file.delete",id,e); });
	});
});

rpc.on("user.login",function(socket,data,callback){
	var spec = {type:"object",items:{username:{type:"string"},password:{type:"string"}}};
	async.waterfall([
		function(cb){ specification.match_complete("login",spec,data,cb); },
		function(select,save,cb){ database.get("user",select,{},cb); }
	], function(error,result){
		if(error){ callback(error); return; }
		socket.data.user = result;
		socket.data.auth = result.auth;
		callback(null,{"user":socket.data.user});
	});
});

rpc.on("user.logout",function(socket,data,callback){
	socket.data.user = null;
	socket.data.auth = 0;
	callback(null);
});

var safe = function(callback){ return function(e,r){ callback(e,e?undefined:r); }; };
rpc.on("contests.past",function(socket,data,callback){ database.page("contest",{"end":{$lt:new Date().valueOf()}},{},data.$page,safe(callback)); });
rpc.on("contests.future",function(socket,data,callback){ database.page("contest",{"end":{$gte:new Date().valueOf()}},{},data.$page,safe(callback)); });
rpc.on("contest.display",function(socket,data,callback){ database.get("contest",{"name":data},{},safe(callback)); })