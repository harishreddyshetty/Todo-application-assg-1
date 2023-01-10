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
  const { status } = request.query;
  console.log(status);

  switch (true) {
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
  }
});

module.exports = app;
