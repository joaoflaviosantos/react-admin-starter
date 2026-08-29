import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { SignInReq } from '@/api/services/authService';
import { useSignIn, useUserInfo, useUserToken } from '@/store/userStore';
import { isUserWithPermissionsRead } from '@/utils/permission';

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/';

export default function LoginPage() {
  const [form] = Form.useForm<SignInReq>();
  const [loading, setLoading] = useState(false);
  const token = useUserToken();
  const userInfo = useUserInfo();
  const signIn = useSignIn();

  if (token.access_token && isUserWithPermissionsRead(userInfo)) {
    return <Navigate to={HOMEPAGE} replace />;
  }

  const handleFinish = async (values: SignInReq) => {
    setLoading(true);
    try {
      await signIn(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ant-bg-layout p-6">
      <Card className="w-full max-w-md shadow-sm">
        <Typography.Title level={3} className="!mb-2">
          Sign in
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-6">
          Mock demo accounts for local development.
        </Typography.Paragraph>

        <Alert
          type="info"
          showIcon
          className="!mb-6"
          message="Demo credentials"
          description={
            <ul className="mb-0 list-disc pl-4">
              <li>
                Admin: <strong>admin</strong> / <strong>admin123</strong>
              </li>
              <li>
                Viewer: <strong>viewer</strong> / <strong>viewer123</strong>
              </li>
            </ul>
          }
        />

        <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username is required.' }]}
          >
            <Input autoComplete="username" placeholder="admin or viewer" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required.' }]}
          >
            <Input.Password autoComplete="current-password" placeholder="Password" />
          </Form.Item>
          <Form.Item className="!mb-0">
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
