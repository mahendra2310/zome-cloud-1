import React, { useEffect, useState, useRef } from 'react';
import './location.moduel.less';
//import { ApiGet } from 'apps/web/services/helpers/API/ApiData';
import { Header, Sidebar, Tabledesign, Chart, } from '@zome/ui';
import router, { useRouter } from 'next/router';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import 'rxjs/add/operator/map';
//import mapboxgl from 'mapbox-gl';

import { ApiGet } from '../../services/helpers/API/ApiData';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import dynamic from "next/dynamic";
import styled from "styled-components";

const MapComponent = dynamic(() => import("libs/ui/src/lib/map/map"), {
  // loading: () => "Loading...",
  ssr: false
});



// mapboxgl.accessToken = 'AIzaSyDpshvRZFQ8qoqHCJhqF11ZlLZdLAFQ5tk';
export function Index() {
  const myref = useRef();

  const router = useRouter();

  const [apiCall, setApiCall] = useState(false);
  const [propsData, setPropsData] = useState(false);
  const [locations, setLocations] = useState([]);
  let userRole = getUserInfo()?.role;
  // const mapContainer = useRef(null);
  // const map = useRef(null);
  // const [lng, setLng] = useState(-70.9);
  // const [lat, setLat] = useState(42.35);
  // const [zoom, setZoom] = useState(9);

  // useEffect(() => {
  //   if (map.current) return; // initialize map only once
  //   map.current = new mapboxgl.Map({
  //     container: mapContainer.current,
  //     style: 'mapbox://styles/mapbox/streets-v11',
  //     center: [lng, lat],
  //     zoom: zoom,
  //   });
  // });
  //const [gateWayName, setGateWay] = useState([]);
  //const [uuId, setUUid] = useState('');
  //const [gateName, setGateName] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('x-auth-token') : null;
  //console.log(token && token);
  // useEffect(() => {
  //   const getAllDetails = async () => {
  //     await ApiGet("getall-device")
  //       .then((res: any) => {
  //         console.log(res.data);
  //         // setData(res.data);
  //       })
  //       .catch((err) => {
  //         console.log("error in get data!!");
  //       });
  //   };
  // //   setLogindata(localStorage.getItem("token"));
  // //   console.log(localStorage.getItem("token"));
  // //   console.log(logindata);
  // getAllDetails();
  // }, []);


  useEffect(() => {
    const getallPropertyForMap = async () => {
      await ApiGet('properties')
        .then((res: any) => {
          const datas = res.data.data;
          for (let i = 0; i < datas.length; i++) {
            datas[i].latitude = 1 * datas[i].latitude;
            datas[i].longitude = 1 * datas[i].longitude;
          }
          setLocations(datas);
        })
        .catch((err) => {
          console.log(err, 'error in getting map data!!');
        });
    };
    getallPropertyForMap();
  }, []);


  const tokenNotValid = () => {
    typeof window !== 'undefined' ? (
      router.push('/')
    ) : (
      <h1>not working router push</h1>
    );
  };
  useEffect(() => {
    if (!getUserInfo()) {
      router.push('/');
    }
  }, [])
  // useEffect(() => {
  //   const getAllGateWay = async () => {
  //     await ApiGet('get-gateway')
  //       .then((res: any) => {
  //         //console.log(res.data);
  //         setGateWay(res.data);
  //         // setData(res.data);
  //       })
  //       .catch((err) => {
  //         console.log('error in get data!!');
  //       });
  //   };
  //   //console.log(modal);
  //   getAllGateWay();
  // }, []);

  const handleChangeSubmit = (id, name) => {
    setApiCall(true);
    //setUUid(id);
    //setGateName(name);
  };

  const handleChangeSubmitBack = () => {
    setApiCall(false);
    window.location.reload;
  };

  return (
    <>
      {token ? (
        <div>
          <Header />
          <div className="flex">
            <div className="s-layout">
              <Sidebar />
              <main className={`s-layout__content `}>
                <div className="font-weight-bold ml-8 mt-24">
                  <Breadcrumb>
                    <Link href="/dashboard">
                      <Breadcrumb.Item className="cursor-pointer">
                        <HomeOutlined />
                        <span>Home</span>
                      </Breadcrumb.Item>
                    </Link>

                    <Breadcrumb.Item className="cursor-pointer ">
                      <span>Map View</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <div className="container-fluid pt-20">
                  <div className="w-full">
                    {/* <div className="font-weight-bold">
                      <ArrowLeftOutlined
                        onClick={() => handleChangeSubmitBack()}
                      />
                    </div> */}
                    <h1>Map View</h1>
                    <Container>
                      <MapComponent locations={locations} />
                    </Container>
                    {/* <div>
                      <div ref={mapContainer} className="map-container" />
                    </div> */}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      ) : (
        tokenNotValid()
      )}
    </>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`;
export default Index;
