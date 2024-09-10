const normalCookieOptions = process.env.NODE_ENV === 'production' ?
  { expires: 365, path: '/', sameSite: 'Strict', secure: true, domain: '.findpetmap.com' } :
  { expires: 365, path: '/', sameSite: 'Strict', secure: true }

export { normalCookieOptions }
