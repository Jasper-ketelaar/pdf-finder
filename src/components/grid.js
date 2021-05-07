import React, {useEffect, useState} from 'react';
import MuiGrid from '@material-ui/core/Grid';
import PdfContainer from './pdf';

const Grid = (props) => {
    const [pdfs, setPdfs] = useState([]);
    const name = props.name;
    const qty = props.qty;
    const qry = props.qry
    useEffect(() => {
        const temp = [];
        for (let i = 1; i <= qty; i++) {
            temp.push(`pdf/${name}-${i}.pdf`);
        }

        setPdfs(temp);
    }, [qty, name]);

    const [jsx, setJsx] = useState([]);
    useEffect(() => {
        const jsx = pdfs.map(pdf => {
            return (
                <PdfContainer key={pdf} qry={props.qry} file={pdf}/>
            );
        });

        setJsx(jsx);
    }, [pdfs, qry])


    return (
        <MuiGrid
            className={'pdfgrid'}
            container
            direction="row"
            justify="center"
            alignItems="center">
            {jsx}
        </MuiGrid>
    )
};

export default Grid;
