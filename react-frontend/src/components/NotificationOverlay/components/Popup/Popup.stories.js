import Popup from "../../index.js";

export default {
  title: "components/Popup",
  component: Popup,
};

const Template = (args) => <Popup {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const All = Template.bind({});
All.args = {
  notifications: [
    {
      label: "Error",
      type: "error",
      message: "This is an example error!",
    },
    {
      label: "Warning",
      type: "warning",
      message: "This is an example warning!",
    },
    {
      label: "Info",
      type: "info",
      message: "This is an example info!",
    },
    {
      label: "Success",
      type: "success",
      message: "This is an example success!",
    },
  ],
};

export const Error = Template.bind({});
Error.args = {
  notifications: [
    {
      label: "Error",
      type: "error",
      message: "This is an example error!",
    },
  ],
};

export const Warning = Template.bind({});
Warning.args = {
  notifications: [
    {
      label: "Warning",
      type: "warning",
      message: "This is an example warning!",
    },
  ],
};

export const Info = Template.bind({});
Info.args = {
  notifications: [
    {
      label: "Info",
      type: "info",
      message: "This is an example info!",
    },
  ],
};

export const Success = Template.bind({});
Success.args = {
  notifications: [
    {
      label: "Success",
      type: "success",
      message: "This is an example success!",
    },
  ],
};
