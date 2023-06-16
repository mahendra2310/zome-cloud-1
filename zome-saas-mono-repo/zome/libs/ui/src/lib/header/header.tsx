/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faCalendarAlt,
  faRecycle,
  faEdit,
  faWindowClose,
  faTachometerAlt,
  faUserFriends,
  faChartLine,
  faFolder,
  faShippingFast,
  faIdCard,
  faCog,
  faSearch,
  faBell,
  faEnvelope,
  faPlusCircle,
  faUser,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
// import { ApiGet } from 'apps/web/services/helpers/API/ApiData';
import { Logo, Dropdowns } from '@zome/ui';
import './header.module.less';
import { ReactComponent as UserImage } from './user.svg';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import Link from 'next/link';
import { useLocation } from "react-router-dom";
import { ConsoleSqlOutlined, PropertySafetyFilled } from '@ant-design/icons';


/* eslint-disable-next-line */
export interface HeaderProps {
  [x: string]: any;
}



export function Header(props: HeaderProps) {
  let userRole = getUserInfo()?.role;
  const handleSearch = (e) => {
    setTimeout(() => {
      props.data(e.target.value);
    }, 1500);
  };
  
  const showSearchBar = () => {
    if (!props.showSearch) {
      return false;
    } else if (props.showSearch == "true") {
      return true;
    } else {
      return false;
    }
  };

  const handleRole = () => {
    if (userRole == 'TENANT') {
      return false;
    } else if (userRole == 'tenant') {
      return false;
    } else {
      return true;
    }
  };

  const hideNavItems = () => {
    if (userRole == 'support') {
      return true;
    } else {
      return false;
    }
  }
  return (
    <header>
      <div className="container-fluid">
        <div className="lg:flex lg:flex-wrap md:flex md:flex-wrap">
          <div className="lg:w-1/3 md:w-1/4 pr-3">
            <Link href="/dashboard">
              <div className="company_logo mobile-view-align cursor-pointer">
                <Logo />
                <div className="profile mr-4 m-mr-0 mobile-view-show">
                  <Dropdowns />
                </div>
              </div>
            </Link>
          </div>

          <div className="lg:w-1/3 md:w-2/6 flex items-center justify-center mobile-view-none">
            <div>
              <div className="relative flex w-full flex-wrap items-stretch">
                {handleRole() && showSearchBar() && (
                  <>
                    <span className="z-10 h-full  absolute text-center text-blueGray-300 flex absolute bg-transparent rounded  items-center justify-center w-8 pl-3 py-3">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="search-icon-color"
                      />
                    </span>

                    <input
                      type="search"
                      placeholder="Search gateways here"
                      className="search-inout-style px-3 py-3 relative bg-white rounded  outline-none focus:outline-none pl-10"
                      onChange={(e) => handleSearch(e)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 md:w-2/5 pl-3 flex items-center justify-end mobile-view-none">
            <div className="cursor-pointer">
            {hideNavItems() && (
              <FontAwesomeIcon
                icon={faBell}
                className="search-icon-color mr-4"
              />
            )}
            </div>
            <div className="cursor-pointer">
            {hideNavItems() && (
              <FontAwesomeIcon
                icon={faEnvelope}
                className="search-icon-color mr-4"
              />
            )}
            </div>
            {/* <div className="create-btn mr-4">
              <button className="create-btn-style">
                <FontAwesomeIcon
                  icon={faPlusCircle}
                  className="plus-icon-color"
                />
                <span>Create </span>
              </button>
            </div> */}

            <div className="profile mr-4">
              <Dropdowns />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
