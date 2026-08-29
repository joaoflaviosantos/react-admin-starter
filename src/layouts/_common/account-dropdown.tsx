import { Avatar, Divider, MenuProps } from 'antd';
import Dropdown, { DropdownProps } from 'antd/es/dropdown/dropdown';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/icon';
import { useSignOut, useUserInfo } from '@/store/userStore';
import { useThemeToken } from '@/theme/hooks';
import { getColorFromName } from '@/utils/colors';
import { getInitials } from '@/utils/format-string';

export default function AccountDropdown() {
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  const { t } = useTranslation();

  const logout = () => {
    signOut();
  };

  const { colorBgElevated, borderRadiusLG, boxShadowSecondary } = useThemeToken();

  const contentStyle: React.CSSProperties = {
    backgroundColor: colorBgElevated,
    borderRadius: borderRadiusLG,
    boxShadow: boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: 'none',
  };

  const dropdownRender: DropdownProps['dropdownRender'] = (menu) => (
    <div style={contentStyle}>
      <div className="flex flex-col items-start p-4">
        <div>{userInfo.name}</div>
        <div className="text-gray">{userInfo.email}</div>
        <div className="font-semibold opacity-60">{userInfo.role_label ?? userInfo.role}</div>
      </div>
      <Divider style={{ margin: 0 }} />
      {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
    </div>
  );

  const items: MenuProps['items'] = [
    {
      label: <button className="font-bold text-warning">{t('sys.login.logout')}</button>,
      key: 'logout',
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} dropdownRender={dropdownRender}>
      <IconButton className="h-11 w-11 transform-none px-0">
        {userInfo.profile_image_url ? (
          <Avatar size="default" src={userInfo.profile_image_url} />
        ) : (
          <Avatar
            size="default"
            style={{
              backgroundColor: getColorFromName(userInfo.name || ''),
              fontSize: '0.7rem',
            }}
          >
            {getInitials(userInfo.name || '', 2)}
          </Avatar>
        )}
      </IconButton>
    </Dropdown>
  );
}
