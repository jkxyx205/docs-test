# 购买云服务器
登录阿里云购买ECS，操作系统我选择 Debian 12.10 64位，选择 Alibaba Cloud linux 安装 `1Panel` 的时候会出现错误。
# docker 部署 sharp-admin
**创建项目目录**
```shell
mkdir -p /usr/local/projects/sharp-admin
```
在 `sharp-admin` 下依次创建目录：data、deploy、init
```
root@iZbp114oy5r2mjdc1yuspoZ:/usr/local/projects/sharp-admin# ls -al
total 28
drwxr-xr-x 5 root root 4096 Apr 25 19:59 .
drwxr-xr-x 3 root root 4096 Apr 25 19:52 ..
drwxr-xr-x 8  999 root 4096 Apr 25 21:01 data # 挂载 mysql 的数据卷
drwxr-xr-x 2 root root 4096 Apr 25 19:54 deploy # 上传可执行的 jar 文件
-rw-r--r-- 1 root root 1190 Apr 25 19:57 docker-compose.yaml
-rw-r--r-- 1 root root  409 Apr 25 19:58 Dockerfile
drwxr-xr-x 2 root root 4096 Apr 25 19:59 init # 初始化的 mysql 脚本
```

拷贝文件：sharp-admin-2.0-SNAPSHOT.jar、docker-compose.yaml、Dockerfile、init-sql-2025-01-11.sql 到对应的目录下
树形结构展示
```
├── data
├── deploy
│	└── sharp-admin-2.0-SNAPSHOT.jar
├── docker-compose.yaml
├── Dockerfile
└── init
    └── init-sql-2025-01-11.sql
```

`Dockerfile`

```yaml
# For Java 8, try this
# FROM openjdk:8-jdk-alpine

# For Java 8, try this
FROM openjdk:8-jdk-alpine

# Refer to Maven build -> finalName
ARG JAR_FILE=deploy/sharp-admin-2.0-SNAPSHOT.jar

# cd /opt/app
WORKDIR /opt/app

# cp target/sharp-admin-2.0-SNAPSHOT.jar /opt/app/app.jar
COPY ${JAR_FILE} app.jar

# java -jar /opt/app/app.jar
ENTRYPOINT ["java","-Dspring.profiles.active=docker-prod","-jar","app.jar"]
```

`docker-compose.yaml`

```yaml
version: '3'

services:
  db:
    container_name: mysql-sharp-admin
    image: mysql:latest
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: sharp-admin
    volumes:
      - /usr/local/projects/sharp-admin/data:/var/lib/mysql # 数据挂载
      - ./init:/docker-entrypoint-initdb.d # 数据挂载目录下没有数据，那么执行 init 下的 sql
#    ports:
#      - "3306:3306"
#      - "33060:33060"
    expose: # 不会真的开放端口到宿主机或外部网络
      - 3306
      - 33060
    healthcheck: # 给 db 添加健康检查，要真正做到“等数据库准备好再启动”
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p123456"]
      interval: 10s
      timeout: 5s
      retries: 5

  sharp-admin:
    container_name: sharp-admin
    image: sharp-admin:2.0
    build:
      context: ./
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - /Users/rick/Space/tmp/admin/log:/opt/app/log
    depends_on:
      db:
        condition: service_healthy
```
# 1Panel
## 安装
参考[https://1panel.cn/docs/installation/online_installation/#__tabbed_1_3](https://1panel.cn/docs/installation/online_installation/#__tabbed_1_3)
```shell
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && bash quick_start.sh
```

安装完成后，控制台会打外网访问链接，用户名，密码。如何无法访问，查看一下默认端口 22367 是否开启运行访问。
## 环境配置
### 网站
【网站】中安装：OpenResty 服务后，【创建】网站，选择【反向代理】填写域名【sharp-admin.xhope.top】，【代理地址】写【127.0.0.1:8080】，我们的应用就运行在8080端口。不用忘记域名解析到【sharp-admin.xhope.top】配置完成后，通过地址[sharp-admin.xhope.top](sharp-admin.xhope.top)就能访问应用。
### 证书
- 创建 Acme 账户，填写邮箱和类型后确认。
- 创建 DNS 账户，填写名称，类型选择【阿里云】，Access key 和 Secret key，通过 - [RAM 访问控制](https://ram.console.aliyun.com/)创建用户获取，同时给权限【AliyunDNSFullAccess】
- 申请证书，从网站中获取选择网站【sharp-admin.xhope.top】
- 网站配置，启用 HTTPS