# `Graylog in docker-compose`



​	**What is `Graylog`?**

​		[`Graylog`](https://www.graylog.org/about) is defined in terms of log management platform for collecting, indexing, and analyzing both structured 		 and unstructured data from almost any source.

​	 **Minimun SETUP**

​		This is a minimum `Graylog` setup that can be used for smaller, non-critical, or test-purpose setups. None of the    		components are redundant, and they are easy and quick to setup.

![architec_small_setup](https://user-images.githubusercontent.com/108535307/183264301-d11fe1ea-4d17-4f35-be24-3bf04708ed9e.png)

`docker-compose.yml`:

```yaml
version: "3.8"
services:
  mongodb:
    image: mongo:4.2
    container_name: mongodb
    volumes:
      - ./mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: "on-failure"
    env_file: ./mongo_env
    command: mongod
    networks: 
      - graylog
  elasticsearch:
    image: "docker.elastic.co/elasticsearch/elasticsearch-oss:7.10.2"
    container_name: elasticsearch
    environment:
      ES_JAVA_OPTS: "-Xms1g -Xmx1g -Dlog4j2.formatMsgNoLookups=true"
      bootstrap.memory_lock: "true"
      discovery.type: "single-node"
      http.host: "0.0.0.0"
      action.auto_create_index: "false"
    ulimits:
      memlock:
        hard: -1
        soft: -1
    volumes:
      - ./es_data:/usr/share/elasticsearch/data
    restart: "on-failure"
    networks: 
      - graylog

  graylog:
    image: graylog/graylog:4.2
    container_name: graylog
    depends_on:
      elasticsearch:
        condition: "service_started"
      mongodb:
        condition: "service_started"
    entrypoint: "/usr/bin/tini -- wait-for-it elasticsearch:9200 --  /docker-entrypoint.sh"
    environment:
      GRAYLOG_NODE_ID_FILE: "/usr/share/graylog/data/config/node-id"
      GRAYLOG_PASSWORD_SECRET: ${GRAYLOG_PASSWORD_SECRET:?Please configure GRAYLOG_PASSWORD_SECRET in the .env file}
      GRAYLOG_ROOT_PASSWORD_SHA2: ${GRAYLOG_ROOT_PASSWORD_SHA2:?Please configure GRAYLOG_ROOT_PASSWORD_SHA2 in the .env file}
      GRAYLOG_HTTP_BIND_ADDRESS: "0.0.0.0:9000"
      GRAYLOG_HTTP_EXTERNAL_URI: "http://localhost:9000/"
      GRAYLOG_ELASTICSEARCH_HOSTS: "http://elasticsearch:9200"
      GRAYLOG_MONGODB_URI: "mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongodb:27017/graylog"
    networks: 
      - graylog
    ports:
    - "5044:5044/tcp"   # Beats
    - "5140:5140/udp"   # Syslog UDP
    - "5140:5140/tcp"   # Syslog TCP
    - "5555:5555/tcp"   # RAW TCP
    - "5555:5555/udp"   # RAW TCP
    - "9000:9000/tcp"   # Server API
    - "12201:12201/tcp" # GELF TCP
    - "12201:12201/udp" # GELF UDP
    - "13301:13301/tcp" # Forwarder data
    - "13302:13302/tcp" # Forwarder config
    volumes:
      - ./graylog_data:/usr/share/graylog/data/data
      - ./graylog_journal:/usr/share/graylog/data/journal
    restart: "on-failure"
    
networks:
 graylog: 
  driver: bridge
```

**Note**: find out more [Graylog](docs/gralog-container-env.md) and [ElasticSearch](docs/graylog-elasticsearch-env.md) environment variables.

`mongo-init.js`:

```js
print("Started Adding the Users to graylog database.");
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
```

`mongo_env`:

```shell
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=root
MONGO_INITDB_DATABASE=graylog
```

`.env`:

```shell
GRAYLOG_PASSWORD_SECRET=somepasswordpepper
GRAYLOG_ROOT_PASSWORD_SHA2=8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
MONGO_USERNAME=root
MONGO_PASSWORD=root
```

**Note:** Generate your own admin password with the following command and put the SHA-256 hash into the `GRAYLOG_ROOT_PASSWORD_SHA2` environment variable:

```bash
echo -n "Enter Password: " && head -1 < /dev/stdin | tr -d '\n' | sha256sum | cut -d " " -f1
```

Run project:

```shell
#up services
docker compose up -d
#down services
docker compose down
#see services logs
docker compose logs -f
```



Open `http://{HostIP}:9000/` and use the logon credentials to login. It may take a minute for the graylog server to come online (When graylog's container status turns into healthy)

```
username: admin
password: admin
```
