const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname+"/date.js");
const app = express();


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kartik:Test123@cluster0.yfgwb.mongodb.net/todolistDB", {useNewUrlParser:true});
// mongodb://localhost:27017/todolistDB
//mongodb+srv://admin-kartik:<password>@cluster0.yfgwb.mongodb.net/?retryWrites=true&w=majority
const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to To-Do List!"
});

const item2 = new Item({
    name: "Hit + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to cross off an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function (req,res) {
    // const day = date.getDate();
    
    Item.find({},function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully saved the default items to the DB.");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        } 
    });    
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName},function(err, foundList){
        if(!err){
            if(!foundList){
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                //Show an existing list
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
    
    
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    // if(req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/"); 
    // }
});

app.post("/delete",function(req,res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemID, function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
    
});

// app.get("/work",function(req,res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// });



app.get("/about",function(req,res){
    res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server has started successfully.");
});