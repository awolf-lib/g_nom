import Notification from "./index.js";

export default {
  title: "components/Notification",
  component: Notification,
};

const Template = (args) => <Notification dispatch={() => {}} {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Success = Template.bind({});
Success.args = {
  label: "Success",
  message: "Successfully finished!",
  type: "success",
};

export const Error = Template.bind({});
Error.args = {
  label: "Error",
  message: "An error occured!",
  type: "error",
};

export const Info = Template.bind({});
Info.args = {
  label: "Info",
  message: "You are great!",
  type: "info",
};

export const Warning = Template.bind({});
Warning.args = {
  label: "Warning",
  message: "Only 15% power left!",
  type: "warning",
};
