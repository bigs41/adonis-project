# swagger-ui-layer

------

Swagger-ui-layer is a swagger-based front-end UI implementation that replaces the default swagger-ui to make the generated document more friendly and beautiful.

Swagger-ui-layer relies on the annotation function of swagger, because swagger-ui-layer is just an implementation of a front-end UI interface, the parsed data comes from `/v2/api-docs` 

### Effect

* An example of a final generated document: http://suldemo.tianox.com/docs.html

* Interface document information interface

![api-info](swagger-ui-layer/src/main/resources/examples/api-info.png)

* Interface document debugging interface

![api-debug](swagger-ui-layer/src/main/resources/examples/api-debug.png)
------

### how to use
##### 1 Introduce the jar package

First you need to introduce the `swagger` and `swagger-ui-layer` latest version of the jar package in your `pom.xml`.
Swagger-ui-layer The latest version of the jar package address: http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.github.caspar-chen%22%20AND%20a%3A%22swagger- Ui-layer%22
```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.2.2</version>
</dependency>
<dependency>
  <groupId>com.github.caspar-chen</groupId>
  <artifactId>swagger-ui-layer</artifactId>
  <version>${last-version}</version>
</dependency>
```

##### 2, add swagger function and annotations
Enable swagger and create a SwaggerConfig file with the following contents.
> One thing to note is that the default address of swagger api is `/v2/api-docs` so swagger-ui-layer also reads the default address.
So you can't specify the group parameter in new Docket(), otherwise the swagger api's address will be added to the group parameter later, causing swagger-ui-layer not to correctly request the data.
```java
@Configuration
@EnableSwagger2
Public class SwaggerConfig {

@Bean
Public Docket ProductApi() {
Return new Docket(DocumentationType.SWAGGER_2)
.genericModelSubstitutes(DeferredResult.class)
.useDefaultResponseMessages(false)
.forCodeGeneration(false)
.pathMapping("/")
.select()
.build()
.apiInfo(productApiInfo());
}

Private ApiInfo productApiInfo() {
ApiInfo apiInfo = new ApiInfo("XXX System Data Interface Document",
"Document Description...",
"1.0.0",
"API TERMS URL",
"Contact Mailbox",
"license",
"license url");
Return apiInfo;
}
}
```
Common swagger annotations
Api
ApiModel
ApiModelProperty
ApiOperation
ApiParam
ApiResponse
ApiResponses
ResponseHeader
Specific annotation usage can refer to the Internet

##### 3, view the results
The default access address for `swagger-ui-layer` is `http://${host}:${port}/docs.html`

### License
Apache License 2.0

### Source Maintenance Address
* Github : https://github.com/caspar-chen/swagger-ui-layer
* Code Cloud: https://gitee.com/caspar-chen/Swagger-UI-layer

### WeChat Discussion Exchange Group
![wechat_group](swagger-ui-layer/src/main/resources/examples/wechat_group.png)