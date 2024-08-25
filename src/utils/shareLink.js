import notify from './notify.js'

export function shareArticle(articleId, t) {
  copyToClipboard(`${window.location.origin}/article/${articleId}`);
  notify({ message: { title: t('linkCopied') }, success: true });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error('Could not copy text: ', err);
  });
}
