import React, {useEffect} from "react";
import "./App.css";
import DatepickerTillNow from "./components/datepicker-till-now.tsx";
import dayjs from "dayjs";
import {Button, Form} from "antd";


function App() {
  const [form] = Form.useForm();

  useEffect(() => {
    const dd = dayjs();
    dd.tillNow = true;
    form.setFieldValue('date', dd)
    // form.setFieldValue('date_range', [dayjs("2023-10-01"), dd])
  }, [])

  const handleClick = () => {
    const values = form.getFieldsValue();
    if (values?.date) {
      values.date = dayjs(values.date.tillNow ? "2099-12-31" : values.date).format("YYYY-MM-DD");
    }
    console.log(values)
  }

  return <div>
    <Form form={form} labelCol={{ span: 5 }}>
      <Form.Item name="date" label="日期选择">
        <DatepickerTillNow />
      </Form.Item>
      <Form.Item name="date_range" label="区间日期选择">
        <DatepickerTillNow.RangePicker />
      </Form.Item>
    </Form>
    <Button onClick={handleClick}>提交</Button>
  </div>;
}

export default App;
