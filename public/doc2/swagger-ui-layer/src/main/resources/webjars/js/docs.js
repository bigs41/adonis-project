$.views.settings.allowCode(true);
$.views.converters("getResponseModelName", function (val) {
    return getResponseModelName(val);
});

var tempBody = $.templates('#temp_body');
var tempBodyRefModel = $.templates('#temp_body_ref_model');
var tempBodyType = $.templates('#temp_body_type');

var getValues = null

var contextPath = getContextPath();

function getContextPath() {
    var pathName = document.location.pathname;
    var index = pathName.substr(1).indexOf("/");
    var result = pathName.substr(0, index + 1);
    return result;
}
/* sidebar-toggle */
function sizeWindows() {
    var height = $('#sidebar-toggle').height()
    $('#sidebar-body').height(height-60)
}
function base_url(segment){
    // get the segments
    pathArray = window.location.pathname.split( '/' );
    // find where the segment is located
    indexOfSegment = pathArray.indexOf(segment);
    // make base_url be the origin plus the path to the segment
    return window.location.origin + pathArray.slice(0,indexOfSegment).join('/') + '/';
}

// function addScript(url) {
//     var script = document.createElement('script');
//     script.type = 'application/javascript';
//     script.src = url;
//     document.head.appendChild(script);
// }

// addScript('https://raw.githack.com/eKoopmans/html2pdf/master/dist/html2pdf.bundle.js');

$(function () {
    $.ajax({
//*/
        url: "/v2/docs.json",
/*/
	    url : "http://petstore.swagger.io/v2/swagger.json",
//*/
        dataType: "json",
        type: "get",
        async: false,
        success: function (data) {
            //layui init
            layui.use(['layer', 'jquery', 'element'], function () {
                var $ = layui.jquery, layer = layui.layer, element = layui.element;
            });
            var jsonData = eval(data);
            $("#title").html(jsonData.info.title);
            $("body").html($("#template").render(jsonData));

            var hashlink = window.location.hash


            $("[name='a_path']").click(function () {
                var path = $(this).attr("path");
                var method = $(this).attr("method");
                var operationId = $(this).attr("operationId");
                
                $.each(jsonData.paths[path], function (i, d) {
                    if (d.operationId == operationId) {
                        
                        d.path = path;
                        if(!empty(jsonData.rootPath)){
                            d.rootpath = jsonData.rootPath+path;
                        }else{
                            d.rootpath = path;
                        }
                        d.method = method;
                        
                        $("#path-body").html(tempBody.render(d));

                        if(!d.responses["200"].hasOwnProperty("schema")){
                            // continue
                            return true;
                        }

                        if(d.responses["200"]["schema"].hasOwnProperty("type")){
                            var model = {"type":d.responses["200"]["schema"]["type"]};
                            $("#path-body-response-model").append(tempBodyType.render(model));
                            // continue
                            return true;
                        }

                        var modelName = getRefName(d.responses["200"]["schema"]["$ref"]);
                        if(d.parameters){
                            $.each(d.parameters, function (i, p) {
                                if (p["schema"]) {
                                    var parameterModelName = getRefName(p["schema"]["$ref"]);
                                    renderRefModel("path-body-request-model", jsonData, parameterModelName);
                                }
                            });
                        }
                        renderRefModel("path-body-response-model", jsonData, modelName);
                    }
                });
            });

            $("[name='btn_submit']").click(function () {
                var operationId = $(this).attr("operationId");
                var parameterJson = {};
                $("input[operationId='" + operationId + "']").each(function (index, domEle) {
                    var k = $(domEle).attr("name");
                    var v = $(domEle).val();
                    parameterJson.push({k: v});
                });
            });

            if(!empty(hashlink)){
                $('a[href="'+hashlink+'"]').closest('dd').addClass('layui-this')
                $('a[href="'+hashlink+'"]').closest('li.layui-nav-item').addClass('layui-nav-itemed')
                $('a[href="'+hashlink+'"]').click()
            }
            
            var specialElementHandlers = {
                '#editor': function (element, renderer) {
                    return true;
                }
            };
            $('#printDoc').click(function () { 
                var element = document.getElementById('document_data');
                html2pdf().set({margin:5}).from(element).save();
            });
        }
    });

});


/**
 * Render ref type parameter
 * @param domId DomId to be added
 * @param jsonData
 * @param modelName
 */
function renderRefModel(domId, jsonData, modelName) {
    if (modelName) {
        var model = jsonData.definitions[modelName];
        model.name = modelName;
        model.domId = domId;
        //Modify the type of a nested object
        $.each(model.properties, function (i, v) {
            if (v.items) {
                $.each(v.items, function (j, item) {
                    var typeModel = item.startsWith("#") ? getRefName(item) : item;
                    model.properties[i].type = "Array[" + typeModel + "]";
                });
            }

            //Custom object type (non-Array)
            if (!v.type) {
                model.properties[i].type = getRefName(v["$ref"]);
            }
        });
        //Render if the object is not rendered to the page
        if ($("#ref-" + domId + "-" + modelName).length == 0) {
            $("#" + domId).append(tempBodyRefModel.render(model));
        }

        
        $.each(model.properties, function (i, v) {
            //Array
            if (v.items) {
                $.each(v.items, function (j, item) {

                    if (item.startsWith("#")) {
                        renderRefModel(domId, jsonData, getRefName(item));
                    }
                });
            }


            if(v.hasOwnProperty("$ref")){
                renderRefModel(domId, jsonData, getRefName(v["$ref"]));
            }

        });
    }
}

//Get the model name
function getRefName(val) {
    if (!val) {
        return null;
    }
    return val.substring(val.lastIndexOf("/") + 1, val.length);
}

//Test button to get data
function getData(operationId) {
    var path = $("[m_operationId='" + operationId + "']").attr("path");
    
    //path parameter
    $("[p_operationId='" + operationId + "'][in='path']").each(function (index, domEle) {
        var k = $(domEle).attr("name");
        var v = $(domEle).val();
        if (v) {
            path = path.replace("{" + k + "}", v);
        }
    });
    //Header parameter
    var headerJson = {};
    $("[p_operationId='" + operationId + "'][in='header']").each(function (index, domEle) {
        var k = $(domEle).attr("name");
        var v = $(domEle).val();
        if (v) {
            headerJson[k] = v;
        }
    });

    //Request method
    var parameterType = $("#content_type_" + operationId).val();

    //query  parameter
    var parameterJson = {};
    if ("form" == parameterType) {
        $("[p_operationId='" + operationId + "'][in='query']").each(function (index, domEle) {
            var k = $(domEle).attr("name");
            var v = $(domEle).val();
            if (v) {
                parameterJson[k] = v;
            }
        });
    } else if ("json" == parameterType) {
        var str = $("#text_tp_" + operationId).val();
        try {
            parameterJson = JSON.parse(str);
        } catch (error) {
            layer.msg("" + error, {icon: 5});
            return false;
        }
    }

    send(path, operationId, headerJson, parameterJson);
}


/**
 * Request type
 */
function changeParameterType(el) {
    var operationId = $(el).attr("operationId");
    var type = $(el).attr("type");
    $("#content_type_" + operationId).val(type);
    $(el).addClass("layui-btn-normal").removeClass("layui-btn-primary");
    if ("form" == type) {
        $("#text_tp_" + operationId).hide();
        $("#table_tp_" + operationId).show();
        $("#pt_json_" + operationId).addClass("layui-btn-primary").removeClass("layui-btn-normal");
    } else if ("json" == type) {
        $("#text_tp_" + operationId).show();
        $("#table_tp_" + operationId).hide();
        $("#pt_form_" + operationId).addClass("layui-btn-primary").removeClass("layui-btn-normal");
    }
}

/**
 * send request
 * @param url address
 * @param operationId   operationId
 * @param header    header parameter
 * @param data  value data
 */
function  empty(str){
    return !str || !/[^\s]+/.test(str);
}
function copyToClipboard(element) 
{
  if(!empty(element)){
      var val = $(element).parent().find("pre.json").text();
  }else{
      var val = getValues;
  }

  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(val).select();
  document.execCommand("copy");
  $temp.remove();
}


function send(url, operationId, header, data) {

    var type = $("[m_operationId='" + operationId + "']").attr("method");

    var hasFormData = $("[p_operationId='" + operationId + "'][in='formData']").length >= 1;

    var hasBody = $("[p_operationId='" + operationId + "'][in='body']").length >= 1;

    var options = {withQuotes: true};

    if (hasFormData) {
        var formData = new FormData($("#form_" + operationId)[0]);
        url = url.replace('/doc2','')
        var editor = ace.edit("json-response")
        editor.setTheme("ace/theme/monokai");
        editor.setReadOnly(true);
        
        $.ajax({
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        $('.progress-bar').css('width', '' + (100 * e.loaded / e.total) + '%');
                    }
                });
                return xhr;
            }, 
            type: type,
            url: url,
            headers: header,
            data: formData,
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            success: function (data,status,jqXHR) {
                $("#json-viewer").jsonViewer(data, options);
                $("#statusCode").text(jqXHR.status+':'+jqXHR.statusText);
                editor.session.setMode("ace/mode/json");
                editor.setValue(JSON.stringify(data,null,"\t"));
                getValues = jqXHR.responseText

                $.getScript( '/doc2/swagger-ui-layer/src/main/resources/webjars/js/get-table/bundle.js', function() {
                    $("#root textarea").val(getValues);
                    $("#run_json2table").click();
                });

                // $.json2table(data,"0").appendTo("#root");

                setTimeout(function(){
                    $('.progress-bar').css('width', '0%');
                },1000)
            },
            error:function(e){
                setTimeout(function(){
                    $('.progress-bar').css('width', '0%');
                },1000)
                    
                $("#statusCode").text(e.status+':'+e.statusText);
                editor.session.setMode("ace/mode/text");
                editor.setValue(e.responseText);
                $("#json-viewer").html("")
                // layer.msg("" + JSON.stringify(e), {icon: 5});
            }
        });

        return;
    }

    //Querystring , add the parameter after the url
    url = appendParameterToUrl(url,data);

    //requestBody request
    var bodyData ;
    if (hasBody) {
        var dom = $("[p_operationId='" + operationId + "'][in='body']")[0];
        bodyData = $(dom).val();
    }
    var contentType = $("#consumes_" + operationId).text();

    $.ajax({
        type: type,
        url: url,
        headers: header,
        data: bodyData,
        dataType: 'json',
        contentType: contentType,
        success: function (data) {
            $("#json-response").jsonViewer(data, options);
        },
        error:function(e){
            $("#json-response").html("");
            layer.msg("" + JSON.stringify(e), {icon: 5});
        }
    });

}

/**
 * Assemble the url parameter
 * @param url
 * @param parameter
 */
function appendParameterToUrl(url, parameter) {
    if($.isEmptyObject(parameter)){
        return url;
    }
    $.each(parameter, function (k, v) {
        if (url.indexOf("?") == -1) {
            url += "?";
        }
        url += k;
        url += "=";
        url += v;
        url += "&";
    });
    return url.substring(0, url.length - 1);
}