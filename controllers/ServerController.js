var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
createDBConnection(mongoose);

var pages = [];
var chapters = [];
var operators = [];
var connections = [];

module.exports = function(app){
  app.get('/favicon.ico', function(req, res){
    console.log("pass");
  });

  app.get('/', function(req, res){
    res.render('login');
  });

  app.get('/a', function(req, res){
    res.render('storyList');
    console.log("mayday");
  });

  app.get('/b', function(req, res){
    res.render('authoring');
    console.log("mayday");
  });

  app.get('/stories', function(req, res){
    console.log("request was made: " + req.url);
    res.render('view2', {userStories: stories});
  });

  app.post('/us', urlEncodedParser, function(req, res){
    const us = require('../DbModels/DbUser');
    const UserDb = us.UserDb;

    var user = req.body;
    var username = user.username;
    var password = user.password;

    UserDb.findOne({'username': username, 'password': password}, function(err, result){
       if (err) { return callback(err); }
       var dbUser = result;

       if(dbUser != null){
        res.json(dbUser);
       }
       else {
        res.json(null);
       }
     });
  });

  app.post('/pg', urlEncodedParser, function(req, res){
    const page = require('../DbModels/DbPage');
    const PageDb = page.PageDb;

    pages.push(req.body);
    var pg = pages[pages.length - 1];

    var pgDB = PageDb({
      pageID: pg.pageID,
      number: pg.pageNo,
      title: pg.title,
      content: pg.content,
      position_x: pg.x,
      position_y: pg.y
    }).save(function(err){
      if(err) throw err;
      console.log("Page saved: " + pg.pageID);
    });

    res.json("Page saved: " + pg.pageID);
  });

  app.post('/ch', urlEncodedParser, function(req, res){
    const chapter = require('../DbModels/DbChapter');
    const ChapterDb = chapter.ChapterDb;

    chapters.push(req.body);
    var ch = chapters[chapters.length - 1];

    var listC = StringToArray(ch.childPages);
    var listP = StringToArray(ch.parentPages);

    var pgsC = PageListToSchema(listC);
    var pgsP = PageListToSchema(listP);
    console.log(ch.chapterID);

    var chDB = ChapterDb({
      chapterID: ch.chapterID,
      number: ch.chapterNo,
      title: ch.title,
      colour: ch.colour,
      child_pages: pgsC,
      parent_pages: pgsP,
      width: ch.width,
      height: ch.height,
      position_x: ch.x,
      position_y: ch.y
    }).save(function(err){
      if(err) throw err;
      console.log("Chapter saved: " + ch.chapterID);
    });

    res.json("Chapter saved: " + ch.chapterID);
  });

  app.post('/op', urlEncodedParser, function(req, res){
    const operator = require('../DbModels/DbOperator');
    const OperatorDb = operator.OperatorDb;

    operators.push(req.body);
    var op = operators[operators.length - 1];

    var pgOut = findPage(op.pageOut);
    var pgOutSchema = PageToSchema(pgOut);

    var list = StringToArray(op.pagesIn);
    var pgsIn = PageListToSchema(list);

    var opDB = OperatorDb({
      operatorID: op.operatorID,
      type: op.type,
      pages_in: pgsIn,
      page_out: pgOutSchema,
      position_x: op.x,
      position_y: op.y
    }).save(function(err){
      if(err) throw err;
      console.log("Operator saved: " + op.operatorID);
    });

    res.json("Operator saved: " + op.operatorID);
  });

  app.post('/co', urlEncodedParser, function(req, res){
    const connection = require('../DbModels/DbConnection');
    const ConnectionDb = connection.ConnectionDb;

    connections.push(req.body);
    var conn = connections[connections.length - 1];
    console.log(conn.from + " -> " + conn.to);

    var connDB = ConnectionDb({
      connectionID: conn.connectionID,
      type: conn.type,
      direction: conn.direction,
      element_From: conn.from,
      element_To: conn.to
    }).save(function(err){
      if(err) throw err;
      console.log("Connection saved: " + conn.connectionID);
    });

  res.json("Connection saved: " + conn.connectionID);
});

  app.delete('/', function(req, res){
    // console.log("request was made: " + req.url);
    // res.sendFile('/xampp/htdocs/StoryPlaces/assets/story.html');
  });

  // app.get('/contact', function(req, res){
  //   console.log("request was made: " + req.url);
  //   res.sendFile(__dirname + '/stories.html');
  // });
  //
  // app.get('/profile', function(req, res){
  //   console.log("request was made: " + req.url);
  // });

  app.listen(3000);
  console.log('Listening to port ' + 3000);
};

function createDBConnection(mongoose){
  mongoose.connect('mongodb://localhost/StoryPlaces');
  mongoose.connection.once('open', function(){
    console.log("Connection has been made");
  }).on('error', function(error){
    console.log("Connection error: ", error);
  });
}

function findPage(id){
  if(id.localeCompare("") == 0)
    return null;

  for (var i = 0; i < pages.length; i++) {
    if (pages[i].pageID.localeCompare(id) == 0){
      return pages[i];
    }
  }
  return null;
}

function PageListToSchema(list){
  var jsonList = [];

  for(i = 0; i < list.length; i++){
    var page = findPage(list[i]);

    if(page != null){
      var pg = PageToSchema(page);
      jsonList.push(pg);
    }
  }

  return jsonList;
}

function StringToArray(str){
  var results = str.split(',');
  return results;
}

function PageToSchema(page){
    if(page == null)
      return {};

    var jsonPage = {
      "pageID":page.pageID,
      "number":page.pageNo,
      "title":page.title,
      "content":page.content,
      "position_x":page.x,
      "position_y":page.y
    };
    return jsonPage;
}
