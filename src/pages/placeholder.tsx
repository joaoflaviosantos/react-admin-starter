import { Button, Space, Typography } from 'antd';

import { useSignOut, useUserInfo } from '@/store/userStore';

export default function PlaceholderPage() {
  const userInfo = useUserInfo();
  const signOut = useSignOut();

  return (
    <div className="min-h-screen bg-ant-bg-layout p-12">
      <Space direction="vertical" size="large" className="w-full max-w-2xl">
        <div>
          <Typography.Title level={2} className="!mb-2">
            Authenticated area
          </Typography.Title>
          <Typography.Paragraph>
            You are signed in. This is a temporary home page until the dashboard shell, settings,
            and admin screens are added.
          </Typography.Paragraph>
        </div>

        {userInfo.name && (
          <Typography.Paragraph>
            Signed in as <strong>{userInfo.name}</strong> ({userInfo.email}) — role{' '}
            <strong>{userInfo.role_label ?? userInfo.role}</strong>.
          </Typography.Paragraph>
        )}

        <Button onClick={signOut}>Log out</Button>
      </Space>
    </div>
  );
}
