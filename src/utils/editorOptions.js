export default ($q, t) => {
  return [
    ['bold', 'italic', 'strike'],
    ['colorSelector'],
    [
      {
        label: t("fontSize"),
        icon: $q.iconSet.editor.fontSize,
        fixedLabel: true,
        fixedIcon: true,
        list: 'no-icons',
        options: [
          'size-1',
          'size-2',
          'size-3',
          'size-4',
          'size-5',
          'size-6',
          'size-7'
        ]
      },
      {
        icon: $q.iconSet.editor.align,
        fixedLabel: true,
        list: 'only-icons',
        options: ['left', 'center', 'right', 'justify']
      }
    ],
    ['hr', 'link'],
    ['quote', 'unordered', 'ordered'],
    ['undo', 'viewsource'],
    // [{ color: [] }, { background: [] }],
  ]
}
