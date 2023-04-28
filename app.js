//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const itemPushed = [];

const app = express();

mongoose.connect("mongodb+srv://mohak:mohak@cluster0.9h9tmdf.mongodb.net/todolistdb",{useNewUrlParser:true});

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const items = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("item",items);

const item1 = new Item({
  name:"complete tasks"
})

const item2 = new Item({
  name:"go for a jog"
})

const defaultItems = [item1,item2];

const listSchema = {
  name:String,
  items:[items]
};

const List = mongoose.model("list",listSchema);

// to log the items form the server 


app.get("/", function(req, res) {

  Item.find()
  .then(function(itemName){
    if (itemName.length===0){
      Item.insertMany(defaultItems)
    .then(function(){
    console.log("successful");
    })
    .catch(function(err){});
    res.redirect("/")
    }else{
      res.render("list", {listTitle:"Today", newListItems: itemName});  
    }
  })
  
  
  .catch(function(err){
  console.log(err);
  });



});

app.post("/", function(req, res){

  const itemame = req.body.newItem;
  const listname = req.body.list;

  const itemPassed = new Item({name:itemame});
  if (listname==="Today"){
    itemPassed.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname})
    .then(function(foundList){
      foundList.items.push(itemPassed);
      foundList.save();
      res.redirect("/"+listname);
    })
    .catch(function(err){
      console.log(err);
    })
  }

  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.post('/delete',function(req,res){

  const listName = req.body.listname;

  if (listName==="Today"){

  async function delet(){
    await Item.deleteOne({_id:req.body.checkbox});
    
  }delet();
    res.redirect("/");}
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:req.body.checkbox}}})
    .then(function(foundlist){})
    .catch(function(err){
      if(!err){
        res.redirect("/"+listName);
      }
    });
    
  }
 
})

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  

  List.findOne({name:customListName})
  .then(function(foundList){
    if (!foundList){
      const list = new List({
    name:customListName,
    items:defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
    }else{
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  })
  .catch(function(err){
    if(err){
      console.log("error found")
    }
  });
}); 

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

