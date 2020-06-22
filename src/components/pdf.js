import React, {useEffect, useRef, useState} from 'react';
import {Document, Page} from 'react-pdf';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';
import Fuse from 'fuse.js';

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

const PdfContainer = (props) => {
    const [lines, setLines] = useState(new Map());
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState([]);
    const [visible, setVisible] = useState(true);

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
    const timeout = useRef();
    useEffect(() => {
        clearTimeout(timeout.current);
        if (!qry) {
            setVisible(true);
            return;
        }

        timeout.current = setTimeout(() => {
            setPages([]);

            let visible = false;
            let setAgain = true;
            for (const [textPage, text] of lines.entries()) {
                if (text.toLowerCase().indexOf(qry.toLowerCase()) !== -1) {
                    if (setAgain) {
                        setPage(textPage);
                        setAgain = false;
                    }

                    addPage(textPage);
                    visible = true;
                }
            }

            setVisible(visible);
        }, 500);
    }, [qry, lines]);

    const [pageCount, setPageCount] = useState(0);

    const onLoad = (pdf) => {
        setLines(new Map());
        setPageCount(pdf.numPages);
        for (let i = 1; i <= pdf.numPages; i++) {
            addPage(i);
            pdf.getPage(i).then(res => {
                res.getTextContent().then(res2 => {
                    const text = res2.items.reduce((acc, curr) => acc + " " + curr.str, "");
                    setLines(prev => {
                        const map = new Map(prev);
                        map.set(i, text);
                        return map;
                    });
                }).catch(() => {
                });
            }).catch(() => {
            });
        }
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
                <ButtonGroup>
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