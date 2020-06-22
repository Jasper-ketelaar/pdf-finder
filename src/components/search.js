import React from 'react';
import {TextField} from '@material-ui/core';

const Search = (props) => {
    return (
        <TextField
            value={props.qry}
            onChange={(evt) => props.setQry(evt.target.value)}
            label={'Zoek op text...'}
            color={'secondary'}
            variant='outlined'/>
    );
};

export default Search;