import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {pdfjs} from 'react-pdf';
import {createMuiTheme} from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/blue';
import common from '@material-ui/core/colors/common';
import {ThemeProvider} from '@material-ui/styles';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const theme = createMuiTheme({
    palette: {
        primary: {
            main: purple[600],
        },
        secondary: {
            main: common.black,
        },
    },
});

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <App/>
    </ThemeProvider>,
    document.getElementById('root')
);
