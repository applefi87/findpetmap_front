import notify from 'src/utils/notify.js'
import { processImage } from 'src/utils/image.js'
//* **圖片上傳處理 */

export const handlePasteCapture = async (evt, editableContent) => {
  const imageUrl = await pasteCapture(evt, "draft")
  if (imageUrl) {
    insertURLIntoContent(imageUrl, editableContent)
  }
}

const insertURLIntoContent = (imageUrl, editableContent) => {
  const editor = editableContent.value;
  const imgTag = `<img style="width:100%;" src="${imageUrl}" />`;
  editor.runCmd("insertHTML", imgTag);
};

export async function pasteCapture(evt, route, t) {
  evt.preventDefault();
  evt.stopPropagation();
  const clipboardData = evt.clipboardData || window.Clipboard;

  if (clipboardContainsImage(clipboardData)) {
    const item = clipboardData.items[0];
    const file = item.getAsFile();
    return await processImage(file, route, t);
  } else {
    handleTextPaste(clipboardData, t);
  }
}

function clipboardContainsImage(clipboardData) {
  const items = clipboardData.items;
  if (!items || items.length === 0) return false;
  const item = items[0];
  return item.kind === "file" && item.type.indexOf("image") !== -1;
}

function extractThumbnailUrl(content) {
  const regex = /<img.*?src=['"](.*?)['"]/;
  const match = regex.exec(content);
  if (match?.[1]) {
    return match[1];
  }
  return '';
}
function handleTextPaste(clipboardData, t) {
  let paste = clipboardData.getData("text/html");
  if (!paste) paste = clipboardData.getData("text");
  const thumbnailUrl = extractThumbnailUrl(paste)
  if (thumbnailUrl.length > 100) { notify(t("imageUrlTooLong", { length: 100 })) } else {
    document.execCommand("insertHTML", false, paste);
  }
  // 可複製html
  // const paste = clipboardData.getData("text/html");
  // 可能被棄置，但完好兼容貼url連結的情形
  // document.execCommand("insertHTML", false, paste);
  // 取消這個因為未來可能被棄置 但目前找不到完整方案
  // const paste = clipboardData.getData("text");
  // console.log("text");
  // const selection = window.getSelection();
  // if (!selection.rangeCount) return;
  // selection.deleteFromDocument();
  // selection.getRangeAt(0).insertNode(document.createTextNode(paste));
  // selection.collapseToEnd();
}

// const saveToImageModel = async (imageUrl) => {
//   const image = new Image({ url: imageUrl });
//   await image.save();
// };
