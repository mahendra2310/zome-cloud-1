import { CloseOutlined } from "@ant-design/icons";
import { useState, memo } from "react";
import { useZxing } from "react-zxing";
import { useRouter } from 'next/router';
import { ReactComponent as LoginImage } from './scanner.svg';
import Link from 'next/link';

const Scanner = () => {
  // const [result, setResult] = useState<any>("");
  const router = useRouter();
  const { ref } = useZxing({
    onResult(result) {
      const Id = JSON.parse(JSON.stringify(result.getText()))
      router.push({
        pathname: '/signupdevice',
        query: {
          Id,
        }
      });
    },
  });

  const moveToSignupdevice = ()=>{
    router.push("/signupdevice")
  }


  return (
    <>
      <section className="login-banner bg-white">
        <div className="">
          <div className="lg:flex md:flex  align-content">
            <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height ">
              <div className="login-banner-img ">
                <LoginImage className="login-banner-img" />
              </div>
            </div>
            <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
              <div className="left">
                <div className="header device-text-style">
                  <h2 className="opensans-bold heading-title-text-color heading-title-size">
                    Welcome to ZOME
                  </h2><br/><br/>
                  { <div>
                    <div className="flex">
                      <video ref={ref} width="520" height="240" />
                      <CloseOutlined className="cursor-pointer" onClick={() => moveToSignupdevice()} />
                    </div>
                    <p>
                      {/* <span>Last result:</span> */}
                      {/* <span>{result}</span> */}
                    </p>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default memo(Scanner)
