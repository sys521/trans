# 简单介绍

  * 一个将文件中的简体转换为中文繁体的命令行小工具。
  * 基于流
  * 内置简单的是一个简单的字库，只能实现字对字翻译

# 用法

```
npm install -g trans-to-zhtw
```
在文件的根目录下运行

```
trans-to-zhtw
```

默认将翻译当前文件夹下的src目录，输出到src-translate-copy目录。

当然你也可以对它简单的配置， 在当前文件夹下建立 translate-config.js。

```
module.exports = {
  source: path.join(__dirname, './waitTranslate'), // 源文件
  dist: path.join(__dirname, './translate-copy'),  // 输出目录
  exclude: { // 排除的文件，文件夹
    dir: [path.join(__dirname, './waitTranslate/ignore'), '.png'],
    file: [path.join(__dirname, './waitTranslate/haha.js')]
  },
  dict: { // 也可以设置自己的字典
    '儿童': '寶寶'
  }
}
````

* 注意,字符串匹配的时候，按照utf-8的编码在匹配，确保文件是utf-8格式的。匹配基于正则的贪婪模式 *
* 涉及到的路径，应为绝对路径。 排除文件，也可以用文件后缀 *


# 例子

如果你正在做国际化，而且你的国际化可能只包含繁体业务。那么你可以使用它构建两套源文件，一套中文简体的源文件，一套中文繁体的源文件。