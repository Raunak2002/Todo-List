const express = require('express');

const ejs = require('ejs');                        // Installing ejs
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');


mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});  // Connecting to mongoose Server

app.use(express.static("public"));                          // For static folder like css and javascript
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');                               // Seting the view engine to ejs

const itemSchema = new mongoose.Schema({                          // First Schema
  name: String
});

const Items = mongoose.model("item", itemSchema);                // First COllections and model

const data1 = new Items({
  name: "Buy Food"
})
const data2 = new Items({
  name: "Cook Food"
})
const data3 = new Items({
  name: "Eat Food"
})

const defaultItems = [data1,data2,data3];

const listSchema = new mongoose.Schema({                          // Second Schema
  name: String,
  title: [itemSchema]
});

const Lists = mongoose.model("list", listSchema);               // Second Collections and model


app.get("/", function (req, res) {
  Items.find(function(err, items){
    if (items.length === 0) {                 // Checking the length of the array in database

      Items.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully done! ");
        }
      });
     res.redirect("/");                        // Inserting default items in database
     }
    else {
      res.render("list", {today1: "Today", newListitems: items});   // display the data
    }
  });                // Sending the data of file list ejs
})


app.post("/delete", function (req,res) {        // First checking if the request is coming for custom page or home page
  const deletefile = req.body.checkbox;
  const listtitle = req.body.listdata;
  if (listtitle == "Today") {                    // Deleting the items form main page

    Items.deleteOne({_id: deletefile}, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/");
      }
    })
  }
  else {                                        // // Deleting the items form custom page
      Lists.findOneAndUpdate({name: listtitle}, {$pull: {title:{_id: deletefile}}}, function (err) {
        if (!err) {
           res.redirect("/"+ listtitle);
        }
      });
  }

});



app.post("/", function (req,res) {
  let abc = req.body.listdata;               //  Storing new item in List.
  let abc1 = req.body.button;              // Storing new pages name

  const data4 = new Items({
    name: abc
  });                                     // Checking if the request is coming for home page or custom page

  if (abc1 === "Today"){                   // Checking the homepage
    data4.save();                          // Storing data in homepage
    res.redirect("/");
  }

  else {
    Lists.findOne({name: abc1},function (err, foundData) {    // Checking other pages
      foundData.title.push(data4);                           // Pushing data in those pages
      foundData.save();                                      // Saving it
      res.redirect("/" + abc1);                             // Displaying other pages
    })
  }

})



app.get("/:xyz", function (req, res) {                        // Displaying Other pages
    const listtitle = _.capitalize(req.params.xyz);
    Lists.findOne({name: listtitle}, function (err, dis) {

        if (dis) {                                             // Checking if the page exists
          res.render("list", {today1: dis.name, newListitems: dis.title});
        }

        else {                                             // If not then creating it
          const list = new Lists({
          name: listtitle,
          title: defaultItems
        });

          list.save();                                      // Saving the final outcome
          res.redirect("/" + listtitle);
        }
    })


  });


app.listen(3000, function () {                             
  console.log("Server is running at port 3000");
});
