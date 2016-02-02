/**
 * Created by l0nley on 2/1/16.
 */
var express = require("express");
var ie = require("linq");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var extend = require("util")._extend;
var router = express.Router();
var projects = [
    {
        id: 1,
        name: "Mercury",
        created: new Date(),
    },
    {
        id: 2,
        name: "Venice",
        created: new Date()
    },
    {
        id: 3,
        name: "Earth",
        created: new Date()
    },
    {
        id: 4,
        name: "Mars",
        created: new Date()
    }
];

var cases = {
    "1": [
        {
            id:1,
            title:"Register for courses",
            description:"Student accesses the system and views the courses currently available for him to register. Then he selects the courses and registers for them.",
            primaryActor:"Student",
            precondintions:"Student is logged into the system",
            postconditions:"Student is registered for courses",
            mainSuccessScenario:"1. Student selects “Register New Courses” from the menu.2. System displays list of courses available for registering. 3. Student selects one or more courses he wants to register for. 4. Student clicks “Submit” button.5. System registers student for the selected courses and displays a confirmation message.",
            extensions:"2a. No courses are available for this student. — 2a1. System displays error message saying no courses are available, and provides the reason & how to rectify if possible.     — 2a2. Student either backs out of this use case, or tries again after rectifying the cause.5a. Some courses could not be registered. — 5a1. System displays message showing which courses were registered, and which courses were not registered along with a reason for each failure.5b. None of the courses could be registered. — 5b1. System displays message saying none of the courses could be registered, along with a reason for each failure.",
            frequencyOfUse:"A few times every quarter",
            owner:"John Smith",
            priority:"Medium"
        }],

    "2": [],
    "3": []
};

var toProjectView = function(p) {
    project = extend({},p);
    project.links = [
        {
            rel:"self",
            href:"/api/project/"+project.id
        },
        {
            rel:"cases",
            href:"/api/project/"+project.id+"/case"
        }
    ];
    return project;
};

var toCaseView = function(cased, pid) {
    ccase = extend({},cased);
    ccase.links = [
        {
            rel:"self",
            href:"/api/project/"+pid+"/case/"+ccase.id
        }
    ];
    return ccase;
};

router.delete("/project/:id", function (req, res) {
    var newproj = [];
    ie.from(projects).forEach(function (p) {
        if (p.id != req.params.id) {
            newproj.push(p);
        }
    });
    projects = newproj;
    res.status(204).end();
});

router.get("/project/:id", function (req, res) {
    var obj = ie.from(projects).where("p=>p.id =='" + req.params.id + "'").first();
    res.json(toProjectView(obj));
});

router.get("/project", function (req, res) {
    var items = [];
    ie.from(projects).forEach(function(obj) {
        items.push(toProjectView(obj));
    });
    res.json(items);
});

router.get("/project/:id/case", function(req,res) {
    var pcase = cases[req.params.id];
    if(pcase == null || pcase ==undefined) {
        res.json([]);
    } else {
        var result=[];
        ie.from(pcase).forEach(function(obj) {
            result.push(toCaseView(obj,req.params.id));
        });

        res.json(result);
    }
});

router.post("/project/:pid/case", function(req, res) {
    var pcase = cases[req.params.pid];
    if(pcase == null || pcase == undefined){
        pcase = [];
        cases[req.params.pid] = pcase;
    }
    var max = 0;
    ie.from(pcase).forEach(function (obj) {
        if (obj.id > max) {
            max = obj.id
        }
    });
    pcase.push({ id: max+1, title: "New case"});
    res.status(204).end();
});

router.get("/project/:pid/case/:cid", function(req, res) {
   var pcase = cases[req.params.pid];
    if(pcase == null || pcase == undefined){
        res.status(404).end();
    } else {
        var ccase = ie.from(pcase).where("p => p.id == '"+req.params.cid+"'").first();
        res.json(toCaseView(ccase, req.params.pid));
    }
});

router.delete("/project/:pid/case/:cid", function(req, res) {
    var pcase = cases[req.params.pid];
    var newcases = [];
    if(pcase == null || pcase == undefined)
    {
        res.status(404).end();
    } else {
        ie.from(pcase).forEach(function(obj) {
            if(obj.id != req.params.cid) {
                newcases.push(obj);
            }
        });
        cases[req.params.pid] = newcases;
    }
    res.status(204).end();
});

router.put("/project/:pid/case/:cid", jsonParser, function(req, res) {
    var json = req.body;
    var pcase = cases[req.params.pid];
    if(pcase == null || pcase == undefined){
        res.status(404).end();
    } else {
        var obj = ie.from(pcase).where("p =>p.id =='"+req.params.cid+"'").first();
        if(obj == null || obj == undefined){
            res.status(404).end();
        } else {
            ie.from(json).forEach(function(item) {
               if(item.key != "id" || item.key != "links") {
                   obj[item.key] = item.value;
               }
            });
            res.status(204).end();
        }
    }
});

router.patch("/project/:id", jsonParser, function (req, res) {
    var obj = ie.from(projects).where("p=>p.id =='" + req.params.id + "'").first();
    if (obj == null) {
        res.status(404).end();
    }
    var json = req.body;
    ie.from(json).forEach(function (item) {
        obj[item.key] = item.value;
    });
    res.status(204).end();
});

router.post("/project", function (req, res) {
    var max = 0;
    ie.from(projects).forEach(function (obj) {
        if (obj.id > max) {
            max = obj.id
        }
    });
    max += 1;
    var p = {
        name: "New project",
        id: max,
        created: new Date()
    };
    projects.push(p);
    res.status(201).json({id: p.id});
});


module.exports = router;