
# 安装

Docker Hub： https://hub.docker.com/r/minio/minio
**拉取镜像**
```shell
docker pull minio/minio
```

**启动容器**
```shell
  docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=admin123" \
  -v /Users/rick/Space/tmp/minio/data:/data \
  minio/minio:latest server /data --console-address ":9001"
```

**登录管理台**
http://localhost:9001/ 
用户名：admin 密码：admin123

# 集成sharp-fileupload

1. 创建 access key
2. 创建 `Bucket` 默认访问 Access Policy 是 private，如果想通过 url 地址访问，需要修改成 public

**application.yml**

```yml
fileupload:  
  tmp: /Users/rick/Space/tmp/fastdfs/tmp # 下载的临时目录  
  local: # cd /Users/rick/Space/tmp/fileupload && http-server -p 7892  
    root-path: /Users/rick/Space/tmp/fileupload  
    server-url: http://localhost:7892/ # 映射到tmp目录  
  oss:  
    endpoint: http://localhost:9000  
    accessKeyId: sZVg9wFYsFYZZnF1n2mm  
    accessKeySecret: go4HPFTPjT1S4TmO3ySzkTOut6jsaQah5JvP3C9g  
    bucketName: test
```

**Config.java**
```java
@Bean  
public InputStreamStore minioInputStreamStore(OSSProperties ossProperties) {  
    MinioClient minioClient =  
            MinioClient.builder()  
                    .endpoint(ossProperties.getEndpoint())  
                    .credentials(ossProperties.getAccessKeyId(), ossProperties.getAccessKeySecret())  
                    .build();  
    return new MinioInputStreamStore(minioClient, ossProperties);  
}
```

**Test.java**
```java
@Autowired  
private InputStreamStore inputStreamStore;  
  
private static String path;  
  
@Test  
@Order(1)  
public void testPropertyStore() throws IOException {  
    StoreResponse response = inputStreamStore.store("hello", "jpeg",  
            new FileInputStream("/Users/rick/Space/tmp/fileupload/demo/1.jpg"));  
    System.out.println(response.getGroupName());  
    System.out.println(response.getPath());  
    System.out.println(response.getFullPath());  
    System.out.println(response.getUrl());  // Bucket 如果是 public 的，可以通过 url 访问
    path = response.getPath();  
}  
  
@Test  
@Order(2)  
public void getInputStream() throws IOException {  
    InputStream is = inputStreamStore.getInputStream("hello", path);  
    FileUtils.copyInputStreamToFile(is, new File("/Users/rick/Space/tmp/fileupload/download/minio-1.png"));  
    is.close();  
}  
  
@Test  
@Order(3)  
public void delete() throws IOException {  
    inputStreamStore.delete("hello", path);  
}
```