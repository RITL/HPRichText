/**
 * 创建一个映射对象，用于快速检查字符串是否存在于给定的字符串列表中。
 *
 * @param str - 一个由逗号分隔的字符串，包含需要映射的所有项。
 * @returns 一个对象，其中键是字符串列表中的项，值为 `true`。
 */
export function makeMap(str: string) {
  const obj: Record<string, boolean> = {};
  const items = str.split(',');
  for (let i = 0; i < items.length; i += 1) {
    obj[items[i]] = true;
  }
  return obj;
}

/**
 * 提取 HTML 文档中 body 标签内的内容。
 * 如果输入不是完整的 HTML 文档（不包含 body 标签），则返回原始内容。
 *
 * @param html - HTML 字符串，可能包含完整的文档结构。
 * @returns 如果包含 body 标签，返回 body 标签内的内容；否则返回原始 HTML 字符串。
 */
export function extractBodyContent(html: string): string {
  // 参数验证
  if (!html || typeof html !== 'string') {
    return html || '';
  }

  // 更健壮的正则表达式，正确处理属性中的引号和特殊字符：
  // 1. <body - 匹配开始标签
  // 2. (?:\s+(?:[^>"']|"[^"]*"|'[^']*')*)?  - 非捕获组匹配属性：
  //    - [^>"'] - 匹配非引号、非>的字符
  //    - "[^"]*" - 匹配双引号包围的属性值
  //    - '[^']*' - 匹配单引号包围的属性值
  // 3. \s*> - 匹配可选空白和结束的 >
  // 4. ([\s\S]*?) - 非贪婪匹配标签内容
  // 5. <\/body\s*> - 匹配结束标签
  // 处理异常边界场景：<body onclick="alert('>')">
  const bodyRegex = /<body(?:\s+(?:[^>"']|"[^"]*"|'[^']*')*)?>\s*([\s\S]*?)\s*<\/body\s*>/im;

  const bodyMatch = html.match(bodyRegex);

  // 如果找到 body 标签，返回其内容（去除首尾空白）；否则返回原始 HTML
  if (bodyMatch && bodyMatch[1] !== undefined) {
    const content = bodyMatch[1].trim();
    return content.length > 0 ? content : html;
  }

  return html;
}

/**
 * 移除 HTML 字符串中的注释、JavaScript 多行注释、`<script>` 标签及其内容、`<style>` 标签及其内容。
 *
 * @param html - 需要处理的 HTML 字符串。
 * @returns 处理后的 HTML 字符串。
 */
export function trimHtml(html: string) {
  return html
    .replace(/<!--.*?-->/gi, '')// 移除 HTML 注释
    .replace(/\/\*.*?\*\//gi, '')// 移除 JavaScript 多行注释
    // .replace(/[ ]+</gi, '<')// 移除标签前的空格
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')// [^]*?非贪婪模式 移除 <script> 标签及其内容
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // [^]*?非贪婪模式 移除 <style> 标签及其内容
}

/**
 * 将 HTML 字符串中的 `<br>` 标签替换为换行符，并在 `<br>` 标签后的内容前插入换行符。
 *
 * @param html - 需要处理的 HTML 字符串。
 * @returns 处理后的 HTML 字符串。
 */
export function replaceBr(html: string) {
  if (!html) {
    return '';
  }
  // 找到 <br> 标签，并检查其前后是否有匹配的 HTML 标签
  return html.replace(
    /(.*)<br\s*\/?>(.*)/gi,
    function (_match, p1, p2) {
      let obj = startWithHTMLElementInsertLinefeed(p2)
      if (obj.startWithHTML) {
        return p1 + obj.html;
      } else {
        // 否则，仅仅替换 <br> 为换行符
        return p1 + '\n' + p2;
      }
    }
  );
}

/**
 * 在HTML元素开头插入换行符
 *
 * 此函数旨在处理HTML字符串，使其在每个HTML元素的开头插入换行符，以提高可读性
 * 它首先调用`startWithHTMLElement`函数判断字符串是否以HTML元素开始，如果是，则进行替换操作
 *
 * @param html {string} - 输入的HTML字符串，默认为空字符串
 * @returns {Object} - 返回一个对象，包含是否以HTML元素开始的标志（startWithHTML）和处理后的HTML字符串（html）
 */
export function startWithHTMLElementInsertLinefeed(html: string = '') {
  let s = startWithHTMLElement(html);
  if (s) {
    html = html.replace(/(<[^>]+>)([^<]*)/, '$1\n$2');
  }
  return {
    startWithHTML: s,
    html
  }
}

/**
 * 将 HTML 字符串中的制表符替换为两个制表符。
 *
 * @param html - 需要处理的 HTML 字符串。
 * @returns 处理后的 HTML 字符串。
 */
export function replaceEscapeSymbol(html: string) {
  const reg = /\t/gi;
  return html.replace(reg, '\t\t');
}


/**
 * 将 HTML 字符串包裹在一个根 `<div>` 标签中。
 *
 * @param html - 需要包裹的 HTML 字符串。
 * @returns 包裹后的 HTML 字符串。
 */
export function addRootDiv(html: string) {
  if (!html) {
    return html;
  }
  return `<div>${html}</div>`
}

/**
 * 检查 HTML 字符串是否以 HTML 元素开始。
 *
 * @param html - 需要检查的 HTML 字符串。
 * @returns 如果 HTML 字符串以 HTML 元素开始，则返回 `true`；否则返回 `false`。
 */
export function startWithHTMLElement(html: string) {
  // 正则表达式匹配以 < 开头，后跟非空白字符，直至遇到 > 为止的序列
  const reg = /^<\w+(\s+\w+="[^"]*"|\s+\w+='[^']*'|\s+[^\s>]+)*\s*>/;
  return reg.test(html.replace(/\n/g, ""));
}

/**
 * 将 HTML 字符串中的第一个文本节点的第一个字符包裹在一个 `<span>` 标签中。
 *
 * @param html - 需要处理的 HTML 字符串。
 * @returns 处理后的 HTML 字符串。
 */
export function firstTextWrapInlineTag(html: string): string {

  // 找到第一个文本节点的位置
  const textStart = html.search(/(?<=<[^>]*>)[^<]+/);

  if (textStart !== -1) {
    const text = html.substring(textStart).trim();
    const firstChar = text.charAt(0);
    const restText = text.slice(1);
    // 添加内联标签
    const wrappedText = `<span>${firstChar}</span>${restText}`;

    return html.substring(0, textStart) + wrappedText;
  }
  return html;
}

/**
 * 检查字符串是否以块级 HTML 标签开始。
 *
 * @param str - 需要检查的字符串。
 * @returns 如果字符串以块级 HTML 标签开始，则返回 `true`；否则返回 `false`。
 */
export function startWithBlockTag(str) {
  const blockTags = Object.keys(block);
  // 将标签数组转换为正则表达式的一部分
  const tagPattern = blockTags.join('|');
  // 正则表达式用于确保字符串的开头是 block 类型的 HTML 标签
  const regex = new RegExp(`^\\s*<\\s*(${tagPattern})\\b[^>]*>`, 'i');
  // 使用 test 方法检查字符串是否符合要求
  return regex.test(str);
}


export const startTag =
  /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z0-9_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;

export const endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;

export const attr =
  /([a-zA-Z0-9_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

// Empty Elements - HTML 5
export const empty =
  makeMap('area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr');

// Block Elements - HTML 5
export const block =
  makeMap('input,textarea,br,code,address,article,applet,aside,audio,blockquote,canvas,center,dd,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video');

// Inline Elements - HTML 5
export const inline =
  makeMap('img,a,abbr,acronym,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,ins,kbd,label,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,tt,u,var');

// Elements that you can, intentionally, leave open
// (and which close themselves)
export const closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');

// Attributes that have their values filled in disabled="disabled"
export const fillAttrs =
  makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected');

// node转化之后需要过滤的属性
export const filterAttrs = makeMap('style,class');

export const special = makeMap('script,style');

// 将图片替换成webp格式
export function replaceWebpPic(imgUrl: string): string {
  if (!imgUrl || typeof imgUrl !== 'string') {
    return imgUrl;
  }
  const reg = /(http)(s)?:\/\/(img|static)(.*?)\.(png|jpg|gif|jpeg|bmp)(?!_.webp)/gi;
  if (imgUrl.match(reg)) {
    imgUrl = imgUrl.replace(reg, img => {
      return `${img}_.webp`;
    });
  }
  return imgUrl;
}
