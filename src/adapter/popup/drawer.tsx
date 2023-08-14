import { Drawer as AntDrawer, Button, DrawerProps, Space } from "antd";

import { CommonPopupProps } from "./type";

const Drawer = (props: CommonPopupProps) => {
  const {
    title,
    open,
    onOk,
    onClose,
    children,
    componentProps,
    confirmLoading,
  } = props;

  const drawerProps = (componentProps || {}) as any;

  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Space size={30}>
        <Button onClick={onClose}>取消</Button>
        <Button loading={confirmLoading} onClick={() => onOk()} type="primary">
          确定
        </Button>
      </Space>
    </div>
  );

  return (
    <AntDrawer
      width={drawerProps?.width || 800}
      title={title}
      footer={footer}
      open={open}
      onClose={onClose}
      maskClosable={false}
      {...drawerProps}
    >
      {children}
    </AntDrawer>
  );
};

export default Drawer;
