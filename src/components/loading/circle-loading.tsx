import { Spin } from 'antd';

export function CircleLoading() {
  return (
    <div className="mt-[-4.5rem] flex min-h-screen items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
