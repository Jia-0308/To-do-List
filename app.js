//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item({
  name: "Work"
});

const item2 = new Item({
  name: "Study"
});

const item3 = new Item({
  name: "Play Hockey"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
        //  console.log("Successfully saved default items to database!");
        }
      });
      res.redirect("/");
    }
    if (err) {
      console.log(err);
    } else {
      //console.log(results);
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  });
});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, results) {

    if (results) {
      //console.log("Already existed!");
      res.render("list", {
        listTitle: results.name,
        newListItems: results.items
      });
    } else {
    //  console.log("Nope!")
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();

      res.redirect("/" + customListName);
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, results) {
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  //console.log(req.body.checkbox);
  checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function(err) {
      if (err) {
        console.log(err);
      } else {
      //  console.log("Deleted!")
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, results) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(4000, function() {
  console.log("Server started!");
});
