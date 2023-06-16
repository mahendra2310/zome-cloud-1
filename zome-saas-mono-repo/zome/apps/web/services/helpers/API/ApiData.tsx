import { API } from '../../config/API/api.config';
import * as authUtil from '../../utils/auth.util';
export const BaseURL = API['endpoint'] + '/';

const axios = require('axios').default;

const defaultHeaders = {
  isAuth: true,
  AdditionalParams: {},
  isJsonRequest: true,
  api_key: true,
};

export const ApiPostNoAuth = (type, userData) => {
  // const [loading] = useAxiosLoader();
  //console.log("In api post without auth", API);
  //console.log(BaseURL);
  return (
    // loading ? Loader()  :

    new Promise((resolve, reject) => {
      axios
        .post(
          BaseURL + type,
          userData,
          getHttpOptions({ ...defaultHeaders, isAuth: false })
        )
        .then((responseJson) => {
          //console.log("");
          resolve(responseJson);
        })
        .catch((error) => {
          if (
            error &&
            error.hasOwnProperty('response') &&
            error.response &&
            error.response.hasOwnProperty('data')
            // &&
            // error.response.data &&
            // error.response.data.hasOwnProperty("error") &&
            // error.response.data.error
          ) {
            resolve(error.response.data);
          } else {
            resolve(error);
          }
        });
    })
  );
};

export const ApiPutNoAuth = (type, userData) => {
  //console.log("In api put without auth", API);
  // console.log(BaseURL);
  // debugger
  return new Promise((resolve, reject) => {
    axios
      .put(
        BaseURL + type,
        userData,
        getHttpOptions({ ...defaultHeaders, isAuth: false })
      )
      .then((responseJson) => {
        //console.log("call no auth api");
        resolve(responseJson);
      })
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

export const ApiGetNoAuth = (type) => {
  return new Promise((resolve, reject) => {
    axios
      .get(BaseURL + type, getHttpOptions({ ...defaultHeaders, isAuth: false }))
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

export const Api = (type, methodtype, userData) => {
  return new Promise((resolve, reject) => {
    userData = userData || {};
    axios({
      url: BaseURL + type,
      headers: getHttpOptions(),
      data: userData,
      type: methodtype,
    })
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

export const ApiGet = (type) => {
  //console.log('token--', getHttpOptions());
  return new Promise((resolve, reject) => {
    axios
      .get(BaseURL + type, getHttpOptions())
      .then((responseJson) => {
        //console.log('helper-res--', responseJson);
        resolve(responseJson);
      })
      .catch((error) => {
        console.log('object--error', error);
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

// export const ApiPost = (type, userData, isDefaultHeader=false ) => {
//     return new Promise((resolve, reject) => {
//         // console.log("dataBody", userData);
//         const options = {  headers: isDefaultHeader ? getHttpOptions().headers : {} }
//         axios
//             .post(BaseURL + type, userData, options )
//             .then((responseJson) => {
//                 // console.log("responseJson",responseJson);
//                 resolve(responseJson);
//             })
//             .catch((error) => {
//                 console.log("error", error);

//                 if (
//                     error &&
//                     error.hasOwnProperty("response") &&
//                     error.response &&
//                     error.response.hasOwnProperty("data")
//                     // &&
//                     // error.response.data &&
//                     // error.response.data.hasOwnProperty("error") &&
//                     // error.response.data.error
//                 ) {
//                     console.log("reject");
//                     resolve(error.response.data);
//                 } else {
//                     console.log("reject", error);

//                     resolve(error);
//                 }
//             });
//     });
// };

export const ApiPost = (type, userData) => {
  return new Promise((resolve, reject) => {
    // console.log("dataBody", userData);
    axios
      .post(BaseURL + type, userData, {
        ...getHttpOptions(),
      })
      .then((responseJson) => {
        // console.log("responseJson",responseJson);
        resolve(responseJson);
      })
      .catch((error) => {
        console.log('error', error);

        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          //console.log('reject');
          resolve(error.response.data);
        } else {
          console.log('reject', error);

          resolve(error);
        }
      });
  });
};

export const ApiPut = (type, userData) => {
  return new Promise((resolve, reject) => {
    axios({
      url: BaseURL + type,
      method: 'put',
      headers: getHttpOptions().headers,
      data: userData,
    })
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

export const ApiPatch = (type, userData) => {
  return new Promise((resolve, reject) => {
    axios
      .patch(BaseURL + type, userData, getHttpOptions())
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

export const ApiDelete = (type, userData) => {
  return new Promise((resolve, reject) => {
    axios({
      url: BaseURL + type,
      method: 'delete',
      headers: getHttpOptions().headers,
      data: userData,
    })
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data);
        } else {
          resolve(error);
        }
      });
  });
};

export const ApiDownload = (type, userData) => {
  let method = userData && Object.keys(userData).length > 0 ? 'POST' : 'GET';
  return new Promise((resolve, reject) => {
    axios({
      url: BaseURL + type,
      method,
      headers: getHttpOptions().headers,
      responseType: 'blob',
      data: userData,
    })
      .then((res) => resolve(new Blob([res.data])))
      .catch((error) => {
        if (
          error &&
          error.hasOwnProperty('response') &&
          error.response &&
          error.response.hasOwnProperty('data')
          // &&
          // error.response.data &&
          // error.response.data.hasOwnProperty("error") &&
          // error.response.data.error
        ) {
          resolve(error.response.data.error);
        } else {
          resolve(error);
        }
      });
  });
};

export const ApiGetBuffer = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
      mode: 'no-cors',
    })
      .then((response: any) => {
        if (response.ok) {
          //console.log(response.headers.get('content-type'));
          //console.log(response);
          return response.buffer();
        } else {
          resolve(null);
        }
      })
      .then((buffer) => {
        resolve(buffer);
      })
      .catch((error) => {
        console.error(error);
        resolve(error);
      });
  });
};

export const getHttpOptions = (options = defaultHeaders) => {
  let headers = {};
  if (options.hasOwnProperty('isAuth') && options.isAuth) {
    if (authUtil.getToken()) {
      // headers['Authorization'] = authUtil.getToken();
      headers['x-auth-token'] = authUtil.getToken();
    } else if (authUtil.getAdminToken()) {
      headers['Authorization'] = authUtil.getAdminToken();
    }
  }

  if (options.hasOwnProperty('api_key') && options.api_key) {
    headers['api_key'] = '6QSy49rUTH';
  }
  if (options.hasOwnProperty('isJsonRequest') && options.isJsonRequest) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.hasOwnProperty('AdditionalParams') && options.AdditionalParams) {
    headers = { ...headers, ...options.AdditionalParams };
  }

  return { headers };
};
