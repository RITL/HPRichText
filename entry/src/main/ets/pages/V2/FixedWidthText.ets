import { HPRichTextV2, RichTextOptionModelV2 } from '@ohasasugar/hp-richtext';

// import { imgUrl } from '../constant';

@Entry
@Component
struct Index {
  richTextModel: RichTextOptionModelV2 = new RichTextOptionModelV2();

  aboutToAppear() {
    this.richTextModel.richTextOption = {
      content: `
      <span style="width: 100px;display: block">我是固定宽度为 100px 的文本，当内容超过我的固定宽度时候，我希望可以正常换行</span>
      <span style="width: 100px;display: block">我是固定宽度为 100px 的文本，当内容超过我的固定宽度时候，我希望可以正常换行</span>
    `,
      imageProp: {
        webp: true,
      },
    }
    this.richTextModel.needScroll = true;
    this.richTextModel.onLinkPress = (e) => {
      return e;
    };
  }

  build() {
    Column() {
      HPRichTextV2({
        richTextModel: this.richTextModel
      })
    }
  }
}