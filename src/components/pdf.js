import React, {useEffect, useState} from 'react';
import {Document, Page} from 'react-pdf';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import elastic from 'elasticlunr';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

function highlightPattern(text, pattern) {
    pattern = pattern.split(' ').join('|');
    const splitText = text.split(RegExp(pattern, 'i'));

    if (splitText.length <= 1) {
        return text;
    }

    const matches = text.match(RegExp(pattern, 'i'));

    return splitText.reduce((arr, element, index) => (matches[index] ? [
        ...arr,
        element,
        <mark key={index}>
            {matches[index]}
        </mark>,
    ] : [...arr, element]), []);
}

function removeTextLayerOffset() {
    const textLayers = document.querySelectorAll(".react-pdf__Page__textContent");
    textLayers.forEach(layer => {
        const {style} = layer;
        style.top = "0";
        style.left = "0";
        style.transform = "";
    });
}

const index = elastic(function () {
    this.addField('text');
    this.setRef('page');
});

const docs = [];
const loaded = {};

const PdfContainer = (props) => {
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState([]);
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(false);
    const [highlighting, setHighlighting] = useState(true);

    const addPage = (page) => {
        setPages(prevPages => [...prevPages, page])
    };

    const frst = () => {
        setPage(pages[0]);
    };

    const prvs = (bool) => () => {
        if (!bool) {
            setPage(page => Math.max(page - 1, 1));
            return;
        }
        let breaking = false
        let pageSet = -1;
        pages.forEach((pageNumber, index) => {
            if (breaking) {
                return;
            }

            if (pageSet > pageNumber) {
                breaking = true;
                setPage(pages[index - 1])
            } else if (page > pageNumber) {
                setPage(pageNumber);
                breaking = true;
            } else {
                pageSet = pageNumber;
            }

        });
    }

    function makeTextRenderer(searchText) {
        if (highlighting) {
            return function textRenderer(textItem) {
                return highlightPattern(textItem.str, searchText);
            }
        }
    }

    const nxt = (bool) => () => {
        if (!bool) {
            setPage(page => Math.min(page + 1, pageCount));
            return;
        }

        let breaking = false;
        pages.forEach((pageNumber) => {
            if (!breaking && pageNumber > page) {
                setPage(pageNumber);
                breaking = true;
            }
        });
    };

    const qry = props.qry;
    const file = props.file;
    useEffect(() => {
        if (!qry || docs.indexOf(file) === -1) {
            setVisible(true);
            return;
        }

        setPages([]);

        let visible = false;
        const newPages = [];
        const results = index.search(qry);
        for (const match of results) {
            const ref = JSON.parse(match.ref);
            if (ref.file !== file || (match.score < .2 && results.length > 5)) {
                continue;
            }

            const pageNumber = Number(ref.number);
            newPages.push(pageNumber);
            visible = true;
        }
        newPages.sort();
        setPage(newPages.length ? newPages[0] : 1);
        setPages(newPages);

        setVisible(visible);
    }, [loading, file, qry]);

    useEffect(() => {

    }, [file]);

    const [pageCount, setPageCount] = useState(0);

    const onLoad = (pdf) => {

        const map = new Map();
        const collectLines = async () => {
            setLoading(true);
            try {
                for (let i = 1; i <= pdf.numPages; i++) {
                    addPage(i);
                    const page = await pdf.getPage(i);
                    const text = await page.getTextContent();

                    if (text.items) {
                        const body = text.items.reduce((acc, curr) => acc + " " + curr.str, "");
                        map.set(i, body);
                        index.addDoc({
                            'text': body,
                            'page': JSON.stringify({
                                file: props.file,
                                number: i
                            })
                        })
                    }
                }

            } catch (e) {
                //ignore
            }
        };

        if (docs.indexOf(props.file) === -1) {
            collectLines().then(() => {
                setLoading(false);
                docs.push(props.file);
            });
        }
        setPageCount(pdf.numPages);
    };

    if (!visible) {
        return <></>;
    }

    const loadingStyle = loading ? {
        opacity: .6
    } : {};

    return (
        <>
            <Grid item xs={6}>
                <span>{props.file}</span>
                <div className={'pdf-container'} style={loadingStyle}>

                    <Document file={props.file} onLoadSuccess={onLoad}>
                        <Page pageNumber={page}
                              width={775}
                              onLoadSuccess={removeTextLayerOffset}
                              customTextRenderer={makeTextRenderer(qry)}
                        />
                    </Document>
                    {loading && <CircularProgress className={'loader'}/>}
                    <ButtonGroup className={'btngrp'}>
                        <Button onClick={frst} variant='text' color='secondary'>First</Button>
                        <Button onClick={prvs(true)} variant='text' color='secondary'>Vorige Match</Button>
                        <Button onClick={prvs(false)} variant='text' color='secondary'>Vorige</Button>
                        <Button onClick={nxt(false)} variant='outlined' color='primary'>Volgende</Button>
                        <Button onClick={nxt(true)} variant='outlined' color='primary'>Volgende match</Button>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={highlighting}
                                    onChange={(evt, checked) => setHighlighting(checked)}
                                    name="checkedB"
                                    color="primary"
                                />
                            }
                            label="Highlight"
                        />
                        <span>{page} of {pageCount}</span>
                    </ButtonGroup>
                </div>
            </Grid>
        </>
    )
};

export default PdfContainer;
