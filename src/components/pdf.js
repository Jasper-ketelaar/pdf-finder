import React, {useEffect, useState} from 'react';
import {Document, Page} from 'react-pdf';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import elastic from 'elasticlunr';

function highlightPattern(text, pattern) {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
        return text;
    }

    const matches = text.match(pattern);

    return splitText.reduce((arr, element, index) => (matches[index] ? [
        ...arr,
        element,
        <mark key={index}>
            {matches[index]}
        </mark>,
    ] : [...arr, element]), []);
}

const index = elastic(function() {
    this.addField('text');
    this.setRef('page');
});

const PdfContainer = (props) => {
    const [lines, setLines] = useState(new Map());
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState([]);
    const [visible, setVisible] = useState(true);
    const [index, setIndex] = useState();

    useEffect(() => {
        const index = elastic(function() {
            this.addField('text');
            this.setRef('page');
        });

        setIndex(index);
    }, []);

    const addPage = (page) => {
        setPages(prevPages => [...prevPages, page])
    };

    const frst = () => {
        setPage(pages[0]);
    };

    const prvs = (bool) => () => {
        if (!bool) {
            setPage(page => page - 1);
            return;
        }
        pages.forEach((pageNumber, index) => {
            if (index > 0 && pageNumber === page) {
                setPage(pages[index - 1]);
            }
        });
    };

    function makeTextRenderer(searchText) {
        if (searchText.length >= 5) {
            return function textRenderer(textItem) {
                return highlightPattern(textItem.str, searchText);
            }
        }
    }

    const nxt = (bool) => () => {
        if (!bool) {
            setPage(page => page + 1);
            return;
        }

        pages.forEach((pageNumber, index) => {
            if (index < pages.length - 1 && pageNumber === page) {
                setPage(pages[index + 1]);
            }
        });
    };

    const qry = props.qry;
    useEffect(() => {
        if (!qry || !lines || !lines.size) {
            setVisible(true);
            return;
        }

        setPages([]);

        let visible = false;
        let setAgain = true;
        for (const match of index.search(qry)) {
            const pageNumber = Number(match.ref);
            if (setAgain) {
                setPage(pageNumber);
                setAgain = false;
            }

            addPage(pageNumber);
            visible = true;
        }

        setVisible(visible);
    }, [qry, lines]);

    const [pageCount, setPageCount] = useState(0);

    const onLoad = (pdf) => {
        setPageCount(pdf.numPages);
        const map = new Map();
        const collectLines = async () => {
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
                            'page': i
                        })
                    }
                }
            } catch (e) {
                //ignore
            }
        };

        collectLines().then(() => {
            setLines(map);
        });
    };

    if (!visible) {
        return <></>;
    }

    return (
        <Grid item xs={6}>
            <span>{props.file}</span>
            <div className={'pdf-container'}>
                <Document file={props.file} onLoadSuccess={onLoad}>
                    <Page pageNumber={page}
                          width={775}

                          customTextRenderer={makeTextRenderer(qry)}
                    />
                </Document>
                <ButtonGroup className={'btngrp'}>
                    <Button onClick={frst} variant='text' color='secondary'>First</Button>
                    <Button onClick={prvs(true)} variant='text' color='secondary'>Vorige Match</Button>
                    <Button onClick={prvs(false)} variant='text' color='secondary'>Vorige</Button>
                    <Button onClick={nxt(false)} variant='outlined' color='primary'>Volgende</Button>
                    <Button onClick={nxt(true)} variant='outlined' color='primary'>Volgende match</Button>
                    <span>{page} of {pageCount}</span>
                </ButtonGroup>
            </div>
        </Grid>
    )
};

export default PdfContainer;