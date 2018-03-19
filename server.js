var http = require("http");
var fs = require("fs");
var parse =require("url").parse;
var path = require('path');
var qs = require('querystring');
var mysql = require('mysql');
var formidable = require('formidable');

var root = __dirname;
function create_html(body,db_data){
  var item_html='';
  for(var i in db_data){
    var date_time = get_time_str(db_data[i].Date.toString());
    item_html+='<tr id=row'+i+'>\n'+
      '<td>'+db_data[i].Task+'</td>\n'+
      '<td>'+date_time+'</td>\n'+
      '<td>'+db_data[i].Description+'</td>\n'+
      '<td>'+db_data[i].isFinished+'</td>\n'+
      '<td><a class="edit btn">Edit</a> <a class="del btn">Delete</a></td>'
      '</tr>\n'
  }
  var full_html=body[0]+'</thead>\n'+item_html+body[1];
  return full_html;
}
function uploaded_html(body,file){
  var html_set=body.split('"./sample.jpg"');

  new_html=html_set[0]+'"./'+file+'"'+html_set[1];
  console.log(new_html);
  return new_html;
}
function showPage(req,res,path){
  var stream = fs.createReadStream(path);
  var body="";
  stream.on("data",function(chunk){
    body +=chunk;
  });
  stream.on("end",function(){
        res.writeHead(200,{"Content-Type":"text/html"});
        res.write(body)
        res.end();
  })
}
function showUploadedPage(req,res,path,file){
  var stream = fs.createReadStream(path);
  var body="";
  stream.on("data",function(chunk){
    body +=chunk;
  });
  stream.on("end",function(){
        res.writeHead(200,{"Content-Type":"text/html"});
        var new_body=uploaded_html(body,file);

        res.write(new_body);
        res.end();
  })

}
function read_file(res,rel_path,data_type){
  console.log("ok")
  file_path=path.join(root,rel_path);
  fs.readFile(file_path,function(err,data){
    if(err){
      throw err;
    }else {
      res.writeHead(200,{"Content-Type":data_type});
      res.write(data);
      res.end();
    }
  })
}
function get_file_type(url){
  var type = path.extname(url.pathname);
  console.log(type)
  switch(type.toString()){
    case ".JPG":
      return 1;
    case ".jpg":
      return 1;
    case ".js":
      return 2;
    case ".css":
      return 3;
    default:
      return 0;
  }
}
function page_process(req,res,url){
  if(url.pathname=="/"||url.pathname=="/index.html"){
    var file_path = path.join(root,"/index.html")
    switch (req.method) {
      case "GET":
        showPage(req,res,file_path);
        break;
      case "POST":
        break;
      case "DELETE":
        break;
      default:
        break;
    }
  }else{
    var file_path = path.join(root,url.pathname+".html");
    if(url.pathname=="/user"){
      switch (req.method) {
        case "GET":
          showPage(req,res,file_path);
          break;
        case "POST":
          add_data(req,function(parse_data){
            db.query("Insert into TaskList(Task,Date,Description) Values (?,?,?)",
            [parse_data.task,parse_data.date,parse_data.description],
            function(err){
              if(err){
                throw err;
              }else {
                console.log("Add new raw data(" +parse_data.task,parse_data.date,parse_data.description,")");
              }
            });
            showPage(req,res,file_path);
          });
          break;
        case "DELETE":
          console.log("Delete called");
          delete_data(req,function(parse_data){
            db.query("Delete from TaskList Where Task=?",[parse_data.task],function(err){
              if(err){
                throw err;
              }else{
                console.log("delete the data");
              }
            })
          });
          showPage(req,res,file_path);
          break;
        default:
          break;
      }
    }else if (url.pathname=="/update") {
      var file_path = path.join(root,"/user.html");
      console.log("update_edit",file_path);

      switch (req.method) {
        case "POST":
          edit_data(req,function(parse_data){
            db.query("UPDATE TaskList set Date=?,Description=?,isFinished=? Where Task=?",
            [parse_data.date,parse_data.description,parse_data.isFinished, parse_data.task],function(err){
              if(err){
                throw err;
              }else{
                showPage(req,res,file_path);
                console.log("Edit new raw data(" +parse_data.task,parse_data.date,parse_data.description,parse_data.isFinished+")");
              }
            });
          })
          break;
        default:
      }
    }else if (url.pathname=="/upload") {
      var file_path = path.join(root,"/index.html");
      var form = new formidable.IncomingForm();
      form.parse(req,function(err,fields,files){
        var oldpath = files.filetoupload.path;
        var newpath = '/Users/keng/Desktop/NodeJsInAction/font-end/' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;

        showUploadedPage(req,res,file_path,files.filetoupload.name);
      });
      })
    }
  }
}
var server = http.createServer(function(req,res){
  var url = parse(req.url);
  var type = get_file_type(url);
  console.log(type)
  console.log(url.pathname)
  switch (type) {
    case 1:
      read_file(res,url.pathname,"image/jpg");
      break;
    case 2:
      read_file(res,url.pathname,"application/x-javascript");
      break;
    case 3:
      read_file(res,url.pathname,"text/css");
      break;
    default:
      page_process(req,res,url);
      break;
  }

  });

  server.listen(3000);
