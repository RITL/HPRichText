import { HPRichTextV2, RichTextOptionModelV2 } from '@ohasasugar/hp-richtext';

// import { imgUrl } from '../constant';

@Entry
@Component
struct Index {
  richTextModel: RichTextOptionModelV2 = new RichTextOptionModelV2();

  aboutToAppear() {
    this.richTextModel.richTextOption = {
      content: `
      <font color="#ACAFBF">申请注销即表示您xxxx并同意<a href="https://www.xxx.html">《账户注销须知》</a> 。账号注销成功后xxx。</font>
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