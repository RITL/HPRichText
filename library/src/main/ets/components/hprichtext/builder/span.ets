import { assign } from '../../../common/utils/helperful';
import type { FancySpanOptions, SpanBuilderInstall, TextBuilderOptions } from '../index';
import type { StyleObject } from '../../../common/types';

function mergeFancySpan($$: TextBuilderOptions, install: SpanBuilderInstall) {
  const index = $$.index;
  let clickIndex: number = $$.parentNode?.attr?.clickIndex;
  const clickTag = $$.parentNode?.tag;
  const artUIStyleObject = $$.node?.artUIStyleObject || $$.parentNode?.artUIStyleObject || install.defaultArtUI;
  // 当存在a标签的点击时候，需要让除了 <a> 标签包括以外的内容继承外层字体颜色样式
  if (clickTag === 'a' && clickIndex !== undefined && index !== clickIndex) {
    const attrStyle = $$.parentNode?.attr?.style as StyleObject;
    const parentAttrStyleColor: string = attrStyle?.color ?? '';
    return assign({ fontColor: parentAttrStyleColor }, artUIStyleObject) as FancySpanOptions
  }
  return artUIStyleObject;
}

@Builder
export function spanBuilder($$: TextBuilderOptions, install: SpanBuilderInstall) {
  Span($$.node.text)
    .fancySpan(mergeFancySpan($$, install))
    .onClick((event) => {

      let clickIndex: number = $$.parentNode?.attr?.clickIndex ?? 0;
      // 不触发点击事件的场景：
      // 判断父级是否为isInlinePushNode的结构：
      // 是：
      // a. index!==0
      // b. 非<a>标签判断不存在onClick属性
      //
      // 否：
      // 非<a>标签判断不存在onClick属性

      // 检查是否为内联推送节点
      if ($$.parentNode?.isInlinePushNode) {
        // 对于内联推送节点，检查索引和父节点类型
        if ($$.index !== clickIndex ||
          ($$.parentNode?.tag !== 'a' && !$$.parentNode?.attr?.onClick)
        ) {
          return;
        }
      } else {
        // 对于非内联推送节点，检查父节点类型
        if ($$.parentNode?.tag !== 'a' && !$$.parentNode?.attr?.onClick) {
          return
        }
      }
      if (($$.parentNode?.tag !== 'a' && !$$.parentNode?.attr?.onClick) ||
        ($$.parentNode?.tag === 'a' && $$.parentNode?.isInlinePushNode && $$.index !== clickIndex)) {
        return;
      }
      // 增加回调事件
      try {
        install.onLinkPress?.({
          text: $$.node.text,
          link: $$.parentNode?.attr?.href,
          eventFnName: $$.parentNode?.attr?.onClick,
          clickEvent: event
        });
      } catch (error) {
        console.error(`ErrorCode: ${error.code},  Message: ${error.message}`);
      }
    })
}

@Extend(Span)
function fancySpan($$: FancySpanOptions = {}) {
  .fontColor($$.fontColor)
  .fontSize($$.fontSize)
  .fontStyle($$.fontStyle)
  .fontWeight($$.fontWeight)
  .fontFamily($$.fontFamily)
  .letterSpacing($$.letterSpacing)
  .decoration($$.decoration ?? { type: TextDecorationType.None }) // 避免push到子节点的时候，继承 Text 的属性
}
