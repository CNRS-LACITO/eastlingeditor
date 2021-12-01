import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

interface TabPanelProps {
  index: any;
  value: any;
  imageSrc: any;
}


function TabPanel(props: TabPanelProps) {
  const { value, index, imageSrc,...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
    <img src={imageSrc} />

    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

class Images extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 0
    };
  }

  render(){
    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
      this.setState({value: newValue});
    };

    var tabs = [];
    var tabPanels = [];
    var imageIndex = 0;

    this.props.images.forEach((i) =>{
      tabs.push(<Tab label={imageIndex+1} {...a11yProps(i.id)} />);
      tabPanels.push(<TabPanel value={this.state.value} index={imageIndex++} imageSrc={i.url}></TabPanel>);
    });

    return (
      <div>
        <AppBar position="static">
          <Tabs value={this.state.value} onChange={handleChange} aria-label="simple tabs example">
            {tabs}
          </Tabs>
        </AppBar>
        {tabPanels}
      </div>
    );
  }
  
}

export default Images;