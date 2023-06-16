import React, { FC, useEffect, useState } from 'react';
import styles from './dropdown.module.less';
import router from 'next/router';
import {
  CaretDownOutlined,
  ExportOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { Avatar, Badge, Popover, Menu, Button } from 'antd';
import { ReactComponent as UserImage } from './user.svg';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import Link from 'next/link';
/* eslint-disable-next-line */
export interface DropdownProps {}
const handleLogOut = () => {
  localStorage.removeItem('x-auth-token');
  localStorage.removeItem('token');
  localStorage.removeItem('userinfo');
  router.push('/');
};

const menu = (
  <Menu className={styles.avatarMenu}>
    <Menu.Item className={classNames(styles.dropdownMenu, styles.clinicHeader)}>
      <Link href="/feedback">
        <div className={styles.dropdownHeader}>
          <NotificationOutlined className={styles.dropdownIcon} />
          <span className={styles.headerText}>Feedback</span>
        </div>
      </Link>
    </Menu.Item>

    {/* <Menu.Item className={styles.dropdownMenu}>
      <div className={styles.dropdownHeader}>
        <QuestionCircleOutlined className={styles.dropdownIcon} />
        <span className={styles.headerText}>Help & Support</span>
      </div>
    </Menu.Item> */}

    {getUserInfo()?.role !== 'TENANT' || getUserInfo()?.role !== 'TenantAdministratorUser' && (
      <Menu.Item className={styles.dropdownMenu}>
        <Link href="/profile">
          <div>
            <UserOutlined className={styles.dropdownIcon} />
            <span className={styles.headerText}>Profile</span>
          </div>
        </Link>
      </Menu.Item>
    )}

    <Menu.Item onClick={handleLogOut} className={styles.dropdownMenu}>
      <div>
        <ExportOutlined className={styles.dropdownIcon} />
        <span className={styles.headerText}>Logout</span>
      </div>
    </Menu.Item>
  </Menu>
);

export function Dropdowns(props: DropdownProps) {
  return (
    <>
      <div className={styles.mobileViewNone}>
        <Popover
          content={menu}
          trigger="click"
          placement="bottomRight"
          overlayClassName={styles.avatarPopover}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '20px',
              cursor: 'pointer',
            }}
          >
            <Badge
              dot
              color="#65CD98"
              offset={[-2, 30]}
              size="default"
              style={{ height: '8px', width: '8px' }}
            >
              <Avatar size={40} icon={<UserImage />} className="element" />
            </Badge>
            <CaretDownOutlined
              style={{ paddingLeft: '5px', color: '#9292A3' }}
            />
          </div>
        </Popover>
      </div>
    </>
  );
}

export default Dropdowns;
