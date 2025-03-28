// LogContainer.jsx
import React, {useState, useEffect} from 'react';
import {Logs} from '@api/logs';
import LogMenu from './LogMenu';
import LogViewer from './LogViewer';

const LogContainer = () => {
    const [allLogFiles, setAllLogFiles] = useState([]);
    const [logTypes, setLogTypes] = useState(new Set());
    const [selectedType, setSelectedType] = useState('');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [filters, setFilters] = useState({lines: '', level: '', search: ''});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logContent, setLogContent] = useState([]);
    const [zoom, setZoom] = useState(0.7);

    useEffect(() => {
        fetchAllLogs();
    }, []);

    useEffect(() => {
        if (allLogFiles.length > 0) {
            // Extract unique log types from filenames
            const types = new Set(
                allLogFiles.map(f => {
                    const match = f.filename.match(/^([a-zA-Z]+)/);
                    return match ? match[1].toLowerCase() : 'other';
                })
            );
            setLogTypes(types);

            // Set initial type if not already set
            if (!selectedType && types.size > 0) {
                setSelectedType(Array.from(types)[0]);
            }
        }
    }, [allLogFiles]);

    useEffect(() => {
        if (selectedType) {
            const matched = allLogFiles
                .filter(f => {
                    const fileType =
                        f.filename.match(/^([a-zA-Z]+)/)?.[1].toLowerCase() ||
                        'other';
                    return fileType === selectedType;
                })
                .sort((a, b) => b.last_modified - a.last_modified);

            setFilteredFiles(matched);
            if (matched.length) {
                setSelectedFile(matched[0].filename);
            } else {
                setSelectedFile('');
                setLogContent([]);
            }
        }
    }, [selectedType, allLogFiles]);

    useEffect(() => {
        if (selectedFile) {
            const timeoutId = setTimeout(() => {
                applyFilters();
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [selectedFile, filters]);

    const fetchAllLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const list = await Logs.getLogsList();
            setAllLogFiles(list);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        if (!selectedFile) return;
        try {
            setLoading(true);
            setError('');
            setLogContent([]);
            const {lines, level, search} = filters;
            const result = await Logs.getLogContent(selectedFile, {
                lines: lines ? Number(lines) : undefined,
                level,
                search
            });
            let content = [];
            if (result && Array.isArray(result.content)) {
                content = [...result.content];
            } else if (typeof result === 'object' && result.content) {
                content = [result.content];
            } else if (typeof result === 'string') {
                content = [result];
            }
            setLogContent(content.reverse());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value}));
    };

    return (
        <div className='h-full flex flex-col space-y-4'>
            <LogMenu
                logTypes={Array.from(logTypes)}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                filteredFiles={filteredFiles}
                filters={filters}
                handleChange={handleChange}
            />
            <div className='flex-1'>
                <LogViewer
                    selectedFile={selectedFile}
                    zoom={zoom}
                    setZoom={setZoom}
                    loading={loading}
                    error={error}
                    logContent={logContent}
                />
            </div>
        </div>
    );
};

export default LogContainer;
