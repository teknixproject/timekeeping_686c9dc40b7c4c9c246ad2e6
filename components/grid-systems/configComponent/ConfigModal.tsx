/* eslint-disable @typescript-eslint/no-unused-vars */
import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { Modal } from 'antd';
import React from 'react'

const ConfigModal = (props: any) => {
    const { getData, dataState } = useHandleData({ dataProp: props?.data?.data });
    const { handleAction } = useActions();

    return (
        <Modal {...props} open={dataState} onCancel={handleAction} onOk={handleAction} />
    )
}

export default ConfigModal