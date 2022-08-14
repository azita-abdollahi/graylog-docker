# Environment variables for `elasticsearch`



[`ES_JAVA_OPTS`](https://www.elastic.co/guide/en/elasticsearch/reference/8.3/advanced-configuration.html)

​	A JVM options file contains a line-delimited list of JVM arguments. Arguments are preceded by a dash (`-`). To apply 	the setting to specific versions, prepend the version or a range of versions followed by a colon.

​	To override the default heap size, set the minimum and maximum heap size settings, `Xms` and `Xmx`. The minimum 	   	and maximum values must be the same.

​	The [Log4j2 security issue](https://logging.apache.org/log4j/2.x/security.html#log4j-2.15.0) ([CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228)), also called [Log4Shell](https://www.lunasec.io/docs/blog/log4j-zero-day/), affecting version 2.0-beta9 to 2.12.1 and 2.13.0 	to 2.14.1 of the logging library, is bad. A **Remote Code Execution (RCE) with a straight 10 out of 10 on the 		    	[Common Vulnerability Scoring System](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator)** — [exploiting it is straight forward](https://www.lunasec.io/docs/blog/log4j-ze		ro-day/#how-the-exploit-works). If you need Java 7 support, [Log4j 2.12.4](https://search.maven.org/artifact/org.apache.logging.log4j/log4j/2.12.4/pom) 	is the version you want to use. For Java 8 and above it is fixed in ~~2.15.0~~ 2.16.0, but you should **update straight to 		[Log4j 2.17.1](https://search.maven.org/artifact/org.apache.logging.log4j/log4j/2.17.1/pom)**.

​	It is also complicated to fully assess the risk of an application since including a vulnerable version of the library isn’t 	    	enough to make it exploitable, and various scanners will report false positives:

​	There is the **JVM option** [`log4j2.formatMsgNoLookups=true`](https://issues.apache.org/jira/browse/LOG4J2-2109) that can mitigate the issue after a restart, which is the 	   	default behavior in the patched Log4j 2.15.0 version. You want this setting to stop your log messages from being 		     	evaluated to block this attack. However, that option is only available for versions ≥ 2.10 and cannot be used for earlier 	builds.

[`bootstrap.memory_lock`](https://www.elastic.co/guide/en/elasticsearch/reference/master/setup-configuration-memory.html#:~:text=To%20enable%20a%20memory%20lock%2C%20set%20bootstrap.memory_lock%20to,of%20mlockall%20in%20the%20output%20from%20this%20request%3A)

​	Most operating systems try to use as much memory as possible for file system caches and eagerly swap out unused 	application memory. This can result in parts of the JVM heap or even its executable pages being swapped out to disk.

​	Swapping is very bad for performance, for node stability, and should be avoided at all costs. It can cause garbage 	   	collections to last for **minutes** instead of milliseconds and can cause nodes to respond slowly or even to disconnect 	from the cluster. In a resilient distributed system, it’s more effective to let the operating system kill the node.

​	There are three approaches to disabling swapping. The preferred option is to completely disable swap. If this is not an 	option, whether or not to prefer minimizing swappiness versus memory locking is dependent on your environment.

​	 use [mlockall](http://opengroup.org/onlinepubs/007908799/xsh/mlockall.html) on Linux/Unix systems, or [VirtualLock](https://msdn.microsoft.com/en-us/library/windows/desktop/aa366895(v=vs.85).aspx) on Windows, to try to lock the process address space into RAM, 	 preventing any Elasticsearch heap memory from being swapped out.

[`discovery.type`](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-settings.html#:~:text=If%20discovery.type%20is%20set%20to%20single-node%2C%20Elasticsearch%20forms,join%20a%20cluster%20that%20has%20already%20been%20bootstrapped.)

​	Specifies whether Elasticsearch should form a multiple-node cluster. Defaults to `multi-node`, which means that    	     	Elasticsearch discovers other nodes when forming a cluster and allows other nodes to join the cluster later. If set to 	   	`single-node`, Elasticsearch forms a single-node cluster and suppresses the timeout set by 		     				    		    	`cluster.publish.timeout`. For more information about when you might use this setting, see [Single-node discovery](https://www.elastic.co/guide/en/elasticsearch/reference/current/bootstrap-checks.html#single-node-discovery).

[`Single-node discovery`](https://www.elastic.co/guide/en/elasticsearch/reference/current/bootstrap-checks.html#single-node-discovery)

​	We recognize that some users need to bind the transport to an external interface for testing a remote-cluster 		   	      	configuration. For this situation, we provide the discovery type `single-node` (configure it by setting    			   		   	`discovery.type` to `single-node`); in this situation, a node will elect itself master and will not join a cluster with 		    	any other node.

[`action.auto_create_index`](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html#index-creation)

​	Automatic index creation is controlled by the `action.auto_create_index` setting. This setting defaults to `true`, which 	allows any index to be created automatically. You can modify this setting to explicitly allow or block automatic creation 	of indices that match specified patterns, or set it to `false` to disable automatic index creation entirely. Specify a 		   	comma-separated list of patterns you want to allow, or prefix each pattern with `+` or `-` to indicate whether it should 	be allowed or blocked. When a list is specified, the default behaviour is to disallow.

[`http.host`](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html#http-settings)

​	Sets the address of this node for HTTP traffic. The node will bind to this address and will also use it as its HTTP 		    	publish address. Accepts an IP address, a hostname, or a [special value](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html#network-interface-values). Use this setting only if you require different 	configurations for the transport and HTTP interfaces.

​	Defaults to the address given by `network.host`.

```yaml
environment:
      ES_JAVA_OPTS: "-Xms1g -Xmx1g -Dlog4j2.formatMsgNoLookups=true"
      bootstrap.memory_lock: "true"
      discovery.type: "single-node"
      http.host: "0.0.0.0"
      action.auto_create_index: "false"
```

Other ElasticSearch variables: 

​	[`ulimit`](https://www.elastic.co/guide/en/elasticsearch/reference/master/setting-system-settings.html#ulimit)

​		On Linux systems, `ulimit` can be used to change resource limits on a temporary basis. Limits usually need to be 		set as `root` before switching to the user that will run Elasticsearch.

​		**ulimit** is admin access required Linux shell command which is used to see, set, or limit the resource usage of the    		current user. It is used to return the number of open file descriptors for each process. It is also used to set 		   		restrictions on the resources used by a process.

​		**ulimit** controls the maximum number of system resources that can be allocated to running processes. There is a 		number of settings. Their current values can be viewed by typing `ulimit -a` into the terminal window

​		**What are Soft limits and Hard limits in Linux?** 

​			The soft limits are the limits which are allocated for actual processing of application or users while the Hard limits 			are nothing but an upper bound to the values of soft limits. Hence,  	

​					(soft limits <= hard limit)

​			 **Soft limit** is the limit enforced by kernel and the **hard limit** is the ceiling for the resource value for unprivilged 		      processess which can raise its soft limit only to this value.

​	

```yaml
ulimits:
      memlock:
        #infinite memlock value
        hard: -1
        soft: -1
```

​	

####  Reference:

​	[Ulimit, Soft Limits and Hard Limits in Linux - GeeksforGeeks](https://www.geeksforgeeks.org/ulimit-soft-limits-and-hard-limits-in-linux/)

​	[Document - SUSE Linux Enterprise Server - What Does the memlock Option in limits.conf Do? | HPE Support](https://support.hpe.com/hpesc/public/docDisplay?docId=emr_na-c02239033)

​	[Setting ulimits for docker process and containers in Ubuntu (and possibly other distros) :: tostr.pl — Yet another 	   	homepage](https://tostr.pl/blog/setting-ulimits-for-docker-process-2/)

​	
