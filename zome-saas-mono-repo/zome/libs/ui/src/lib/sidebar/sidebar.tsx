import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserFriends,
  faIdCard,
  faCog,
  faBars,
  faLocationArrow,
  faClipboardList,
  faUsers,
  faLink,
  faBuilding,
  faSquareFull,
  faHospital,
  faTasks,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'antd';

import {
  QuestionCircleOutlined,
  DashboardOutlined,
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import './sidebar.module.less';
import { faGoodreads } from '@fortawesome/free-brands-svg-icons';

/* eslint-disable-next-line */
export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
  let userRole = getUserInfo()?.role;
  const [sideBarOpen, setSideBarOpen] = useState(true);
  const [sideBarClass, setSideBarClass] = useState('s-layout__content');
  const [sideBarOpenClass, setSideBarOpenClass] = useState('s-sidebar__nav');

  const handleChangeClass = (sideBarOpen) => {
    if (sideBarOpen === true) {
      setSideBarClass('left_side_space_remove');
      setSideBarOpenClass('s-sidebar__nav1');
    } else {
      setSideBarClass('s-layout__content');
      setSideBarOpenClass('s-sidebar__nav');
    }
    setSideBarOpen(!sideBarOpen);
  };
  const handleRole = () => {
    if (userRole == 'TENANT' || userRole == 'TenantAdministratorUser' ) {
      return false;
    } else if (userRole === '`tenant' || userRole == 'TenantAdministratorUser') {
      return false;
    } else if(userRole === 'property-owner' || userRole === 'property_owner'){
      return false;
    }
    else if(userRole === 'property-manager' || userRole === 'property_manager'){
      return false;
    }
    else {
      return true;
    }
  };

  const isUserManager = () => {
    if (userRole === "property-manager" || userRole === 'property_manager') {
      return true;
    } else {
      return false;
    }
  };
  return (
      <div className="s-layout__sidebar bg-white cursor-pointer">
        <nav className={`${sideBarOpenClass} sidebar-top-align-space`}>
          <ul>
            <li onClick={() => handleChangeClass(sideBarOpen)}>
              <p className="s-sidebar__nav-link">
                <div className="svg-icon">
                  {sideBarOpen === true ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )}
                </div>
              </p>
            </li>
            <li>
              <Link href="/dashboard">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Dashboard">
                    <div className="svg-icon font-bold">
                      <DashboardOutlined />
                    </div>
                  </Tooltip>
                  <em>Dashboard</em>
                </p>
              </Link>
            </li>
            <li>
            {handleRole()  && (
              <Link href="/watchlist">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Watchlist">
                    <div className="svg-icon">
                      <FontAwesomeIcon icon={faClipboardList} />
                    </div>
                  </Tooltip>
                  <em>Watchlist</em>
                </p>
              </Link>
            )}
            </li>
            <li>
              <Link href="/properties">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="All Properties">
                    <div className="svg-icon">
                      <FontAwesomeIcon icon={faTasks} />
                    </div>
                  </Tooltip>
  
                  <em>All Properties</em>
                </p>
              </Link>
            </li>
            <li>
            {!isUserManager()  && (
              <Link href="/vacancy">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Vacancy Mode">
                    <div className="svg-icon">
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                  </Tooltip>
  
                  <em>Vacancy Mode</em>
                </p>
              </Link>
            )} 
            </li>
            <li>
            
              <Link href="/location">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Map View">
                    <div className="svg-icon">
                      <FontAwesomeIcon icon={faLocationArrow} />
                    </div>
                  </Tooltip>
  
                  <em>Map View</em>
                </p>
              </Link>
            
            </li>
            <li>
              <Link href="/users">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Users">
                    <div className="svg-icon">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                  </Tooltip>
  
                  <em>Users</em>
                </p>
              </Link>
            </li>
            <li>
            {handleRole()  && (
              <Link href="/quickconnect">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Quick Connect">
                    <div className="svg-icon">
                      <FontAwesomeIcon icon={faLink} />
                    </div>
                  </Tooltip>
  
                  <em>Quick Connect</em>
                </p>
              </Link>
            )}  
            </li>
            <li>
            {handleRole()  && (
              <Link href="/downloads">
                <p className="s-sidebar__nav-link">
                  <Tooltip placement="right" title="Downloads">
                    <div className="svg-icon">
                      <DownloadOutlined />
                    </div>
                  </Tooltip>
  
                  <em>Downloads</em>
                </p>
              </Link>
            )}
            </li>
            <li className="end-menu">
              <li className="w-full">
                {/* {handleRole()  && ( */}
                  <div className="sidebar-hover">
                    <li className="cus-hover">
                      <Link href="/administration">
                        <p className="s-sidebar__nav-link">
                          <Tooltip placement="right" title="Administration">
                            <div className="svg-icon">
                              <FontAwesomeIcon icon={faUserFriends} />
                            </div>
                          </Tooltip>
  
                          <em>Administration</em>
                        </p>
                      </Link>
                    </li>
                  </div>
                {/* )} */}
                <li>
                  <Link href="/profile">
                    <p className="s-sidebar__nav-link">
                      <Tooltip placement="right" title="Profile">
                        <div className="svg-icon">
                          <FontAwesomeIcon icon={faIdCard} />
                        </div>
                      </Tooltip>
  
                      <em>Profile</em>
                    </p>
                  </Link>
                </li>
                <li>
                  <Link href="/help">
                    <p className="s-sidebar__nav-link">
                      <Tooltip placement="right" title="Help and Support">
                        <div className="svg-icon">
                          <QuestionCircleOutlined />
                        </div>
                      </Tooltip>
  
                      <em>Help and Support</em>
                    </p>
                  </Link>
                </li>
              </li>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
  
  export default Sidebar;
  