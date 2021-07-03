import LoadingSpinner from "./index.js";

export default {
  title: "components/LoadingSpinner",
  component: LoadingSpinner,
};

const Template = (args) => <LoadingSpinner {...args} />;

export const Default = Template.bind({});
Default.args = {};
