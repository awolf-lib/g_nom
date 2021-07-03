import Button from "./index.js";

export default {
  title: "components/Button",
  component: Button,
};

const Template = (args) => <Button {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const primarySM = Template.bind({});
primarySM.args = { label: "Button", color: "primary", size: "sm" };

export const primaryMD = Template.bind({});
primaryMD.args = { label: "Button", color: "primary", size: "md" };

export const primaryLG = Template.bind({});
primaryLG.args = { label: "Button", color: "primary", size: "lg" };

export const primaryXL = Template.bind({});
primaryXL.args = { label: "Button", color: "primary", size: "xl" };

export const secondary = Template.bind({});
secondary.args = { label: "Button", color: "secondary", size: "md" };

export const confirm = Template.bind({});
secondary.args = { label: "Button", color: "confirm", size: "md" };

export const cancel = Template.bind({});
secondary.args = { label: "Button", color: "cancel", size: "md" };

export const nav = Template.bind({});
nav.args = { label: "Button", color: "nav", size: "md" };

export const link = Template.bind({});
link.args = { label: "Button", color: "link", size: "md" };
