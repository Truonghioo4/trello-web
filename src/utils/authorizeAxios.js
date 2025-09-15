import axios from "axios"
import { toast } from "react-toastify";
import { interceptorLoadingElements } from "./formatters";
import {refreshTokenAPI} from '~/apis'
import { logoutUserAPI } from "~/redux/user/userSlice"

/**
 * Không thể import { store } from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp: Inject store: là kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi component
 * như file authorizeAxios hiện tại
 * Hiểu đơn giản: khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi
 * hàm injectStore ngay lập tức để gán mainStore vào biến axiosReduxStore cục bộ trong file này.
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore
export const injectStore = mainStore => { axiosReduxStore = mainStore }

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.
let authorizeAxiosInstance = axios.create()
// Thời gian chờ tối đa của 1 request: để 10 phút
authorizeAxiosInstance.defaults.timeout = 1000*60*10
/* 
withCredentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên 
BE (phục vụ việc chúng ta sẽ lưu JWT tokens (refresh & access) vào trong httpOnly 
Cookie của trình duyệt) 
*/
authorizeAxiosInstance.defaults.withCredentials = true

// Cấu hình Interceptors
// Intercepter request: can thiệp vào giữa những request API
authorizeAxiosInstance.interceptors.request.use((config) => {
  // Kỹ thuật chặn spam click
  interceptorLoadingElements(true)

  return config;
}, (error) => {
  // Do something with request error
  return Promise.reject(error);
});

// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api
// bị lỗi trước đó.
// https://www.thedutchlab.com/en/insights/using-axios-interceptors-for-refreshing-your-api-token
let refreshTokenPromise = null

// Intercepter respone: can thiệp vào giữa những respone nhận về
authorizeAxiosInstance.interceptors.response.use((response) => {
  // Kỹ thuật chặn spam click
  interceptorLoadingElements(false)
  return response;
}, (error) => {
  // Kỹ thuật chặn spam click
  interceptorLoadingElements(false)

  /** Quan trọng: Xử lý Refresh Token tự động */
  // Trường hợp 1: Nếu như nhận mã 401 từ BE, thì gọi api đăng xuất luôn
  if(error.response?.status === 401)
    axiosReduxStore.dispatch(logoutUserAPI(false))

  // Trường hợp 2: Nếu như nhận mã 410 từ BE, thì sẽ gọi api refresh token để làm mới lại accessToken
  // Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
  const originalRequests = error.config
  if(error.response?.status === 410 && originalRequests){
    // Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gắn việc gọi api refresh_token đồng thời
    // gán vào cho cái refreshTokenPromise
    if(!refreshTokenPromise){
      refreshTokenPromise = refreshTokenAPI()
        .then(data => {
          // đồng thời access token này đã nằm trong httpOnly cookie
          return data?.accessToken
        })
        .catch((error) => {
          // Nếu nhận bất kì lỗi nào từ api refresh token thì cứ logout luôn
          axiosReduxStore.dispatch(logoutUserAPI(false))
          return Promise.reject(error)
        })
        .finally(() => {
          // Dù API có ok hay không thì vẫn luôn gán lại refreshTokenPromise là null
          refreshTokenPromise = null
        })
    }
    // Cần return trường hợp refreshTokenPromise chạy thành công và xử lý thêm ở đây:
    // eslint-disable-next-line no-unused-vars
    return refreshTokenPromise.then(accessToken => {
      /**
       * Bước 1: Đối với Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết
       * thêm code xử lý ở đây.
       * Hiện tại ở đây không cần bước 1 vì chúng ta đã đưa accessToken vào cookie (xử lý từ phía BE)
       * sau khi api refreshToken được gọi thành công.
       */


      // Bước 2: Bước Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để
      // gọi lại những api ban đầu bị lỗi
      return authorizeAxiosInstance(originalRequests)
    })
  }



  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
  //console.log error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
  let errorMessage = error?.message 
  if(error.response?.data?.message){
    errorMessage = error.response?.data?.message
  }
  // Dùng toastify để hiển thị bất kệ mọi mã lỗi lên màn hình – Ngoại trừ mã 410 – GONE phục vụ việc tự động refresh lại token.
  if(error.response?.status !== 410) toast.error(errorMessage)
  return Promise.reject(error);
});


export default authorizeAxiosInstance


