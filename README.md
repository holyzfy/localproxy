# LocalProxy

将线上资源代理到本地

[![Build Status](https://travis-ci.org/holyzfy/localproxy.svg)](https://travis-ci.org/holyzfy/localproxy)

## 安装

0. 运行`npm install`

0. 编辑`config/default.json`并另存为`config/local.json`，可用的配置项：

    ### port

    代理服务器的运行端口，默认是8089

    ### map

    代理列表，支持代理目录和单个文件，`to`字段需要是绝对路径。

    示例：

    ```javascript
    {
        "map": [
            // 代理目录
            {
                "from": "http://dev.f2e.test.com/c_project/",
                "to": "C:/Users/zhaofuyun/Desktop/test_c/"
            },

            // 代理单个文件
            {
                "from": "http://dev.f2e.test.com/d_project/css/index.css",
                "to": "C:/Users/zhaofuyun/Desktop/test_d/index.css"
            }
        ]
    }
    ```

## 配置代理

PAC地址： http://127.0.0.1:8089/proxy.pac

### Windows

0. IE浏览器 菜单 > 工具 > Internet选项 > 连接 > 局域网设置

0. 勾选 `使用自动配置脚本`，填写PAC地址

### Mac

0. 系统偏好设置 > 网络 > 选取网络服务（例如以太网或 WIFI） > 高级 > 代理 > 自动代理配置

0. 填写PAC地址

## 运行

    node index.js

## 测试

    npm test
