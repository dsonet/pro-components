import { mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ProTable from '@ant-design/pro-table';
import { waitForComponentToPaint } from '../util';
import { FormInstance } from 'antd/lib/form';

describe('BasicTable Search', () => {
  const LINE_STR_COUNT = 20;
  // Mock offsetHeight
  // @ts-expect-error
  const originOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
    .get;
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    get() {
      let html = this.innerHTML;
      html = html.replace(/<[^>]*>/g, '');
      const lines = Math.ceil(html.length / LINE_STR_COUNT);
      return lines * 16;
    },
  });

  // Mock getComputedStyle
  const originGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = (ele) => {
    const style = originGetComputedStyle(ele);
    style.lineHeight = '16px';
    return style;
  };

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: originOffsetHeight,
    });
    window.getComputedStyle = originGetComputedStyle;
  });

  it('🎏 table type=form', async () => {
    const fn = jest.fn();
    const html = mount(
      <ProTable
        type="form"
        size="small"
        columns={[
          {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: '状态',
            dataIndex: 'status',
            hideInForm: true,
            filters: true,
            valueEnum: {
              0: { text: '关闭', status: 'Default' },
              1: { text: '运行中', status: 'Processing' },
              2: { text: '已上线', status: 'Success' },
              3: { text: '异常', status: 'Error' },
            },
          },
        ]}
        onSubmit={fn}
        rowKey="key"
      />,
    );
    await waitForComponentToPaint(html, 500);
    act(() => {
      html.find('.ant-form button.ant-btn-primary').simulate('click');
    });

    await waitForComponentToPaint(html);
    expect(fn).toBeCalledTimes(1);

    /**
     * 修改值
     */
    act(() => {
      html
        .find('.ant-form input.ant-input')
        .at(0)
        .simulate('change', {
          target: {
            value: 'name',
          },
        });
    });

    act(() => {
      html.find('.ant-form button.ant-btn-primary').simulate('click');
    });

    await waitForComponentToPaint(html);

    expect(fn).toBeCalledWith({
      name: 'name',
    });
  });

  it('🎏 table type=form and formRef', async () => {
    const fn = jest.fn();
    const ref = React.createRef<FormInstance | undefined>();
    const html = mount(
      <ProTable
        // @ts-ignore
        formRef={ref}
        type="form"
        size="small"
        columns={[
          {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: '状态',
            dataIndex: 'status',
            hideInForm: true,
            filters: true,
            valueEnum: {
              0: { text: '关闭', status: 'Default' },
              1: { text: '运行中', status: 'Processing' },
              2: { text: '已上线', status: 'Success' },
              3: { text: '异常', status: 'Error' },
            },
          },
        ]}
        onSubmit={fn}
        rowKey="key"
      />,
    );
    await waitForComponentToPaint(html, 500);
    /**
     * 修改值
     */
    act(() => {
      ref.current?.setFieldsValue({
        name: 'name',
      });
    });

    act(() => {
      html.find('.ant-form button.ant-btn-primary').simulate('click');
    });

    await waitForComponentToPaint(html);

    expect(fn).toBeCalledWith({
      name: 'name',
    });
  });
});
