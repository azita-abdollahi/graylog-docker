print("Started Adding the Users.");
conn = new Mongo();
graylog = conn.getDB("graylog")
graylog.createUser(
  {
    user: "root",
    pwd: "root",
    roles: [
       { role: "dbOwner", db: "graylog" }
    ]
  }
);
print("End Adding the User Roles.");