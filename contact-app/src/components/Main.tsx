import { Button, Col, Divider, Drawer, Form, Input, Row, Space, Table, Typography, Avatar, Flex, Modal, message } from 'antd';
import { useEffect, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { SearchProps } from 'antd/es/input/Search';
import type { TableProps } from 'antd';

const { Search } = Input;
const { Title, Paragraph } = Typography;

interface DataType {
  key: string;
  id: string;
  name: string;
  description: string;
  photo: string;
}

const Main: React.FC = () => {

  const { contacts, getContacts, addContact, removeContact, currentPage, currentLimit, totalContacts } = useApi();
  const [form] = Form.useForm();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const success = (actionSuccess: string) => {

    const messageSuccess = actionSuccess === 'add' ? '¡Contacto agregado correctamente!' : '¡Contacto eliminado correctamente!'
    const typeSuccess = actionSuccess === 'add' ? 'success' : 'error'

    messageApi.open({
      type: typeSuccess,
      content: messageSuccess,
    });
  };

  useEffect(() => {
    getContacts();
  }, [currentPage]);

  /*
  useEffect(() => {
    console.log("Usuarios:", contacts);
  }, [contacts]);
  */

  const showDrawer: () => void = () => {
    setOpenDrawer(true);
  }

  const onClose: () => void = () => {
    setOpenDrawer(false)
  }

  const handleRemoveContact = (contactId: string) => {
    Modal.confirm({
      title: '¿Desea borrar este contacto?',
      content: 'Una vez borrado no podrá recuperarlo',
      onOk: () => okRemoveContact(contactId),
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    }
    )
  };

  const okRemoveContact = async (contactId: string) => {
    try {
      await removeContact(contactId);
      success('remove');
    } catch (error) {
      console.error('Error removing contact:', error)
    }

  };

  const onFinish = async (values: any) => {
    try {
      await addContact(values);
      onClose();
      form.resetFields();
      success('add');
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  }

  const onSearch: SearchProps['onSearch'] = (value, event) => {
    getContacts(value);
  }

  const onChange: SearchProps['onChange'] = (event) => {
    const value = event.target.value;
    getContacts(value);
  }

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'id',
      width: '12rem',
      className: 'data-table--column-name',
      render: (_, record) => (
        <Flex gap="large" align='center'>
          {record.photo ? (
            <Avatar src={record.photo} />
          ) : (
            <Avatar>{record.name}</Avatar>
          )}
          <Typography>{record.name}</Typography>
        </Flex>
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      className: 'data-table--column-description',
    },
    {
      title: 'Acciones',
      dataIndex: 'action',
      width: '10rem',
      align: 'center',
      className: 'data-table--column-action',
      render: (_, record) => (
        <DeleteOutlined className='delete-icon' onClick={() => {
          handleRemoveContact(record.id)
        }} />
      ),
    }
  ]

  const paginationConfig: TableProps<DataType>['pagination'] = {
    current: currentPage,
    pageSize: currentLimit,
    total: totalContacts,
    onChange: (current, pageSize) => {
      getContacts(undefined, current, pageSize);


    },
    onShowSizeChange: (current, size) => {
      getContacts(undefined, current, size)
    }
  }

  return (

    <div className='container'>
      <Typography>
        <Title>Agenda Previred - Mi agenda de contactos laboral</Title>
        <Paragraph>
          Aquí podrá encontrar o buscar a todos sus contactos agregados, agregar nuevos contactos y eliminar contactos no deseados.
        </Paragraph>
      </Typography>

      <Space direction='vertical'>
        <Button
          type='primary'
          onClick={showDrawer}
          icon={<PlusOutlined />}
        >
          Agregar Contacto
        </Button>

        <Search placeholder="input search text" allowClear onSearch={onSearch} onChange={onChange} style={{ width: 200 }} />
      </Space>

      <Divider />

      <Table rowKey="id" columns={columns} dataSource={contacts} pagination={paginationConfig} />

      <Drawer
        title='Agregar nuevo Contacto'
        onClose={onClose}
        open={openDrawer}
        width={'42%'} /* 65rem */
        extra={
          <Space>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type='primary' htmlType='submit' onClick={() => form.submit()}>Guardar</Button>
          </Space>
        }
      >
        <Form form={form} layout='vertical' onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="photo"
                label="URL imagen de Perfil"
                rules={[{ required: true, message: 'Por favor, ingrese url de la imagen de perfil' }]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="Inserte la URL de la imagen de perfil"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Nombre"
                rules={[{ required: true, message: 'Por favor, escriba el nombre de contacto' }]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="Escriba el nombre de contacto"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Descripción"
                rules={[{ required: true, message: 'Por favor, agregue la descripción del contacto' }]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="Agregue la descripción del contacto"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {contextHolder}

    </div>

  );
}

export default Main;