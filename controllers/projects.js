var express = require('express');
var db = require('../models');
var router = express.Router();

// POST /projects - create a new project
router.post('/new', function(req, res) {
  db.project.create({ //Creates the project
    name: req.body.name,
    githubLink: req.body.githubLink,
    deployedLink: req.body.deployedLink,
    description: req.body.description
  })
  .then(function(project) {
    if(req.body.category){
      db.category.findOrCreate({ //Finds category, or creates it if not found
        where: { name: req.body.category }
      }).spread(function(category, wasCreated){
        if(category){
          project.addCategory(category); //Adds the association in the join table
          res.redirect("/");
        }
        else{
          res.status(400).render('main/404');
        }
      });
    }
    else{
      res.redirect('/');
    }
  })
  .catch(function(error) {
    console.log(error);
    res.status(400).render('main/404');
  });
});

// GET /projects/new - display form for creating a new project
router.get('/new', function(req, res) {
  res.render('projects/new');
});

// GET /projects/:id - display a specific project
router.get('/:id', function(req, res) {
  db.project.find({
    where: { id: req.params.id },
    include: [db.category] //This includes the categories associated with this project
  })
  .then(function(project) {
    if (!project) throw Error();
    res.render('projects/show', { project: project });
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

// GET /projects/categories - Show a list of categories
router.get("/category/all", function(req, res){
  db.category.findAll({
    include: [db.project]
  }).then(function(cats){
    res.render("projects/categories", { categories: cats });
  }).catch(function(error) {
    res.status(400).render('main/404');
  });
});

router.get("/category/:id", function(req, res){
  db.category.findOne({
    where: { id: req.params.id },
    include: [db.project] //This will allow us to access category.projects
  }).then(function(category){
    res.render("projects/categoryDetail", { category: category });
  }).catch(function(error) {
    res.status(400).render('main/404');
  });
});

module.exports = router;
