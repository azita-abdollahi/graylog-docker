# Graylog Container Environment variable



**`GRAYLOG_NODE_ID_FILE`**

​	Setting the node ID in the Graylog container

**`GRAYLOG_PASSWORD_SECRET`**

​	You must set a secret that is used for password encryption and salting here. The server will refuse to start if it’s not 	   	set. Generate a secret with for example `pwgen -N 1 -s 96`. If you run multiple `graylog-server`nodes, make sure you 	use the same`password_secret`for all of them!

**`GRAYLOG_ROOT_PASSWORD_SHA2`**

​	A SHA2 hash of a password you will use for your initial login. Set this to a SHA2 hash generated with

   `echo -n "Enter Password: " && head -1 </dev/stdin | tr -d '\n' | sha256sum | cut -d" " -f1`and you will be 	    	able to log in to the  web interface with username **admin** and password **yourpassword**.

**`GRAYLOG_HTTP_BIND_ADDRESS`**

​	To be able to connect to Graylog you should set `http_bind_address`to the public host name or a public IP address of 	the machine you can connect to. More information about these settings can be found in [Configuring the web interface](https://docs.graylog.org/v1/docs/web-interface).

**`GRAYLOG_HTTP_EXTERNAL_URI`**

​	All configuration examples are created to run on the local computer. Should those be used on external servers, adjust 	`GRAYLOG_HTTP_EXTERNAL_URI`and add `GRAYLOG_HTTP_PUBLISH_URI`and `GRAYLOG_HTTP_EXTERNAL_URI`according to the 	   	[server.conf documentation](https://docs.graylog.org/v1/docs/server-conf).

**`GRAYLOG_ELASTICSEARCH_HOSTS`**

​	List of Elasticsearch hosts Graylog should connect to.

**`GRAYLOG_MONGODB_URI`**

​	Enter your MongoDB connection and authentication information here.



#### References:

​	[GitHub - marcinbojko/graylog: Simple one node Graylog setup with Traefik, Cloudflare/Let's Encrypt, Filebeat GELF/SYSLOG/BEATS support, and GeoIP updates](https://github.com/marcinbojko/graylog)

​	[Parsing Log Files in Graylog - Overview | Graylog](https://www.graylog.org/post/parsing-log-files-in-graylog-overview)

