import notify from './notify.js'


export function shareBoard(boardId, t) {
  copyToClipboard(`${window.location.origin}/board/${boardId}`);
  notify({ message: { title: t('linkCopied') }, success: true });
}

export function shareArticle(boardId, articleId, t) {
  copyToClipboard(`${window.location.origin}/board/${boardId}?articleId=${articleId}`);
  notify({ message: { title: t('linkCopied') }, success: true });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error('Could not copy text: ', err);
  });
}
