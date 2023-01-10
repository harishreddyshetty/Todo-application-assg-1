const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const addDays = require("date-fns/addDays");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  app.listen(3000, () => {
    console.log("server has started at port 3000");
  });
};

initializeDbAndServer();

const hasStatus = (requestQuery) => requestQuery.status !== undefined;

const hasPriority = (requestQuery) => requestQuery.priority !== undefined;

const hasPriorityAndHasStatus = (requestQuery) => {
  requestQuery.priority !== undefined && requestQuery.status !== undefined;
};

const hasCategoryAndHasStatus = (requestQuery) => {
  requestQuery.category !== undefined && requestQuery.status !== undefined;
};

const hasCategory = (requestQuery) => requestQuery.category !== undefined;

const hasCategoryAndHasPriority = (requestQuery) =>
  requestQuery.category !== undefined && requestQuery.priority !== undefined;

const hasTodo = (requestQuery) => requestQuery.todo !== undefined;

const hasSearch = (requestQuery) => requestQuery.search_q !== undefined;

// api 1
const convertToCamelCase = (object) => {
  return {
    id: object.id,
    todo: object.todo,
    priority: object.priority,
    status: object.status,
    category: object.category,
    dueDate: object.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;

  switch (true) {
    // scenario 1
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const getTodosQuery = `SELECT * FROM todo WHERE status = "${status}"`;
        const data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => convertToCamelCase(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    // scenario 2
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const getTodosQuery = `SELECT * FROM todo WHERE priority = "${priority}"`;
        const data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => convertToCamelCase(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    // scenario 3
    case hasPriorityAndHasStatus(request.query):
      const getTodosQuery = `SELECT * FROM todo WHERE status = "${status}" and priority = "${priority}"`;
      const data = await db.all(getTodosQuery);
      response.send(data.map((eachItem) => convertToCamelCase(eachItem)));
      break;

    // scenario 4
    case hasSearch(request.query):
      const Query = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%"`;
      const searchData = await db.all(Query);
      response.send(searchData.map((eachItem) => convertToCamelCase(eachItem)));
      break;

    // scenario 5
    case hasCategoryAndHasStatus(request.query):
      const CateAndStatQuery = `SELECT * FROM todo WHERE status = "${status}" and category = "${category}"`;
      const catStatusResponse = await db.all(CateAndStatQuery);
      response.send(
        catStatusResponse.map((eachItem) => convertToCamelCase(eachItem))
      );
      break;

    // scenario 6
    case hasCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const getCategoryQuery = `SELECT * FROM todo WHERE  category = "${category}"`;
        const categoryResponse = await db.all(getCategoryQuery);
        response.send(
          categoryResponse.map((eachItem) => convertToCamelCase(eachItem))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //scenario 7
    case hasCategoryAndHasPriority(request.query):
      const catAndPriorityQuery = `SELECT * FROM todo WHERE  category = "${category}" and priority = "${priority}"`;
      const catAndPriorityResponse = await db.all(catAndPriorityQuery);
      response.send(
        catAndPriorityResponse.map((eachItem) => convertToCamelCase(eachItem))
      );
      break;
  }
});

// api 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(query);
  response.send(convertToCamelCase(dbResponse));
});

//api 3

//api 4

const isStatusValid = (requestQuery) => {
  const { status } = requestQuery;
  let result;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    result = true;
  } else {
    result = false;
  }
  return result;
};
const isPriorityValid = (requestQuery) => {
  const { priority } = requestQuery;
  let result;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    result = true;
  } else {
    result = false;
  }
  return result;
};

const isCategoryValid = (requestQuery) => {
  const { category } = requestQuery;
  let result;
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    result = true;
  } else {
    result = false;
  }
  return result;
};

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const isStatus = isStatusValid(request.body);
  const isPriority = isPriorityValid(request.body);
  const isCategory = isCategoryValid(request.body);

  if (isStatus && isPriority && isCategory) {
    const addTodoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
    VALUES(
        ${id},
        "${todo}",
        "${priority}",
        "${status}",
        "${category}",
        "${dueDate}");`;
    await db.run(addTodoQuery);
    response.send("Todo Successfully Added");
  } else if (!isStatus) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!isPriority) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!isCategory) {
    response.status(400);
    response.send("Invalid Todo Category");
  }
});

module.exports = app;
