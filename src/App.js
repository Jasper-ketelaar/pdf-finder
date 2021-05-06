import React, {useState} from 'react';
import './App.scss';
import {Box, FormGroup, TextField} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from './components/grid';

const NAMES = ["lecture"];
const AMTS = [1];

function App() {
    const [qry, setQry] = useState("");
    const [tab, setTabRaw] = useState(0);
    const setTab = (evt, val) => {
        setTabRaw(val);
    };

    return (
        <Box className="container">
            <AppBar position="static" className={'appbar'}>
                <Toolbar>
                    <FormGroup className={'search'}>
                        <TextField
                            value={qry}
                            onChange={(evt) => setQry(evt.target.value)}
                            label={'Zoek op text...'}
                            color={'secondary'}
                            variant='outlined'/>
                    </FormGroup>
                </Toolbar>
            </AppBar>
            <Tabs
                className={'tab-bar'}
                value={tab}
                centered
                onChange={setTab}
                indicatorColor="primary"
                textColor="primary"
                aria-label="disabled tabs example"
            >
                <Tab label="Lectures"/>
                <Tab label="Examens"/>
                <Tab label="Lab oefeningen"/>
                <Tab label='Boek'/>
            </Tabs>
            <Grid name={NAMES[tab]} qry={qry} qty={AMTS[tab]}/>
        </Box>
    );
}

export default App;
