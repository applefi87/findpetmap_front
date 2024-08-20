import { ssrMiddleware } from 'quasar/wrappers'
import initInterfaceLanguage from 'src/utils/initInterfaceLanguage.js'
import { getReorderLanguagesObjByPlainArr, languagesListObj2str } from 'src/utils/languageListTool.js'
// This middleware should execute as last one
// since it captures everything and tries to
// render the page with Vue
function parseCookies(request) {
  const list = {},
    rc = request.headers.cookie
  rc && rc.split(';').forEach(cookie => {
    const parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })
  return list
}
export default ssrMiddleware(({ app, resolve, render, serve }) => {
  // we capture any other Express route and hand it
  // over to Vue and Vue Router to render our page
  app.get(resolve.urlPath('*'), (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    // 介面語言
    const cookies = parseCookies(req)
    // Data generation will be reliable and complete for both server and client in the future.
    // 有cookie用cookie,不然抓req.headers['accept-language']
    const interfaceLanguage = cookies?.interfaceLanguage || initInterfaceLanguage(req)
    const token = cookies?.token
    // 查詢文章語言
    render(/* the ssrContext: */ { req, res, interfaceLanguage, token })

    render(/* the ssrContext: */ { req, res })
      .then(html => {
        // now let's send the rendered html to the client
        res.send(html)
      })
      .catch(err => {
        // oops, we had an error while rendering the page

        // we were told to redirect to another URL
        if (err.url) {
          if (err.code) {
            res.redirect(err.code, err.url)
          } else {
            res.redirect(err.url)
          }
        } else if (err.code === 404) {
          // hmm, Vue Router could not find the requested route

          // Should reach here only if no "catch-all" route
          // is defined in /src/routes
          res.status(404).send('404 | Page Not Found')
        } else if (process.env.DEV) {
          // well, we treat any other code as error;
          // if we're in dev mode, then we can use Quasar CLI
          // to display a nice error page that contains the stack
          // and other useful information

          // serve.error is available on dev only
          serve.error({ err, req, res })
        } else {
          // we're in production, so we should have another method
          // to display something to the client when we encounter an error
          // (for security reasons, it's not ok to display the same wealth
          // of information as we do in development)

          // Render Error Page on production or
          // create a route (/src/routes) for an error page and redirect to it
          res.status(500).send('500 | Internal Server Error')

          if (process.env.DEBUGGING) {
            console.error(err.stack)
          }
        }
      })
  })
})
