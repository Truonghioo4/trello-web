// export const API_ROOT = 'http://localhost:8017'

let apiRoot = ''
// eslint-disable-next-line no-undef
if(process.env.BUILD_MODE === 'dev'){
  apiRoot= 'http://localhost:8017'
}
// eslint-disable-next-line no-undef
if(process.env.BUILD_MODE === 'production'){
  apiRoot = 'https://trello-api-4837.onrender.com'
}
export const API_ROOT = apiRoot